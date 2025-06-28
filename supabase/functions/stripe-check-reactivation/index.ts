import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ReactivationCheckResult {
  canReactivate: boolean;
  action: "portal" | "checkout";
  reason: string;
  stripeStatus?: string;
  localStatus?: string;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { userId } = await req.json();

    // Get the authenticated user
    const authHeader = req.headers.get("Authorization")!;
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      {
        global: { headers: { Authorization: authHeader } },
      }
    );

    const {
      data: { user },
    } = await supabaseClient.auth.getUser();
    
    if (!user || user.id !== userId) {
      throw new Error("User not authenticated or unauthorized");
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
      apiVersion: "2024-06-20",
    });

    // Get service provider data
    const { data: serviceProviderData, error: spError } = await supabaseClient
      .from("service_providers")
      .select("id, subscription_status, auth_user_id")
      .eq("auth_user_id", userId)
      .single();

    if (spError || !serviceProviderData) {
      console.error("Error fetching service provider:", spError);
      return new Response(
        JSON.stringify({
          error: "Service provider not found",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 404,
        }
      );
    }

    // Get the most recent subscription separately to ensure proper ordering
    const { data: subscriptions, error: subsError } = await supabaseClient
      .from("subscriptions")
      .select(`
        stripe_customer_id,
        stripe_subscription_id,
        status,
        current_period_end,
        cancel_at_period_end,
        created_at
      `)
      .eq("service_provider_id", serviceProviderData.id)
      .order("created_at", { ascending: false })
      .limit(1);

    if (subsError || !subscriptions || subscriptions.length === 0) {
      console.error("Error fetching subscriptions:", subsError);
      return new Response(
        JSON.stringify({
          error: "No subscription found",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 404,
        }
      );
    }

    // Get the most recent subscription
    const localSubscription = subscriptions[0];

    console.log(`📋 Local subscription data:`, {
      id: localSubscription.stripe_subscription_id,
      status: localSubscription.status,
      cancel_at_period_end: localSubscription.cancel_at_period_end,
      current_period_end: localSubscription.current_period_end,
      created_at: localSubscription.created_at,
    });
    
    if (!localSubscription?.stripe_subscription_id) {
      // No subscription found - user should create new one
      const result: ReactivationCheckResult = {
        canReactivate: false,
        action: "checkout",
        reason: "No existing subscription found",
      };

      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    console.log(`🔍 Checking real-time status for subscription ${localSubscription.stripe_subscription_id}`);

    // Check real-time subscription status in Stripe
    let stripeSubscription;
    try {
      stripeSubscription = await stripe.subscriptions.retrieve(localSubscription.stripe_subscription_id);
    } catch (stripeError) {
      console.error("Error fetching subscription from Stripe:", stripeError);
      
      // If subscription doesn't exist in Stripe anymore, create new one
      const result: ReactivationCheckResult = {
        canReactivate: false,
        action: "checkout",
        reason: "Subscription not found in Stripe (may have been deleted)",
        localStatus: localSubscription.status,
      };

      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const now = new Date();
    const periodEnd = stripeSubscription.current_period_end 
      ? new Date(stripeSubscription.current_period_end * 1000) 
      : null;

    console.log(`📊 Stripe subscription analysis:`, {
      id: stripeSubscription.id,
      status: stripeSubscription.status,
      cancel_at_period_end: stripeSubscription.cancel_at_period_end,
      canceled_at: stripeSubscription.canceled_at,
      current_period_end: periodEnd?.toISOString(),
      now: now.toISOString(),
    });

    // Decision logic based on real-time Stripe data
    let result: ReactivationCheckResult;

    // Case 1: Active subscription not cancelled
    if (stripeSubscription.status === "active" && !stripeSubscription.cancel_at_period_end) {
      result = {
        canReactivate: true,
        action: "portal",
        reason: "Active subscription - can manage via portal",
        stripeStatus: stripeSubscription.status,
        localStatus: localSubscription.status,
      };
    }
    // Case 2: Active subscription cancelled but still within billing period
    else if (
      stripeSubscription.status === "active" && 
      stripeSubscription.cancel_at_period_end && 
      periodEnd && 
      now <= periodEnd
    ) {
      result = {
        canReactivate: true,
        action: "portal",
        reason: "Cancelled but still within billing period - can reactivate via portal",
        stripeStatus: stripeSubscription.status,
        localStatus: localSubscription.status,
      };
    }
    // Case 3: Cancelled subscription that's still active/trialing (recent cancellation)
    else if (
      (stripeSubscription.status === "active" || stripeSubscription.status === "trialing") &&
      stripeSubscription.canceled_at
    ) {
      const cancelDate = new Date(stripeSubscription.canceled_at * 1000);
      const daysSinceCancellation = (now.getTime() - cancelDate.getTime()) / (24 * 60 * 60 * 1000);
      
      // Allow portal reactivation within 30 days of cancellation
      if (daysSinceCancellation <= 30) {
        result = {
          canReactivate: true,
          action: "portal",
          reason: "Recently cancelled (within 30 days) - can reactivate via portal",
          stripeStatus: stripeSubscription.status,
          localStatus: localSubscription.status,
        };
      } else {
        result = {
          canReactivate: false,
          action: "checkout",
          reason: "Cancelled more than 30 days ago - create new subscription",
          stripeStatus: stripeSubscription.status,
          localStatus: localSubscription.status,
        };
      }
    }
    // Case 4: Fully cancelled/expired subscription
    else if (stripeSubscription.status === "canceled" || stripeSubscription.status === "incomplete_expired") {
      result = {
        canReactivate: false,
        action: "checkout",
        reason: "Subscription fully cancelled/expired - create new subscription",
        stripeStatus: stripeSubscription.status,
        localStatus: localSubscription.status,
      };
    }
    // Case 5: Cancelled subscription past billing period
    else if (
      stripeSubscription.cancel_at_period_end && 
      periodEnd && 
      now > periodEnd
    ) {
      result = {
        canReactivate: false,
        action: "checkout",
        reason: "Subscription expired past billing period - create new subscription",
        stripeStatus: stripeSubscription.status,
        localStatus: localSubscription.status,
      };
    }
    // Case 6: Other statuses (incomplete, past_due, etc.)
    else {
      result = {
        canReactivate: false,
        action: "checkout",
        reason: `Subscription status '${stripeSubscription.status}' requires new subscription`,
        stripeStatus: stripeSubscription.status,
        localStatus: localSubscription.status,
      };
    }

    console.log(`✅ Reactivation check result:`, result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (err) {
    console.error("Reactivation check error:", err);
    
    // On error, default to checkout (safer)
    const fallbackResult: ReactivationCheckResult = {
      canReactivate: false,
      action: "checkout",
      reason: "Error checking subscription status - defaulting to new subscription",
    };

    return new Response(JSON.stringify(fallbackResult), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  }
});