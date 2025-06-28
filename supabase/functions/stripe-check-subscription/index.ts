import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { userId } = await req.json();

    // Initialize Supabase client
    const supabaseClient = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
      apiVersion: "2024-06-20",
    });

    // Get service provider record
    const { data: serviceProvider, error: spError } = await supabaseClient
      .from("service_providers")
      .select("id, subscription_status")
      .eq("auth_user_id", userId)
      .single();

    if (spError) {
      console.error("Error fetching service provider:", spError);
      return new Response(JSON.stringify({ error: "Service provider not found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 404,
      });
    }

    // Get ALL subscriptions for this service provider (not just active ones)
    const { data: allSubscriptions, error: allSubsError } = await supabaseClient
      .from("subscriptions")
      .select("*")
      .eq("service_provider_id", serviceProvider.id)
      .order("created_at", { ascending: false });

    if (allSubsError) {
      console.error("Error fetching all subscriptions:", allSubsError);
      return new Response(JSON.stringify({ error: "Database error" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    const hasSubscriptionHistory = allSubscriptions && allSubscriptions.length > 0;

    // Find the most recent subscription
    const latestSubscription = allSubscriptions?.[0];

    if (latestSubscription) {
      try {
        const stripeSubscription = await stripe.subscriptions.retrieve(latestSubscription.stripe_subscription_id);

        // Force update local subscription status if it differs OR if cancel_at_period_end has changed
        const needsSync = stripeSubscription.status !== latestSubscription.status ||
                         stripeSubscription.cancel_at_period_end !== latestSubscription.cancel_at_period_end;

        if (needsSync) {
          console.log(`🔄 Syncing subscription data:`, {
            old_status: latestSubscription.status,
            new_status: stripeSubscription.status,
            old_cancel_at_period_end: latestSubscription.cancel_at_period_end,
            new_cancel_at_period_end: stripeSubscription.cancel_at_period_end
          });

          await supabaseClient
            .from("subscriptions")
            .update({
              status: stripeSubscription.status,
              current_period_start: new Date(stripeSubscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(stripeSubscription.current_period_end * 1000).toISOString(),
              cancel_at_period_end: stripeSubscription.cancel_at_period_end,
            })
            .eq("id", latestSubscription.id);

          // Also update service provider status
          const isActive = stripeSubscription.status === "active" || stripeSubscription.status === "trialing";
          await supabaseClient
            .from("service_providers")
            .update({ subscription_status: isActive ? "active" : "inactive" })
            .eq("id", serviceProvider.id);
        }

        return new Response(
          JSON.stringify({
            hasActiveSubscription: stripeSubscription.status === "active" || stripeSubscription.status === "trialing",
            hasSubscriptionHistory: hasSubscriptionHistory,
            subscription: {
              status: stripeSubscription.status,
              current_period_start: new Date(stripeSubscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(stripeSubscription.current_period_end * 1000).toISOString(),
              cancel_at_period_end: stripeSubscription.cancel_at_period_end,
              canceled_at: stripeSubscription.canceled_at
                ? new Date(stripeSubscription.canceled_at * 1000).toISOString()
                : null,
              trial_end: stripeSubscription.trial_end
                ? new Date(stripeSubscription.trial_end * 1000).toISOString()
                : null,
              plan_name: "Pro Plan",
              billing_cycle: stripeSubscription.items.data[0]?.price?.recurring?.interval || "month",
            },
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          }
        );
      } catch (stripeError) {
        console.error("Stripe error:", stripeError);
        return new Response(
          JSON.stringify({
            hasActiveSubscription: false,
            hasSubscriptionHistory: hasSubscriptionHistory,
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          }
        );
      }
    }

    // No subscriptions found at all
    return new Response(
      JSON.stringify({
        hasActiveSubscription: false,
        hasSubscriptionHistory: hasSubscriptionHistory,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (err) {
    console.error("Subscription check error:", err);
    return new Response(JSON.stringify({ error: "Failed to check subscription" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
