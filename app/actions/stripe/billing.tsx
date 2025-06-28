"use client";

import { Button } from "@/components/ui/button";
import { CreditCardIcon, CalendarIcon } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface BillingActionsProps {
  hasActiveSubscription: boolean;
  hasSubscriptionHistory: boolean;
  userId: string;
}

export function BillingActions({ hasActiveSubscription, hasSubscriptionHistory, userId }: BillingActionsProps) {
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

  return (
    <div className="flex gap-3">
      {hasActiveSubscription ? (
        <Button onClick={handleManageSubscription} className="flex-1">
          Manage Subscription
        </Button>
      ) : (
        <>
          <Button onClick={handleStartSubscription} className="flex-1">
            {hasSubscriptionHistory ? "Reactivate Subscription" : "Start Subscription"}
          </Button>
          {hasSubscriptionHistory && (
            <Button variant="outline" onClick={handleManageSubscription}>
              View History
            </Button>
          )}
        </>
      )}
    </div>
  );
}
