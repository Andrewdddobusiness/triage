"use client";

import { useState, useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Bot, Phone, AlertTriangle } from "lucide-react";
import { checkSetupStatus, SetupStatus } from "@/app/actions/check-setup-status";
import { AssistantSetupModal, Step } from "./assistant-setup-modal";

interface SetupAlertProps {
  className?: string;
}

export function SetupAlert({ className }: SetupAlertProps) {
  const [setupStatus, setSetupStatus] = useState<SetupStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalStep, setModalStep] = useState<Step>("assistant-setup");

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      const result = await checkSetupStatus();
      if (result.success && result.status) {
        setSetupStatus(result.status);
      }
    } catch (error) {
      console.error("Error checking setup status:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSetupAssistant = () => {
    setModalStep("welcome");
    setShowModal(true);
  };

  const handleSetupPhone = () => {
    setModalStep("phone-number");
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    // Refresh status after modal closes
    checkStatus();
  };

  if (loading || !setupStatus || setupStatus.isComplete) {
    return null;
  }

  return (
    <>
      <div className={className}>
        {/* First Priority: Assistant Setup Alert */}
        {!setupStatus.hasAssistant && (
          <Alert className="border-orange-200 bg-orange-50">
            <AlertDescription className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="h-4 w-4 text-orange-600" />
                <span className="text-orange-800">
                  Complete your setup by configuring your AI assistant to start handling calls.
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSetupAssistant}
                className="ml-4 border-orange-300 text-orange-700 hover:bg-orange-100"
              >
                Setup Assistant
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Second Priority: Phone Number Alert (only if assistant is configured) */}
        {setupStatus.hasAssistant && !setupStatus.hasPhoneNumber && (
          <Alert className="border-orange-200 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-orange-600" />
                <span className="text-orange-800">
                  Get your business phone number to complete setup and start receiving calls.
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSetupPhone}
                className="ml-4 border-orange-300 text-orange-700 hover:bg-orange-100"
              >
                Get Phone Number
              </Button>
            </AlertDescription>
          </Alert>
        )}
      </div>

      <AssistantSetupModal
        open={showModal}
        onOpenChange={handleModalClose}
        isFirstTimeSetup={false}
        initialStep={modalStep}
        onAssistantSelected={checkStatus}
        onPhoneNumberAssigned={checkStatus}
      />
    </>
  );
}
