"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StepperProps {
  steps: {
    id: string;
    title: string;
    description: string;
  }[];
  currentStep: number;
  children: React.ReactNode;
  onNext?: () => void;
  onPrevious?: () => void;
  onComplete?: () => void;
  canGoNext?: boolean;
  canGoPrevious?: boolean;
  isLastStep?: boolean;
  isLoading?: boolean;
  isCompleting?: boolean;
}

export function Stepper({
  steps,
  currentStep,
  children,
  onNext,
  onPrevious,
  onComplete,
  canGoNext = true,
  canGoPrevious = true,
  isLastStep = false,
  isLoading = false,
  isCompleting = false,
}: StepperProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-center text-gray-900 mb-6">
            Complete Your Setup
          </h1>
          
          <div className="flex items-center justify-center">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors",
                    index < currentStep
                      ? "bg-green-500 border-green-500 text-white"
                      : index === currentStep
                      ? "bg-orange-500 border-orange-500 text-white"
                      : "bg-white border-gray-300 text-gray-400"
                  )}>
                    {index < currentStep ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )}
                  </div>
                  <div className="mt-2 text-center">
                    <p className={cn(
                      "text-sm font-medium",
                      index <= currentStep ? "text-gray-900" : "text-gray-400"
                    )}>
                      {step.title}
                    </p>
                    <p className={cn(
                      "text-xs",
                      index <= currentStep ? "text-gray-600" : "text-gray-400"
                    )}>
                      {step.description}
                    </p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={cn(
                    "h-0.5 w-16 mx-4 mt-5 transition-colors",
                    index < currentStep ? "bg-green-500" : "bg-gray-300"
                  )} />
                )}
              </div>
            ))}
          </div>
        </div>

        <Card className="border-2 border-orange-200">
          <CardHeader>
            <CardTitle>{steps[currentStep]?.title}</CardTitle>
            <CardDescription>{steps[currentStep]?.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {children}
            
            <div className="flex justify-between pt-4">
              <Button
                variant="outline"
                onClick={onPrevious}
                disabled={!canGoPrevious || currentStep === 0}
              >
                Previous
              </Button>
              
              <Button
                onClick={isLastStep ? onComplete : onNext}
                disabled={!canGoNext || isLoading || isCompleting}
                className="bg-orange-500 hover:bg-orange-600"
              >
                {isCompleting ? "Completing Setup..." : isLoading ? "Saving..." : isLastStep ? "Complete Setup" : "Next"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}