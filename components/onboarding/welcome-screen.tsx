"use client";
import { useState } from "react";
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

interface WelcomeScreenProps {
  userId: string;
  onComplete: () => void;
}

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

export function WelcomeScreen({ userId, onComplete }: WelcomeScreenProps) {
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const router = useRouter();

  const handleStartSubscription = async () => {
    try {
      setIsCreatingSession(true);
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
        body: JSON.stringify({ userId }),
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
      setIsCreatingSession(false);
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
            onClick={() => {
              console.log("Navigating to home page");
              router.push("/");
            }}
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

        <Card className="border-2 border-orange-200 bg-orange-50/50">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-orange-900">Ready to Get Started?</CardTitle>
            <CardDescription className="text-lg text-orange-700">
              You need an active subscription to access the dashboard. Choose your plan to start converting missed calls
              into opportunities.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center">
              <Button
                onClick={handleStartSubscription}
                disabled={isCreatingSession}
                size="lg"
                className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 text-lg"
              >
                {isCreatingSession ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Setting up...
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="mr-2 h-5 w-5" />
                    Start Your Subscription
                  </>
                )}
              </Button>
            </div>
            <p className="text-sm text-gray-600 text-center">30-day free trial • Cancel anytime • No setup fees</p>
            <p className="text-xs text-orange-600 text-center font-medium">
              A subscription is required to access the dashboard and start using Spaak's AI features.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
