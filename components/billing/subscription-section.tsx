"use client";

import { useEffect } from "react";
import { BillingActions } from "@/app/actions/stripe/billing";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircleIcon, AlertCircleIcon, CreditCardIcon, Loader2 } from "lucide-react";
import { usePaymentProcessing } from "./payment-notification";
import { useSubscriptionStore } from "@/stores/subscription-store";

interface SubscriptionSectionProps {
  userId: string;
}

export function SubscriptionSection({ userId }: SubscriptionSectionProps) {
  const isPaymentProcessing = usePaymentProcessing();
  const {
    subscription,
    hasActiveSubscription,
    hasSubscriptionHistory,
    isSubscriptionCancelled,
    nextBillingDate,
    planName,
    isLoading,
    isPolling,
    checkSubscription,
    pollForActivation,
  } = useSubscriptionStore();

  // Initialize subscription data on mount
  useEffect(() => {
    checkSubscription(userId);
  }, [userId, checkSubscription]);

  const getStatusBadge = (status: string, isCancelled: boolean = false) => {
    if (isCancelled) {
      return (
        <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400">Cancelled</Badge>
      );
    }
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">Active</Badge>;
      case "trialing":
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">Trial</Badge>;
      case "canceled":
        return <Badge variant="destructive">Canceled</Badge>;
      case "past_due":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">Past Due</Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Poll for subscription activation when processing payment
  useEffect(() => {
    if (isPaymentProcessing && !hasActiveSubscription && !isPolling) {
      pollForActivation(userId);
    }
  }, [isPaymentProcessing, hasActiveSubscription, isPolling, pollForActivation, userId]);

  // Show loading state when payment is being processed and we haven't found an active subscription yet
  if (isPaymentProcessing && !hasActiveSubscription) {
    return (
      <div className="grid gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                <div>
                  <h3 className="text-lg font-semibold">Activating Your Subscription...</h3>
                  <p className="text-sm text-muted-foreground">Setting up your account and processing your payment</p>
                </div>
              </div>
              <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">Processing</Badge>
            </div>
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      <Card>
        <CardContent className="p-6">
          {hasActiveSubscription ? (
            <>
              {isSubscriptionCancelled ? (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <AlertCircleIcon className="h-8 w-8 text-orange-500" />
                      <div>
                        <h3 className="text-lg font-semibold">{planName} Plan - Cancelled</h3>
                        <p className="text-sm text-muted-foreground">
                          {nextBillingDate ? (
                            <>Subscription will end on: {formatDate(nextBillingDate)}</>
                          ) : (
                            <>Subscription has been cancelled</>
                          )}
                        </p>
                      </div>
                    </div>
                    {subscription?.subscription && getStatusBadge(subscription.subscription.status, true)}
                  </div>
                  <BillingActions
                    hasActiveSubscription={false}
                    hasSubscriptionHistory={true}
                    userId={userId}
                    subscription={subscription?.subscription}
                  />
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <CheckCircleIcon className="h-8 w-8 text-green-500" />
                      <div>
                        <h3 className="text-lg font-semibold">{planName} Plan Active</h3>
                        <p className="text-sm text-muted-foreground">
                          {nextBillingDate ? (
                            <>Next billing: {formatDate(nextBillingDate)}</>
                          ) : (
                            <>Active subscription</>
                          )}
                        </p>
                      </div>
                    </div>
                    {subscription?.subscription && getStatusBadge(subscription.subscription.status, false)}
                  </div>
                  <BillingActions
                    hasActiveSubscription={true}
                    hasSubscriptionHistory={true}
                    userId={userId}
                    subscription={subscription?.subscription}
                  />
                </>
              )}
            </>
          ) : hasSubscriptionHistory ? (
            <>
              <div className="text-center py-8">
                <AlertCircleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Subscription Expired</h3>
                <p className="text-zinc-600 mb-6">
                  Your subscription has expired. Choose a plan to continue using all features.
                </p>
                <BillingActions
                  hasActiveSubscription={false}
                  hasSubscriptionHistory={true}
                  userId={userId}
                  subscription={subscription?.subscription}
                />
              </div>
            </>
          ) : (
            <>
              <div className="text-center py-8">
                <CreditCardIcon className="h-12 w-12 text-zinc-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Subscription</h3>
                <p className="text-zinc-600 mb-6">Start your subscription to access all features.</p>
                <BillingActions
                  hasActiveSubscription={false}
                  hasSubscriptionHistory={false}
                  userId={userId}
                  subscription={subscription?.subscription}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
