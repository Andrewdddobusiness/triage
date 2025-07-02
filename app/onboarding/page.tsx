"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { Stepper } from "@/components/onboarding/stepper";
import { BusinessNameStep } from "@/components/onboarding/steps/business-name-step";
import { ServicesOfferedStep } from "@/components/onboarding/steps/services-offered-step";
import { SpecialtyStep } from "@/components/onboarding/steps/specialty-step";
import { ServiceAreaStep } from "@/components/onboarding/steps/service-area-step";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";

interface OnboardingFormData {
  businessName: string;
  ownerName: string;
  servicesOffered: string[];
  specialty: string[];
  serviceArea: string[];
}

const steps = [
  {
    id: "business-info",
    title: "Business Info",
    description: "Basic details",
  },
  {
    id: "services",
    title: "Services",
    description: "What you offer",
  },
  {
    id: "specialty",
    title: "Specialty",
    description: "Your expertise",
  },
  {
    id: "service-area",
    title: "Service Area",
    description: "Where you work",
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user, checkOnboarding, isAuthenticated, isLoading: authLoading } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState<OnboardingFormData>({
    businessName: "",
    ownerName: "",
    servicesOffered: [],
    specialty: [],
    serviceArea: [],
  });

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

  const canGoNext = () => {
    switch (currentStep) {
      case 0:
        return formData.businessName.trim() !== "" && formData.ownerName.trim() !== "";
      case 1:
        return formData.servicesOffered.length > 0;
      case 2:
        return formData.specialty.length > 0;
      case 3:
        return formData.serviceArea.length > 0;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    if (!user?.id) {
      toast.error("User not found");
      return;
    }

    setIsLoading(true);
    try {
      const supabase = createClient();

      const { error } = await supabase
        .from("service_providers")
        .update({
          business_name: formData.businessName,
          owner_name: formData.ownerName,
          services_offered: formData.servicesOffered,
          specialty: formData.specialty,
          service_area: formData.serviceArea,
          onboarding_status: "completed",
        })
        .eq("auth_user_id", user.id);

      if (error) {
        throw error;
      }

      toast.success("Onboarding completed successfully!");
      
      await checkOnboarding(user.id);
      router.push("/dashboard");
    } catch (error) {
      console.error("Error completing onboarding:", error);
      toast.error("Failed to complete onboarding. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <BusinessNameStep
            value={formData.businessName}
            onChange={(value) => setFormData({ ...formData, businessName: value })}
            ownerName={formData.ownerName}
            onOwnerNameChange={(value) => setFormData({ ...formData, ownerName: value })}
          />
        );
      case 1:
        return (
          <ServicesOfferedStep
            selectedServices={formData.servicesOffered}
            onChange={(services) => setFormData({ ...formData, servicesOffered: services })}
          />
        );
      case 2:
        return (
          <SpecialtyStep
            selectedSpecialties={formData.specialty}
            onChange={(specialties) => setFormData({ ...formData, specialty: specialties })}
          />
        );
      case 3:
        return (
          <ServiceAreaStep
            serviceAreas={formData.serviceArea}
            onChange={(areas) => setFormData({ ...formData, serviceArea: areas })}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Stepper
      steps={steps}
      currentStep={currentStep}
      onNext={handleNext}
      onPrevious={handlePrevious}
      onComplete={handleComplete}
      canGoNext={canGoNext()}
      canGoPrevious={currentStep > 0}
      isLastStep={currentStep === steps.length - 1}
      isLoading={isLoading}
    >
      {renderCurrentStep()}
    </Stepper>
  );
}