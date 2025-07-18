"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircleIcon, Loader2 } from "lucide-react";
import HomeLayout from "@/components/layout/home-layout";
import { createClient } from "@/utils/supabase/client";

const plans = [
  {
    name: "Pro",
    id: "pro",
    price: "$59.99",
    period: "month",
    description: "Perfect for individual contractors and small businesses",
    features: [
      "20 missed calls per month",
      "Lead capture & qualification",
      "Basic analytics dashboard",
      "Priority support",
    ],
    popular: false,
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6 text-orange-500"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    name: "Business",
    id: "business",
    price: "$149.99",
    period: "month",
    description: "Ideal for growing teams and established businesses",
    features: ["Everything in Pro", "60 missed calls per month"],
    popular: true,
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6 text-orange-500"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
        />
      </svg>
    ),
  },
];

export default function PricingPage() {
  const [isCreatingSession, setIsCreatingSession] = useState<string | null>(null);

  const handleStartSubscription = async (planId: string) => {
    try {
      setIsCreatingSession(planId);
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        // Redirect to sign-up if not authenticated
        window.location.href = "/sign-up";
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/stripe-create-session`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ plan: planId }),
      });

      if (response.ok) {
        const { url } = await response.json();
        if (url) {
          window.location.href = url;
        }
      } else {
        console.error("Failed to create Stripe session");
      }
    } catch (error) {
      console.error("Error creating subscription session:", error);
    } finally {
      setIsCreatingSession(null);
    }
  };

  return (
    <HomeLayout>
      <div className="bg-background py-16">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-6 border border-primary/20">
              <span className="h-2 w-2 rounded-full bg-primary"></span>
              <span className="text-sm font-medium text-primary">Pricing</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
              Simple, transparent pricing
              <br />
              for every business
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Choose the perfect plan for your business needs. No hidden fees, no annual commitments.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16 pt-6">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`bg-card rounded-2xl shadow-lg border-2 transition-all duration-200 hover:shadow-xl relative ${
                  plan.popular
                    ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                    : "border-border hover:border-primary/50"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20">
                    <div className="bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-medium shadow-lg">
                      Most Popular
                    </div>
                  </div>
                )}

                <div className="p-8">
                  <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                    {plan.icon}
                  </div>

                  <h2 className="text-2xl font-bold mb-2 text-foreground">{plan.name}</h2>
                  <p className="text-muted-foreground text-base mb-6">{plan.description}</p>

                  <div className="flex items-baseline mb-6">
                    <span className="text-5xl font-bold text-foreground">{plan.price}</span>
                    <span className="text-muted-foreground ml-2 text-lg">/{plan.period}</span>
                  </div>

                  <Button
                    onClick={() => handleStartSubscription(plan.id)}
                    disabled={isCreatingSession !== null}
                    size="lg"
                    className={`w-full py-4 text-lg font-medium transition-all duration-200 ${
                      plan.popular
                        ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
                        : "bg-secondary border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                    }`}
                    variant={plan.popular ? "default" : "outline"}
                  >
                    {isCreatingSession === plan.id ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Setting up...
                      </>
                    ) : (
                      `Start ${plan.name} Plan`
                    )}
                  </Button>
                </div>

                <div className="border-t border-border p-8">
                  <h3 className="font-semibold mb-6 text-foreground">{plan.name} includes:</h3>
                  <ul className="space-y-4">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckCircleIcon className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">30-day free trial • Cancel anytime • No setup fees</p>
            <p className="text-sm text-muted-foreground">
              Need help choosing?{" "}
              <Link href="/support" className="text-primary hover:underline">
                Contact our team
              </Link>
            </p>
          </div>
        </div>
      </div>
    </HomeLayout>
  );
}
