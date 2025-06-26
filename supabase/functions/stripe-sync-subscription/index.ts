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
    const { userId, forceSync = false } = await req.json();

    // Initialize Supabase client
    const supabaseClient = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
      apiVersion: "2024-06-20",
    });

    // Get service provider record
    const { data: serviceProvider, error: spError } = await supabaseClient
      .from("service_providers")
      .select("id, subscription_status, stripe_customer_id")
      .eq("auth_user_id", userId)
      .single();

    if (spError) {
      console.error("Error fetching service provider:", spError);
      return new Response(JSON.stringify({ error: "Service provider not found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 404,
      });
    }

    if (!serviceProvider.stripe_customer_id) {
      return new Response(JSON.stringify({ error: "No Stripe customer ID found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Get all subscriptions for this customer from Stripe
    const stripeSubscriptions = await stripe.subscriptions.list({
      customer: serviceProvider.stripe_customer_id,
      limit: 100,
    });

    // Get all local subscriptions for this service provider
    const { data: localSubscriptions, error: localSubsError } = await supabaseClient
      .from("subscriptions")
      .select("*")
      .eq("service_provider_id", serviceProvider.id)
      .order("created_at", { ascending: false });

    if (localSubsError) {
      console.error("Error fetching local subscriptions:", localSubsError);
      return new Response(JSON.stringify({ error: "Failed to fetch local subscriptions" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    const syncResults = {
      synced: 0,
      created: 0,
      updated: 0,
      errors: [] as string[],
      activeSubscription: null as any,
    };

    // Process each Stripe subscription
    for (const stripeSubscription of stripeSubscriptions.data) {
      try {
        // Find corresponding local subscription
        const localSubscription = localSubscriptions?.find(
          (sub) => sub.stripe_subscription_id === stripeSubscription.id
        );

        const subscriptionData = {
          service_provider_id: serviceProvider.id,
          stripe_subscription_id: stripeSubscription.id,
          stripe_customer_id: serviceProvider.stripe_customer_id,
          stripe_price_id: stripeSubscription.items.data[0]?.price?.id || null,
          status: stripeSubscription.status,
          current_period_start: new Date(stripeSubscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(stripeSubscription.current_period_end * 1000).toISOString(),
          cancel_at_period_end: stripeSubscription.cancel_at_period_end,
          canceled_at: stripeSubscription.canceled_at
            ? new Date(stripeSubscription.canceled_at * 1000).toISOString()
            : null,
          trial_end: stripeSubscription.trial_end ? new Date(stripeSubscription.trial_end * 1000).toISOString() : null,
        };

        if (!localSubscription) {
          // Create new subscription record
          const { error: insertError } = await supabaseClient.from("subscriptions").insert(subscriptionData);

          if (insertError) {
            console.error("Error creating subscription:", insertError);
            syncResults.errors.push(`Failed to create subscription ${stripeSubscription.id}: ${insertError.message}`);
          } else {
            syncResults.created++;
            console.log(`✅ Created subscription ${stripeSubscription.id}`);
          }
        } else {
          // Check if update is needed
          const needsUpdate =
            forceSync ||
            localSubscription.status !== stripeSubscription.status ||
            localSubscription.current_period_start !== subscriptionData.current_period_start ||
            localSubscription.current_period_end !== subscriptionData.current_period_end ||
            localSubscription.cancel_at_period_end !== stripeSubscription.cancel_at_period_end;

          if (needsUpdate) {
            const { error: updateError } = await supabaseClient
              .from("subscriptions")
              .update(subscriptionData)
              .eq("id", localSubscription.id);

            if (updateError) {
              console.error("Error updating subscription:", updateError);
              syncResults.errors.push(`Failed to update subscription ${stripeSubscription.id}: ${updateError.message}`);
            } else {
              syncResults.updated++;
              console.log(
                `🔄 Updated subscription ${stripeSubscription.id}: ${localSubscription.status} -> ${stripeSubscription.status}`
              );
            }
          }
        }

        // Track active subscription
        if (stripeSubscription.status === "active" || stripeSubscription.status === "trialing") {
          syncResults.activeSubscription = {
            id: stripeSubscription.id,
            status: stripeSubscription.status,
            current_period_end: subscriptionData.current_period_end,
          };
        }

        syncResults.synced++;
      } catch (error) {
        console.error(`Error processing subscription ${stripeSubscription.id}:`, error);
        syncResults.errors.push(
          `Error processing subscription ${stripeSubscription.id}: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      }
    }

    // Update service provider subscription status
    const hasActiveSubscription = syncResults.activeSubscription !== null;
    const hasSubscriptionHistory = stripeSubscriptions.data.length > 0;

    const { error: spUpdateError } = await supabaseClient
      .from("service_providers")
      .update({
        subscription_status: hasActiveSubscription ? "active" : "inactive",
      })
      .eq("id", serviceProvider.id);

    if (spUpdateError) {
      console.error("Error updating service provider:", spUpdateError);
      syncResults.errors.push(`Failed to update service provider status: ${spUpdateError.message}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        syncResults,
        hasActiveSubscription,
        hasSubscriptionHistory,
        activeSubscription: syncResults.activeSubscription,
        message: `Sync completed: ${syncResults.created} created, ${syncResults.updated} updated, ${syncResults.errors.length} errors`,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (err) {
    console.error("Sync error:", err);
    return new Response(
      JSON.stringify({
        error: "Failed to sync subscription",
        details: err instanceof Error ? err.message : String(err),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
