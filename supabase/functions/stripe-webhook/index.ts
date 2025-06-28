import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import Stripe from "https://esm.sh/stripe@14.21.0";

serve(async (req: Request) => {
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return new Response("No signature", { status: 400 });
  }

  try {
    const body = await req.text();
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
      apiVersion: "2024-06-20",
    });

    // Create crypto provider for Deno
    const cryptoProvider = Stripe.createSubtleCryptoProvider();

    // Use async version of constructEvent
    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      Deno.env.get("STRIPE_WEBHOOK_SECRET")!,
      undefined,
      cryptoProvider
    );

    // Initialize Supabase client
    const supabaseClient = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdateWithRetries(subscription, supabaseClient);
        break;
      }
      case "customer.subscription.deleted": {
        const deletedSubscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionCancellation(deletedSubscription, supabaseClient);
        break;
      }
      // Handle subscription cancellation events (when cancel_at_period_end is set)
      case "invoice.payment_succeeded":
      case "invoice.payment_failed": {
        // These events often accompany subscription status changes
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.subscription) {
          // Re-fetch and sync the subscription status
          const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
            apiVersion: "2024-06-20",
          });
          const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
          await handleSubscriptionUpdateWithRetries(subscription, supabaseClient);
        }
        break;
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err) {
    console.error("Webhook handler error:", err);
    return new Response(JSON.stringify({ error: "Webhook handler failed" }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});

// New function with grace period and retries
async function handleSubscriptionUpdateWithRetries(
  subscription: Stripe.Subscription,
  supabaseClient: any,
  attempt: number = 1
): Promise<void> {
  const maxAttempts = 3;
  const baseDelay = 2000; // 2 seconds
  const maxDelay = 8000; // 8 seconds max

  try {
    console.log(
      `🔄 Processing subscription update (attempt ${attempt}/${maxAttempts}):`,
      subscription.id,
      "Status:",
      subscription.status
    );

    // Add initial grace period for subscription.created events
    if (subscription.status === "incomplete" && attempt === 1) {
      console.log(`⏳ Grace period: Waiting 3 seconds for subscription to potentially become active...`);
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // Re-fetch the subscription from Stripe to get the latest status
      const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
        apiVersion: "2024-06-20",
      });

      try {
        const updatedSubscription = await stripe.subscriptions.retrieve(subscription.id);
        console.log(`🔍 Re-fetched subscription status:`, updatedSubscription.status);

        // Use the updated subscription data
        subscription = updatedSubscription;
      } catch (fetchError) {
        console.warn(`⚠️ Could not re-fetch subscription, using original data:`, fetchError);
      }
    }

    // Process the subscription update
    const success = await handleSubscriptionUpdate(subscription, supabaseClient);

    // If subscription is still incomplete and we haven't reached max attempts, retry
    if (subscription.status === "incomplete" && attempt < maxAttempts) {
      const delay = Math.min(baseDelay * attempt, maxDelay);
      console.log(`⏳ Subscription still incomplete, retrying in ${delay}ms (attempt ${attempt + 1}/${maxAttempts})`);

      await new Promise((resolve) => setTimeout(resolve, delay));
      return await handleSubscriptionUpdateWithRetries(subscription, supabaseClient, attempt + 1);
    }

    if (subscription.status === "incomplete" && attempt >= maxAttempts) {
      console.warn(`⚠️ Subscription ${subscription.id} still incomplete after ${maxAttempts} attempts`);
    } else {
      console.log(`✅ Successfully processed subscription ${subscription.id} with status: ${subscription.status}`);
    }
  } catch (error) {
    console.error(`❌ Error processing subscription update (attempt ${attempt}):`, error);

    // Retry on error if we haven't reached max attempts
    if (attempt < maxAttempts) {
      const delay = Math.min(baseDelay * attempt, maxDelay);
      console.log(`⏳ Retrying due to error in ${delay}ms (attempt ${attempt + 1}/${maxAttempts})`);

      await new Promise((resolve) => setTimeout(resolve, delay));
      return await handleSubscriptionUpdateWithRetries(subscription, supabaseClient, attempt + 1);
    } else {
      console.error(`❌ Failed to process subscription ${subscription.id} after ${maxAttempts} attempts:`, error);
      throw error;
    }
  }
}

// Updated original function to return success status
async function handleSubscriptionUpdate(subscription: Stripe.Subscription, supabaseClient: any): Promise<boolean> {
  try {
    // Get customer metadata to find service provider
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
      apiVersion: "2024-06-20",
    });
    const customer = await stripe.customers.retrieve(subscription.customer as string);

    // If period dates are null but subscription is active, re-fetch from Stripe to get latest data
    let finalSubscription = subscription;
    if ((!subscription.current_period_start || !subscription.current_period_end) && 
        (subscription.status === 'active' || subscription.status === 'trialing')) {
      
      console.log(`🔄 Period dates missing for active subscription ${subscription.id}, re-fetching from Stripe...`);
      
      try {
        finalSubscription = await stripe.subscriptions.retrieve(subscription.id);
        console.log(`✅ Re-fetched subscription with periods:`, {
          current_period_start: finalSubscription.current_period_start,
          current_period_end: finalSubscription.current_period_end,
          status: finalSubscription.status
        });
      } catch (fetchError) {
        console.warn(`⚠️ Could not re-fetch subscription ${subscription.id}:`, fetchError);
        // Continue with original subscription data
      }
    }

    const subscriptionData = {
      stripe_customer_id: finalSubscription.customer,
      stripe_subscription_id: finalSubscription.id,
      stripe_price_id: finalSubscription.items.data[0]?.price?.id,
      status: finalSubscription.status,
      current_period_start: finalSubscription.current_period_start
        ? new Date(finalSubscription.current_period_start * 1000).toISOString()
        : null,
      current_period_end: finalSubscription.current_period_end
        ? new Date(finalSubscription.current_period_end * 1000).toISOString()
        : null,
      cancel_at_period_end: finalSubscription.cancel_at_period_end,
    };

    console.log(`📊 Syncing subscription ${finalSubscription.id}:`, {
      status: finalSubscription.status,
      cancel_at_period_end: finalSubscription.cancel_at_period_end,
      canceled_at: finalSubscription.canceled_at,
      current_period_start: subscriptionData.current_period_start,
      current_period_end: subscriptionData.current_period_end
    });

    // First, try to find existing subscription by stripe_subscription_id
    const { data: existingSub, error: selectError } = await supabaseClient
      .from("subscriptions")
      .select("service_provider_id, id")
      .eq("stripe_subscription_id", subscription.id)
      .maybeSingle();

    if (selectError) {
      console.error("Error checking existing subscription:", selectError);
      return false;
    }

    let serviceProviderId = existingSub?.service_provider_id;

    // If no existing subscription found, get service provider ID from customer or subscription metadata
    if (!serviceProviderId) {
      // Try customer metadata first
      serviceProviderId = (customer as any).metadata?.service_provider_id;
      
      // If not in customer metadata, check subscription metadata
      if (!serviceProviderId) {
        serviceProviderId = subscription.metadata?.service_provider_id;
      }

      // If still no service provider ID, try to find by customer email
      if (!serviceProviderId && (customer as any).email) {
        const { data: serviceProvider } = await supabaseClient
          .from("service_providers")
          .select("id")
          .eq("auth_user_id", (
            await supabaseClient.auth.admin.getUserByEmail((customer as any).email)
          ).data.user?.id)
          .maybeSingle();

        serviceProviderId = serviceProvider?.id;
      }
    }

    if (!serviceProviderId) {
      console.error("No service provider ID found for subscription:", subscription.id);
      return false;
    }

    // Use upsert to handle both create and update cases
    const { error: upsertError } = await supabaseClient.from("subscriptions").upsert(
      {
        ...subscriptionData,
        service_provider_id: serviceProviderId,
      },
      {
        onConflict: "stripe_subscription_id",
      }
    );

    if (upsertError) {
      console.error("Error upserting subscription:", upsertError);
      return false;
    }

    // Update service provider subscription status
    // Consider subscription active if it's active or trialing, even if cancel_at_period_end is true
    // This allows access until the period actually ends
    const isActive = (subscription.status === "active" || subscription.status === "trialing");
    const { error: updateError } = await supabaseClient
      .from("service_providers")
      .update({ subscription_status: isActive ? "active" : "inactive" })
      .eq("id", serviceProviderId);

    if (updateError) {
      console.error("Error updating service provider:", updateError);
      return false;
    } else {
      const statusMessage = subscription.cancel_at_period_end 
        ? `${subscription.status} (cancelled, ends ${subscriptionData.current_period_end})`
        : subscription.status;
      console.log(
        `✅ ${existingSub ? "Updated" : "Created"} subscription:`,
        subscription.id,
        "Status:",
        statusMessage
      );
      return true;
    }
  } catch (error) {
    console.error("Error in handleSubscriptionUpdate:", error);
    return false;
  }
}

async function handleSubscriptionCancellation(subscription: Stripe.Subscription, supabaseClient: any) {
  await supabaseClient
    .from("subscriptions")
    .update({ status: "canceled" })
    .eq("stripe_subscription_id", subscription.id);

  // Update service provider status
  const { data: sub } = await supabaseClient
    .from("subscriptions")
    .select("service_provider_id")
    .eq("stripe_subscription_id", subscription.id)
    .single();

  if (sub) {
    await supabaseClient
      .from("service_providers")
      .update({ subscription_status: "inactive" })
      .eq("id", sub.service_provider_id);
  }
}
