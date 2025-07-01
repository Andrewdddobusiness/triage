"use client";

import { useQuery } from "@tanstack/react-query";
import { getOnboardingData, getSubscriptionData } from "@/app/actions/stripe/subscription";

export function useOnboarding(userId?: string) {
  const {
    data: onboardingResult,
    isLoading: onboardingLoading,
    error: onboardingError,
  } = useQuery({
    queryKey: ["onboarding", userId],
    queryFn: () => getOnboardingData(userId!),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: subscriptionResult, isLoading: subscriptionLoading } = useQuery({
    queryKey: ["subscription", userId],
    queryFn: () => getSubscriptionData(userId!),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    needsOnboarding: onboardingResult?.needsOnboarding ?? false,
    onboardingStatus: onboardingResult?.onboardingData?.onboarding_status,
    hasActiveSubscription: subscriptionResult?.hasActiveSubscription ?? false,
    subscription: subscriptionResult?.subscription,
    isLoading: onboardingLoading || subscriptionLoading,
    error: onboardingError || onboardingResult?.error || subscriptionResult?.error,
  };
}

export function useSubscription(userId?: string) {
  const {
    data: subscriptionResult,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["subscription", userId],
    queryFn: () => getSubscriptionData(userId!),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    subscription: subscriptionResult?.subscription,
    hasActiveSubscription: subscriptionResult?.hasActiveSubscription ?? false,
    hasSubscriptionHistory: subscriptionResult?.hasSubscriptionHistory ?? false,
    isLoading,
    error: error || subscriptionResult?.error,
    refetch,
  };
}
