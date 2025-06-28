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
    const { userId, forceSync = false, syncAll = false } = await req.json();

    // Initialize Supabase client
    const supabaseClient = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
      apiVersion: "2024-06-20",
    });

    let serviceProviders: any[] = [];

    if (syncAll) {
      // Get all service providers that have subscriptions (which contain the stripe_customer_id)
      const { data: allProviders, error: spError } = await supabaseClient
        .from("service_providers")
        .select(`
          id, 
          subscription_status, 
          auth_user_id,
          subscriptions!inner(stripe_customer_id)
        `)
        .not("subscriptions.stripe_customer_id", "is", null);

      if (spError) {
        console.error("Error fetching service providers:", spError);
        return new Response(JSON.stringify({ error: "Failed to fetch service providers" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        });
      }

      // Transform the data to flatten the stripe_customer_id
      serviceProviders = (allProviders || []).map(provider => ({
        id: provider.id,
        subscription_status: provider.subscription_status,
        auth_user_id: provider.auth_user_id,
        stripe_customer_id: provider.subscriptions[0]?.stripe_customer_id
      })).filter(provider => provider.stripe_customer_id);
      
      console.log(`🔄 Starting bulk sync for ${serviceProviders.length} service providers`);
    } else {
      // Get single service provider record with their subscription data
      const { data: serviceProviderData, error: spError } = await supabaseClient
        .from("service_providers")
        .select(`
          id, 
          subscription_status, 
          auth_user_id,
          subscriptions(stripe_customer_id)
        `)
        .eq("auth_user_id", userId)
        .single();

      if (spError) {
        console.error("Error fetching service provider:", spError);
        return new Response(JSON.stringify({ error: "Service provider not found" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 404,
        });
      }

      // Get the stripe_customer_id from the most recent subscription
      const stripeCustomerId = serviceProviderData.subscriptions?.[0]?.stripe_customer_id;
      
      if (!stripeCustomerId) {
        return new Response(JSON.stringify({ error: "No Stripe customer ID found" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        });
      }

      const serviceProvider = {
        id: serviceProviderData.id,
        subscription_status: serviceProviderData.subscription_status,
        auth_user_id: serviceProviderData.auth_user_id,
        stripe_customer_id: stripeCustomerId
      };

      serviceProviders = [serviceProvider];
    }

    const overallSyncResults = {
      totalProviders: serviceProviders.length,
      processedProviders: 0,
      successfulProviders: 0,
      failedProviders: 0,
      totalSynced: 0,
      totalCreated: 0,
      totalUpdated: 0,
      errors: [] as string[],
      providerResults: [] as any[],
    };

    // Process each service provider
    for (const serviceProvider of serviceProviders) {
      try {
        console.log(`🔄 Processing service provider ${serviceProvider.id} (${serviceProvider.stripe_customer_id})`);
        
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
          console.error(`Error fetching local subscriptions for provider ${serviceProvider.id}:`, localSubsError);
          overallSyncResults.errors.push(`Provider ${serviceProvider.id}: Failed to fetch local subscriptions - ${localSubsError.message}`);
          overallSyncResults.failedProviders++;
          continue;
        }

        const syncResults = {
          serviceProviderId: serviceProvider.id,
          synced: 0,
          created: 0,
          updated: 0,
          errors: [] as string[],
          activeSubscription: null as any,
        };

        // Process each Stripe subscription for this provider
        for (const stripeSubscription of stripeSubscriptions.data) {
      try {
        // Find corresponding local subscription
        const localSubscription = localSubscriptions?.find(
          (sub) => sub.stripe_subscription_id === stripeSubscription.id
        );

        // Handle potential null period dates for active subscriptions by re-fetching from Stripe
        let finalSubscription = stripeSubscription;
        if ((!stripeSubscription.current_period_start || !stripeSubscription.current_period_end) && 
            (stripeSubscription.status === 'active' || stripeSubscription.status === 'trialing')) {
          
          console.log(`🔄 Period dates missing for active subscription ${stripeSubscription.id}, re-fetching from Stripe...`);
          
          try {
            finalSubscription = await stripe.subscriptions.retrieve(stripeSubscription.id);
            console.log(`✅ Re-fetched subscription with periods:`, {
              current_period_start: finalSubscription.current_period_start,
              current_period_end: finalSubscription.current_period_end,
              status: finalSubscription.status
            });
          } catch (fetchError) {
            console.warn(`⚠️ Could not re-fetch subscription ${stripeSubscription.id}:`, fetchError);
            // Continue with original subscription data
          }
        }

        // Apply business logic for period dates based on subscription state
        const shouldClearPeriodDates = finalSubscription.status === "canceled";
        const shouldKeepPeriodDates = (
          finalSubscription.status === "active" || 
          finalSubscription.status === "trialing" ||
          (finalSubscription.cancel_at_period_end && finalSubscription.status !== "canceled")
        );

        const subscriptionData = {
          service_provider_id: serviceProvider.id,
          stripe_subscription_id: finalSubscription.id,
          stripe_customer_id: finalSubscription.customer,
          stripe_price_id: finalSubscription.items.data[0]?.price?.id || null,
          status: finalSubscription.status,
          current_period_start: shouldClearPeriodDates ? null : (
            finalSubscription.current_period_start
              ? new Date(finalSubscription.current_period_start * 1000).toISOString()
              : null
          ),
          current_period_end: shouldClearPeriodDates ? null : (
            finalSubscription.current_period_end
              ? new Date(finalSubscription.current_period_end * 1000).toISOString()
              : null
          ),
          cancel_at_period_end: finalSubscription.cancel_at_period_end,
          canceled_at: finalSubscription.canceled_at
            ? new Date(finalSubscription.canceled_at * 1000).toISOString()
            : null,
          trial_end: finalSubscription.trial_end ? new Date(finalSubscription.trial_end * 1000).toISOString() : null,
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
            localSubscription.status !== finalSubscription.status ||
            localSubscription.current_period_start !== subscriptionData.current_period_start ||
            localSubscription.current_period_end !== subscriptionData.current_period_end ||
            localSubscription.cancel_at_period_end !== finalSubscription.cancel_at_period_end ||
            // Force update if local period dates are null but Stripe has them
            (!localSubscription.current_period_start && subscriptionData.current_period_start) ||
            (!localSubscription.current_period_end && subscriptionData.current_period_end);

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
                `🔄 Updated subscription ${finalSubscription.id}: ${localSubscription.status} -> ${finalSubscription.status}`
              );
            }
          }
        }

        // Track active subscription
        if (finalSubscription.status === "active" || finalSubscription.status === "trialing") {
          syncResults.activeSubscription = {
            id: finalSubscription.id,
            status: finalSubscription.status,
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
        console.error(`Error updating service provider ${serviceProvider.id}:`, spUpdateError);
        syncResults.errors.push(`Failed to update service provider status: ${spUpdateError.message}`);
        overallSyncResults.errors.push(`Provider ${serviceProvider.id}: Failed to update status - ${spUpdateError.message}`);
      }

      // Add this provider's results to overall results
      overallSyncResults.totalSynced += syncResults.synced;
      overallSyncResults.totalCreated += syncResults.created;
      overallSyncResults.totalUpdated += syncResults.updated;
      overallSyncResults.errors.push(...syncResults.errors);
      overallSyncResults.providerResults.push({
        serviceProviderId: serviceProvider.id,
        ...syncResults,
        hasActiveSubscription,
        hasSubscriptionHistory,
      });

      if (syncResults.errors.length === 0) {
        overallSyncResults.successfulProviders++;
      } else {
        overallSyncResults.failedProviders++;
      }

      console.log(`✅ Completed provider ${serviceProvider.id}: ${syncResults.created} created, ${syncResults.updated} updated, ${syncResults.errors.length} errors`);

    } catch (error) {
      console.error(`❌ Error processing service provider ${serviceProvider.id}:`, error);
      overallSyncResults.errors.push(`Provider ${serviceProvider.id}: ${error instanceof Error ? error.message : String(error)}`);
      overallSyncResults.failedProviders++;
    }

    overallSyncResults.processedProviders++;
  }

    // Prepare response based on sync type
    if (syncAll) {
      return new Response(
        JSON.stringify({
          success: true,
          syncType: "bulk",
          overallResults: overallSyncResults,
          message: `Bulk sync completed: ${overallSyncResults.processedProviders}/${overallSyncResults.totalProviders} providers processed, ${overallSyncResults.totalCreated} created, ${overallSyncResults.totalUpdated} updated, ${overallSyncResults.errors.length} errors`,
          summary: {
            totalProviders: overallSyncResults.totalProviders,
            successfulProviders: overallSyncResults.successfulProviders,
            failedProviders: overallSyncResults.failedProviders,
            totalSubscriptions: overallSyncResults.totalSynced,
          }
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    } else {
      // Single provider sync - return original format for backward compatibility
      const singleResult = overallSyncResults.providerResults[0];
      return new Response(
        JSON.stringify({
          success: true,
          syncType: "single",
          syncResults: {
            synced: singleResult.synced,
            created: singleResult.created,
            updated: singleResult.updated,
            errors: singleResult.errors,
            activeSubscription: singleResult.activeSubscription,
          },
          hasActiveSubscription: singleResult.hasActiveSubscription,
          hasSubscriptionHistory: singleResult.hasSubscriptionHistory,
          activeSubscription: singleResult.activeSubscription,
          message: `Sync completed: ${singleResult.created} created, ${singleResult.updated} updated, ${singleResult.errors.length} errors`,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }
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
