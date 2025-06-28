"use client";

import { Button } from "@/components/ui/button";
import { SquareArrowOutUpRight } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface BillingActionsProps {
  hasActiveSubscription: boolean;
  hasSubscriptionHistory: boolean;
  userId: string;
  subscription?: {
    status: string;
    current_period_end: string;
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

  const handleManageSubscription = async () => {
    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        console.error("No active session");
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
      }
    } catch (error) {
      console.error("Error accessing customer portal:", error);
    }
  };

  // Smart logic to determine button behavior
  const getButtonConfig = () => {
    // Always show manage for active subscriptions (not cancelled)
    if (hasActiveSubscription && !subscription?.cancel_at_period_end) {
      return {
        text: "Manage Subscription",
        action: handleManageSubscription,
        description: "View billing history and manage your subscription",
      };
    }

    // Show reactivate for recently cancelled subscriptions
    if (subscription?.cancel_at_period_end || (subscription?.status === "canceled" && subscription?.canceled_at)) {
      const cancelDate = subscription.canceled_at ? new Date(subscription.canceled_at) : new Date();
      const periodEnd = new Date(subscription.current_period_end);
      const now = new Date();

      // Recently cancelled (within billing period) - show reactivate
      if (now <= periodEnd || now.getTime() - cancelDate.getTime() < 30 * 24 * 60 * 60 * 1000) {
        // 30 days
        return {
          text: "Reactivate Subscription",
          action: handleManageSubscription,
          description: "Resume your existing subscription",
        };
      }
    }

    // Default to create new for everything else
    return {
      text: hasSubscriptionHistory ? "Start New Subscription" : "Start Subscription",
      action: handleStartSubscription,
      description: hasSubscriptionHistory ? "Create a fresh subscription" : "Begin your subscription today",
    };
  };

  const buttonConfig = getButtonConfig();

  return (
    <div className="flex flex-col gap-3">
      <Button onClick={buttonConfig.action} className="w-full">
        {buttonConfig.text}
        <SquareArrowOutUpRight className="w-5 h-5 mr-2" />
      </Button>
      <p className="text-xs text-muted-foreground text-center">{buttonConfig.description}</p>
    </div>
  );
}
