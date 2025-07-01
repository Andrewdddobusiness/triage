"use server";

import { createClient } from "@/utils/supabase/server";

export interface SubscriptionData {
  id: string;
  status: string;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  canceled_at: string | null;
  stripe_subscription_id: string | null;
  stripe_customer_id: string | null;
}

export interface OnboardingData {
  id: string;
  auth_user_id: string;
  onboarding_status: "pending" | "completed";
  owner_name: string | null;
}

export async function getSubscriptionData(userId: string): Promise<{
  subscription: SubscriptionData | null;
  hasActiveSubscription: boolean;
  hasSubscriptionHistory: boolean;
  error?: string;
}> {
  try {
    const supabase = await createClient();

    // Get user's service provider record
    const { data: serviceProvider, error: spError } = await supabase
      .from("service_providers")
      .select("id")
      .eq("auth_user_id", userId)
      .single();

    if (spError || !serviceProvider) {
      return {
        subscription: null,
        hasActiveSubscription: false,
        hasSubscriptionHistory: false,
        error: "Service provider not found",
      };
    }

    // Get subscription data
    const { data: subscription, error: subError } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("service_provider_id", serviceProvider.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (subError) {
      return {
        subscription: null,
        hasActiveSubscription: false,
        hasSubscriptionHistory: false,
        error: subError.message,
      };
    }

    const hasActiveSubscription = subscription?.status === "active";
    const hasSubscriptionHistory = !!subscription;

    return {
      subscription,
      hasActiveSubscription,
      hasSubscriptionHistory,
    };
  } catch (error) {
    console.error("Error fetching subscription data:", error);
    return {
      subscription: null,
      hasActiveSubscription: false,
      hasSubscriptionHistory: false,
      error: "Failed to fetch subscription data",
    };
  }
}

export async function getOnboardingData(userId: string): Promise<{
  onboardingData: OnboardingData | null;
  needsOnboarding: boolean;
  error?: string;
}> {
  try {
    const supabase = await createClient();

    const { data: serviceProvider, error } = await supabase
      .from("service_providers")
      .select("*")
      .eq("auth_user_id", userId)
      .single();

    if (error || !serviceProvider) {
      return {
        onboardingData: null,
        needsOnboarding: false,
        error: "Service provider not found",
      };
    }

    // Get subscription status to determine if onboarding is needed
    const subscriptionResult = await getSubscriptionData(userId);
    const needsOnboarding =
      serviceProvider.onboarding_status === "pending" && !subscriptionResult.hasActiveSubscription;

    return {
      onboardingData: serviceProvider,
      needsOnboarding,
    };
  } catch (error) {
    console.error("Error fetching onboarding data:", error);
    return {
      onboardingData: null,
      needsOnboarding: false,
      error: "Failed to fetch onboarding data",
    };
  }
}

export async function markOnboardingComplete(userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from("service_providers")
      .update({ onboarding_status: "completed" })
      .eq("auth_user_id", userId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Error marking onboarding complete:", error);
    return { success: false, error: "Failed to update onboarding status" };
  }
}
