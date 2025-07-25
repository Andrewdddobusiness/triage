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
      .select("id")
      .eq("auth_user_id", userId)
      .single();

    if (spError) {
      console.error("Service provider lookup error:", spError, "for userId:", userId);
      return new Response(JSON.stringify({ error: "Service provider not found", details: spError.message }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 404,
      });
    }

    // Get the most recent subscription to find Stripe customer ID
    const { data: subscriptions, error: subError } = await supabaseClient
      .from("subscriptions")
      .select("stripe_customer_id, stripe_subscription_id, status")
      .eq("service_provider_id", serviceProvider.id)
      .order("created_at", { ascending: false });

    if (subError || !subscriptions || subscriptions.length === 0) {
      console.error("Subscription lookup error:", subError, "for serviceProviderId:", serviceProvider.id);
      return new Response(JSON.stringify({ error: "No subscription found", details: subError?.message || "No subscriptions exist" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 404,
      });
    }

    // Use the most recent subscription's customer ID
    const subscription = subscriptions[0];
    
    if (!subscription.stripe_customer_id) {
      console.error("No Stripe customer ID found for serviceProviderId:", serviceProvider.id);
      return new Response(JSON.stringify({ error: "No Stripe customer ID found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 404,
      });
    }

    // Create customer portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: `${Deno.env.get("SUPABASE_URL")}/functions/v1/stripe-customer-portal-redirect`,
    });

    return new Response(JSON.stringify({ url: portalSession.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err) {
    console.error("Customer portal error:", err);
    return new Response(JSON.stringify({ 
      error: "Failed to create portal session", 
      details: err instanceof Error ? err.message : "Unknown error"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
