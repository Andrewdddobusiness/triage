"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SquareArrowOutUpRight, Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface BillingActionsProps {
  hasActiveSubscription: boolean;
  hasSubscriptionHistory: boolean;
  userId: string;
  subscription?: {
    status: string;
    current_period_end: string | null;
    cancel_at_period_end: boolean;
    canceled_at?: string;
  };
}

export function BillingActions({
  hasActiveSubscription,
  hasSubscriptionHistory,
  userId,
  subscription,
}: BillingActionsProps) {
  const [isCheckingStripe, setIsCheckingStripe] = useState(false);

  const checkReactivationStatus = async () => {
    try {
      setIsCheckingStripe(true);
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        console.error("No active session");
        return null;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/stripe-check-reactivation`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: userId }),
      });

      if (response.ok) {
        const result = await response.json();
        return result;
      } else {
        const errorData = await response.json();
        console.error("Error checking reactivation status:", errorData);
        return null;
      }
    } catch (error) {
      console.error("Error checking reactivation status:", error);
      return null;
    } finally {
      setIsCheckingStripe(false);
    }
  };

  const handleStartSubscription = async () => {
    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        console.error("No active session");
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/stripe-create-session`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: userId }),
      });

      if (response.ok) {
        const { url } = await response.json();
        window.location.href = url;
      } else {
        const errorData = await response.json();
        console.error("Error creating checkout session:", errorData);
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
    }
  };

  const handleManageSubscription = async (fallbackToCheckout = false) => {
    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        console.error("No active session");
        if (fallbackToCheckout) {
          await handleStartSubscription();
        }
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/stripe-customer-portal`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: userId }),
      });

      if (response.ok) {
        const { url } = await response.json();
        window.location.href = url;
      } else {
        const errorData = await response.json();
        console.error("Error accessing customer portal:", errorData);

        // If portal fails and fallback is enabled, try checkout instead
        if (fallbackToCheckout) {
          await handleStartSubscription();
        }
      }
    } catch (error) {
      console.error("Error accessing customer portal:", error);

      // If portal fails and fallback is enabled, try checkout instead
      if (fallbackToCheckout) {
        await handleStartSubscription();
      }
    }
  };

  const handleSmartReactivation = async () => {
    // For subscriptions with history, check Stripe first to determine the right action
    const reactivationStatus = await checkReactivationStatus();

    if (!reactivationStatus) {
      // If check failed, default to checkout (safer)
      await handleStartSubscription();
      return;
    }

    if (reactivationStatus.action === "portal") {
      // Try portal first, but fallback to checkout if it fails
      await handleManageSubscription(true);
    } else {
      await handleStartSubscription();
    }
  };

  // Simplified logic using real-time Stripe checks
  const getButtonConfig = () => {
    // Always show manage for active subscriptions (not cancelled)
    if (hasActiveSubscription && !subscription?.cancel_at_period_end) {
      return {
        text: "Manage Subscription",
        action: () => handleManageSubscription(false),
        description: "View billing history and manage your subscription",
      };
    }

    // For any subscription history (cancelled, expired, etc.), use smart reactivation
    if (hasSubscriptionHistory) {
      return {
        text: "Reactivate Subscription",
        action: handleSmartReactivation,
      };
    }

    // For completely new users
    return {
      text: "Start Subscription",
      action: handleStartSubscription,
      description: "Begin your subscription today",
    };
  };

  const buttonConfig = getButtonConfig();

  return (
    <div className="flex flex-col gap-3">
      <Button onClick={buttonConfig.action} className="w-full" disabled={isCheckingStripe}>
        {isCheckingStripe ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Pending...
          </>
        ) : (
          <>
            {buttonConfig.text}
            <SquareArrowOutUpRight className="w-5 h-5 mr-2" />
          </>
        )}
      </Button>
      <p className="text-xs text-muted-foreground text-center">
        {isCheckingStripe ? "Verifying subscription status with Stripe..." : buttonConfig.description}
      </p>
    </div>
  );
}
