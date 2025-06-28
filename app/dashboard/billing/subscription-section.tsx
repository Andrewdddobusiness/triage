"use client";

import { useEffect, useState, useCallback } from "react";
import { BillingActions } from "@/app/actions/stripe/billing";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  CheckCircleIcon, 
  AlertCircleIcon, 
  CreditCardIcon,
  Loader2
} from "lucide-react";
import { usePaymentProcessing } from "./payment-notification";

interface SubscriptionData {
  hasActiveSubscription: boolean;
  hasSubscriptionHistory: boolean;
  subscription?: {
    status: string;
    current_period_start: string | null;
    current_period_end: string | null;
    cancel_at_period_end: boolean;
    canceled_at?: string;
    trial_end?: string;
    billing_cycle: string;
    plan_name?: string;
  };
}

interface SubscriptionSectionProps {
  subscriptionData: SubscriptionData;
  userId: string;
}

export function SubscriptionSection({ subscriptionData, userId }: SubscriptionSectionProps) {
  const isPaymentProcessing = usePaymentProcessing();
  const [isPolling, setIsPolling] = useState(false);
  const [currentData, setCurrentData] = useState(subscriptionData);

  // Helper function to check if subscription is cancelled but still active
  const isSubscriptionCancelled = (subscription?: SubscriptionData['subscription']) => {
    return subscription?.cancel_at_period_end === true && subscription?.status === 'active';
  };

  const getStatusBadge = (status: string, isCancelled: boolean = false) => {
    if (isCancelled) {
      return <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400">Cancelled</Badge>;
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

  const checkSubscriptionStatus = useCallback(async (): Promise<SubscriptionData | null> => {
    try {
      const { createClient } = await import("@/utils/supabase/client");
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return null;

      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/stripe-check-subscription`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });

      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error("Error checking subscription:", error);
    }
    return null;
  }, []);

  // Poll for subscription activation when processing payment
  useEffect(() => {
    if (!isPaymentProcessing || isPolling) return;

    let attempts = 0;
    const maxAttempts = 8; // Reduced to 8 attempts over ~20 seconds
    setIsPolling(true);

    const poll = async () => {
      const data = await checkSubscriptionStatus();
      attempts++;
      
      if (data?.hasActiveSubscription) {
        // Found active subscription, update the data and stop polling
        setCurrentData(data);
        setIsPolling(false);
        
        // Refresh page after a short delay to clear the URL
        setTimeout(() => {
          window.location.reload();
        }, 2000);
        return;
      }
      
      if (attempts < maxAttempts) {
        // Continue polling
        setTimeout(poll, 2500);
      } else {
        // Stop polling after max attempts
        setIsPolling(false);
        
        // Refresh page to clear URL and show latest state
        setTimeout(() => {
          window.location.reload();
        }, 3000);
      }
    };
    
    // Start polling after a short delay
    setTimeout(poll, 2000);
  }, [isPaymentProcessing, isPolling, checkSubscriptionStatus]);

  // Show loading state when payment is being processed and we haven't found an active subscription yet
  if (isPaymentProcessing && !currentData.hasActiveSubscription) {
    return (
      <div className="grid gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                <div>
                  <h3 className="text-lg font-semibold">Activating Your Subscription...</h3>
                  <p className="text-sm text-muted-foreground">
                    Setting up your account and processing your payment
                  </p>
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
          {currentData.hasActiveSubscription ? (
            <>
              {isSubscriptionCancelled(currentData.subscription) ? (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <AlertCircleIcon className="h-8 w-8 text-orange-500" />
                      <div>
                        <h3 className="text-lg font-semibold">Pro Plan - Cancelled</h3>
                        <p className="text-sm text-muted-foreground">
                          {currentData.subscription?.current_period_end ? (
                            <>Subscription will end on: {formatDate(currentData.subscription.current_period_end)}</>
                          ) : (
                            <>Subscription has been cancelled</>
                          )}
                        </p>
                      </div>
                    </div>
                    {currentData.subscription && getStatusBadge(currentData.subscription.status, true)}
                  </div>
                  <BillingActions 
                    hasActiveSubscription={false} 
                    hasSubscriptionHistory={true} 
                    userId={userId}
                    subscription={currentData.subscription}
                  />
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <CheckCircleIcon className="h-8 w-8 text-green-500" />
                      <div>
                        <h3 className="text-lg font-semibold">Pro Plan Active</h3>
                        <p className="text-sm text-muted-foreground">
                          {currentData.subscription?.current_period_end ? (
                            <>Next billing: {formatDate(currentData.subscription.current_period_end)}</>
                          ) : (
                            <>Active subscription</>
                          )}
                        </p>
                      </div>
                    </div>
                    {currentData.subscription && getStatusBadge(currentData.subscription.status, false)}
                  </div>
                  <BillingActions 
                    hasActiveSubscription={true} 
                    hasSubscriptionHistory={true} 
                    userId={userId}
                    subscription={currentData.subscription}
                  />
                </>
              )}
            </>
          ) : currentData.hasSubscriptionHistory ? (
            <>
              <div className="text-center py-8">
                <AlertCircleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Subscription Expired</h3>
                <p className="text-zinc-600 mb-6">
                  Your subscription has expired. Start a new subscription to continue using all features.
                </p>
                <BillingActions 
                  hasActiveSubscription={false} 
                  hasSubscriptionHistory={true} 
                  userId={userId}
                  subscription={currentData.subscription}
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
                  subscription={currentData.subscription}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}