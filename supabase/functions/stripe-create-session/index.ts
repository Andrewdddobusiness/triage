import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Parse request body to get the plan
    const { plan } = await req.json();
    
    // Define plan to Price ID mapping
    const planPriceMap = {
      pro: Deno.env.get("STRIPE_PRICE_ID_PRO")!,
      business: Deno.env.get("STRIPE_PRICE_ID_BUSINESS")!,
    } as const;
    
    // Validate plan parameter
    if (!plan || !Object.keys(planPriceMap).includes(plan)) {
      throw new Error(`Invalid plan. Must be one of: ${Object.keys(planPriceMap).join(", ")}`);
    }
    
    // Get the corresponding Price ID
    const priceId = planPriceMap[plan as keyof typeof planPriceMap];
    if (!priceId) {
      throw new Error(`Price ID not configured for plan: ${plan}`);
    }

    // Get the authenticated user
    const authHeader = req.headers.get("Authorization")!;
    const supabaseClient = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_ANON_KEY") ?? "", {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
    } = await supabaseClient.auth.getUser();
    if (!user) {
      throw new Error("User not authenticated");
    }

    // Use the authenticated user's email
    const email = user.email;
    if (!email) {
      throw new Error("User email not found");
    }

    // Get the service provider ID
    const { data: serviceProvider } = await supabaseClient
      .from("service_providers")
      .select("id")
      .eq("auth_user_id", user.id)
      .single();

    if (!serviceProvider) {
      throw new Error("Service provider not found");
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
      apiVersion: "2024-06-20",
    });

    // Check for existing subscription/customer first
    const { data: existingSubscription } = await supabaseClient
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("service_provider_id", serviceProvider.id)
      .maybeSingle();

    let sessionParams: any = {
      line_items: [
        {
          price: priceId, // Use the dynamically selected Price ID
          quantity: 1,
        },
      ],
      mode: "subscription",
      metadata: {
        service_provider_id: serviceProvider.id,
        auth_user_id: user.id,
        plan: plan, // Include the plan in metadata for tracking
      },
      success_url: `${Deno.env.get("SUPABASE_URL")}/functions/v1/stripe-payment-redirect?status=success`,
      cancel_url: `${Deno.env.get("SUPABASE_URL")}/functions/v1/stripe-payment-redirect?status=cancelled`,
      billing_address_collection: "required",
      payment_method_types: ["card"],
      subscription_data: {
        metadata: {
          service_provider_id: serviceProvider.id,
          auth_user_id: user.id,
          plan: plan, // Include the plan in subscription metadata too
        },
      },
    };

    if (existingSubscription?.stripe_customer_id) {
      // Use existing customer - email will be prefilled from customer record
      sessionParams.customer = existingSubscription.stripe_customer_id;
      console.log("Using existing customer:", existingSubscription.stripe_customer_id);
    } else {
      // For new customers, use customer_email to prefill the email field
      sessionParams.customer_email = email;
      console.log("Creating session with customer_email:", email);
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err) {
    console.error("Stripe error:", err);
    return new Response(JSON.stringify({ error: err.message || "Failed to create subscription session" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
