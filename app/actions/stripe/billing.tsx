"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SquareArrowOutUpRight, Loader2, CheckCircleIcon } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

const plans = [
  {
    name: "Pro",
    id: "pro",
    price: "$59.99",
    description: "Perfect for individual contractors",
    features: ["Unlimited calls", "AI analysis", "Basic analytics"],
  },
  {
    name: "Business",
    id: "business",
    price: "$149.99",
    description: "Ideal for growing businesses",
    features: ["Everything in Pro", "Team tools", "Advanced analytics"],
  },
];

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
  const [isCreatingSession, setIsCreatingSession] = useState<string | null>(null);

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

  const handleStartSubscription = async (planId?: string) => {
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
        body: JSON.stringify({ plan: planId || "pro" }),
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

  const handleSmartReactivation = async (planId?: string) => {
    // For subscriptions with history, check Stripe first to determine the right action
    const reactivationStatus = await checkReactivationStatus();

    if (!reactivationStatus) {
      // If check failed, default to checkout (safer)
      await handleStartSubscription(planId);
      return;
    }

    if (reactivationStatus.action === "portal") {
      // Try portal first, but fallback to checkout if it fails
      await handleManageSubscription(true);
    } else {
      await handleStartSubscription(planId);
    }
  };

  const handlePlanSelection = async (planId: string) => {
    setIsCreatingSession(planId);
    if (hasSubscriptionHistory) {
      await handleSmartReactivation(planId);
    } else {
      await handleStartSubscription(planId);
    }
    setIsCreatingSession(null);
  };

  // Show manage button for active subscriptions
  if (hasActiveSubscription && !subscription?.cancel_at_period_end) {
    return (
      <div className="flex flex-col gap-3">
        <Button onClick={() => handleManageSubscription(false)} className="w-full" disabled={isCheckingStripe}>
          {isCheckingStripe ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Pending...
            </>
          ) : (
            <>
              Manage Subscription
              <SquareArrowOutUpRight className="w-5 h-5 mr-2" />
            </>
          )}
        </Button>
        <p className="text-xs text-muted-foreground text-center">
          {isCheckingStripe
            ? "Verifying subscription status with Stripe..."
            : "View billing history and manage your subscription"}
        </p>
      </div>
    );
  }

  // Show plan selection for new users or reactivation
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        {plans.map((plan) => (
          <div key={plan.id} className="border rounded-lg p-4 hover:border-primary/50 transition-colors">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-semibold">{plan.name}</h3>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold">{plan.price}</div>
                <div className="text-sm text-muted-foreground">/month</div>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              {plan.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <CheckCircleIcon className="h-4 w-4 text-primary flex-shrink-0" />
                  <span className="text-muted-foreground">{feature}</span>
                </div>
              ))}
            </div>

            <Button
              onClick={() => handlePlanSelection(plan.id)}
              className="w-full"
              disabled={isCreatingSession !== null}
              variant={plan.id === "business" ? "default" : "outline"}
            >
              {isCreatingSession === plan.id ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Setting up...
                </>
              ) : (
                `${hasSubscriptionHistory ? "Reactivate" : "Start"} ${plan.name} Plan`
              )}
            </Button>
          </div>
        ))}
      </div>

      <p className="text-xs text-muted-foreground text-center">
        {isCreatingSession ? "Setting up your subscription..." : "30-day free trial • Cancel anytime"}
      </p>
    </div>
  );
}
