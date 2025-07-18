"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircleIcon,
  PhoneIcon,
  BrainCircuitIcon,
  ClockIcon,
  TrendingUpIcon,
  Loader2,
  ArrowLeftIcon,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";

const benefits = [
  {
    icon: PhoneIcon,
    title: "Never Miss Important Calls",
    description: "AI handles missed calls professionally, capturing leads and scheduling appointments",
  },
  {
    icon: BrainCircuitIcon,
    title: "Intelligent Call Analysis",
    description: "Advanced AI understands context and responds appropriately to each caller",
  },
  {
    icon: ClockIcon,
    title: "24/7 Availability",
    description: "Your AI assistant works around the clock, even when you can't",
  },
  {
    icon: TrendingUpIcon,
    title: "Boost Revenue",
    description: "Convert more leads by ensuring every call gets professional attention",
  },
];

const plans = [
  {
    name: "Pro",
    id: "pro",
    price: "$59.99",
    period: "month",
    description: "Perfect for individual contractors and small businesses",
    features: ["20 missed calls per month", "Lead capture & qualification", "Basic analytics dashboard"],
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
    description: "Ideal for growing teams and established medium to large businesses",
    features: ["Everything in Pro", "60 missed calls per month", "Priority support"],
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

export default function SubscribePage() {
  const [isCreatingSession, setIsCreatingSession] = useState<string | null>(null);
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();

  // Handle authentication redirect in useEffect
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !user)) {
      router.push("/sign-in");
    }
  }, [isAuthenticated, user, authLoading, router]);

  // Show loading while auth is being checked
  if (authLoading || !isAuthenticated || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p>{authLoading ? "Loading..." : "Redirecting to sign in..."}</p>
        </div>
      </div>
    );
  }

  const handleStartSubscription = async (planId: string) => {
    try {
      setIsCreatingSession(planId);
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Back to Home Button */}
        <div className="mb-6">
          <Button
            variant="outline"
            className="border-orange-200 text-orange-600 hover:bg-orange-50"
            onClick={() => router.push("/")}
          >
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to <span className="text-orange-500">Spaak</span>! 🎉
          </h1>
          <p className="text-xl text-gray-600 mb-2">Your AI Secretary for Handling Missed Calls</p>
          <Badge variant="secondary" className="text-sm bg-orange-100 text-orange-800">
            Transform every missed call into an opportunity
          </Badge>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <Card key={index} className="border-2 hover:border-orange-200 transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Icon className="h-6 w-6 text-orange-600" />
                    </div>
                    <CardTitle className="text-lg">{benefit.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{benefit.description}</CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-orange-900 mb-4">Choose Your Plan</h2>
          <p className="text-lg text-orange-700">
            Select the perfect plan for your business needs to start converting missed calls into opportunities.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-8 pt-6">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`border-2 transition-all duration-200 hover:shadow-xl relative ${
                plan.popular
                  ? "border-orange-300 bg-orange-50/70 ring-2 ring-orange-200"
                  : "border-orange-200 hover:border-orange-300"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20">
                  <div className="bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
                    Most Popular
                  </div>
                </div>
              )}

              <CardHeader className="pb-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-orange-100 rounded-lg">{plan.icon}</div>
                  <CardTitle className="text-2xl text-orange-900">{plan.name}</CardTitle>
                </div>
                <CardDescription className="text-base text-orange-700">{plan.description}</CardDescription>

                <div className="flex items-baseline mt-4">
                  <span className="text-4xl font-bold text-orange-900">{plan.price}</span>
                  <span className="text-orange-600 ml-2 text-lg">/{plan.period}</span>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <Button
                  onClick={() => handleStartSubscription(plan.id)}
                  disabled={isCreatingSession !== null}
                  size="lg"
                  className={`w-full py-3 text-lg font-medium transition-all duration-200 ${
                    plan.popular
                      ? "bg-orange-500 hover:bg-orange-600 text-white shadow-lg"
                      : "bg-white border-2 border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white"
                  }`}
                  variant={plan.popular ? "default" : "outline"}
                >
                  {isCreatingSession === plan.id ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Setting up...
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon className="mr-2 h-5 w-5" />
                      Start {plan.name} Plan
                    </>
                  )}
                </Button>

                <div className="border-t border-orange-200 pt-4">
                  <p className="font-semibold mb-3 text-orange-900">{plan.name} includes:</p>
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircleIcon className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-orange-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <p className="text-sm text-orange-600 mb-2">30-day free trial • Cancel anytime • No setup fees</p>
          <p className="text-xs text-orange-700 font-medium">
            A subscription is required to access the dashboard and start using Spaak's AI features.
          </p>
        </div>
      </div>
    </div>
  );
}
