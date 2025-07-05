"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogOverlay,
  DialogPortal,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bot, Check, Loader2, Copy, Phone, Sparkles, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { findAndAssignPhoneNumber } from "@/app/actions/phone-number-assignment";
import { updateSetupFlags } from "@/app/actions/update-setup-flags";
import Image from "next/image";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

type Step = "welcome" | "assistant-setup" | "assistant-success" | "phone-number" | "phone-success";

interface AssistantPreset {
  id: string;
  name: string;
  description: string;
  voice_provider: string;
  assistant_id: string;
  voice_id: string;
  default_greeting: string;
  avatar_url: string;
}

interface AssistantSetupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAssistantSelected?: () => void;
  onPhoneNumberAssigned?: (phoneNumber: string) => void;
  isFirstTimeSetup?: boolean;
  initialStep?: Step;
}

export function AssistantSetupModal({
  open,
  onOpenChange,
  onAssistantSelected,
  onPhoneNumberAssigned,
  isFirstTimeSetup = false,
  initialStep,
}: AssistantSetupModalProps) {
  const { user } = useAuthStore();
  const [currentStep, setCurrentStep] = useState<Step>(
    initialStep || (isFirstTimeSetup ? "welcome" : "assistant-setup")
  );
  const [assistantPresets, setAssistantPresets] = useState<AssistantPreset[]>([]);
  const [selectedAssistant, setSelectedAssistant] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [assignedPhoneNumber, setAssignedPhoneNumber] = useState<string | null>(null);
  const [assigningPhone, setAssigningPhone] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (open) {
      fetchAssistantPresets();
      // Reset to initial step when modal opens
      setCurrentStep(initialStep || (isFirstTimeSetup ? "welcome" : "assistant-setup"));
    }
  }, [open, initialStep, isFirstTimeSetup]);

  const fetchAssistantPresets = async () => {
    try {
      setLoading(true);
      const supabase = createClient();

      const { data: presets, error } = await supabase.from("assistant_presets").select("*").order("name");

      if (error) {
        throw error;
      }

      setAssistantPresets(presets || []);
    } catch (error) {
      console.error("Error fetching assistant presets:", error);
      toast.error("Failed to load assistant options");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAssistant = async () => {
    if (!selectedAssistant || !user?.id) {
      toast.error("Please select an assistant");
      return;
    }

    try {
      setSaving(true);
      const supabase = createClient();

      // Get service provider ID
      const { data: serviceProvider, error: spError } = await supabase
        .from("service_providers")
        .select("id")
        .eq("auth_user_id", user.id)
        .single();

      if (spError || !serviceProvider) {
        throw new Error("Service provider not found");
      }

      // Get the selected preset details
      const selectedPreset = assistantPresets.find((p) => p.id === selectedAssistant);
      if (!selectedPreset) {
        throw new Error("Selected assistant preset not found");
      }

      // Check if user already has an assistant configured
      const { data: existingAssistant, error: checkError } = await supabase
        .from("service_provider_assistants")
        .select("id")
        .eq("service_provider_id", serviceProvider.id)
        .single();

      if (checkError && checkError.code !== "PGRST116") {
        throw checkError;
      }

      if (existingAssistant) {
        // Update existing assistant
        const { error: updateError } = await supabase
          .from("service_provider_assistants")
          .update({
            assistant_preset_id: selectedAssistant,
            assistant_id: selectedPreset.assistant_id,
            greeting_message: selectedPreset.default_greeting,
            enabled: false, // Keep disabled until phone number is set up
          })
          .eq("id", existingAssistant.id);

        if (updateError) {
          throw updateError;
        }
      } else {
        // Create new assistant configuration
        const { error: insertError } = await supabase.from("service_provider_assistants").insert({
          service_provider_id: serviceProvider.id,
          assistant_preset_id: selectedAssistant,
          assistant_id: selectedPreset.assistant_id,
          greeting_message: selectedPreset.default_greeting,
          enabled: false, // Keep disabled until phone number is set up
        });

        if (insertError) {
          throw insertError;
        }
      }

      toast.success("AI Assistant configured successfully!");

      if (isFirstTimeSetup) {
        setCurrentStep("assistant-success");
        await updateSetupFlags({ has_seen_assistant_setup: true });
      } else {
        onOpenChange(false);
      }

      onAssistantSelected?.();
    } catch (error) {
      console.error("Error saving assistant:", error);
      toast.error("Failed to configure assistant");
    } finally {
      setSaving(false);
    }
  };

  const handleAssignPhoneNumber = async () => {
    try {
      setAssigningPhone(true);
      const result = await findAndAssignPhoneNumber();

      if (result.success && result.phoneNumber) {
        setAssignedPhoneNumber(result.phoneNumber);
        setCurrentStep("phone-success");

        if (isFirstTimeSetup) {
          await updateSetupFlags({ has_seen_phone_number_setup: true });
        }

        onPhoneNumberAssigned?.(result.phoneNumber);
        toast.success(result.message);
      } else {
        toast.error(result.error || "Failed to assign phone number");
      }
    } catch (error) {
      console.error("Error assigning phone number:", error);
      toast.error("Failed to assign phone number");
    } finally {
      setAssigningPhone(false);
    }
  };

  const handleCopyPhoneNumber = () => {
    if (assignedPhoneNumber) {
      navigator.clipboard.writeText(assignedPhoneNumber);
      toast.success("Phone number copied to clipboard!");
    }
  };

  const resetModal = () => {
    setCurrentStep(initialStep || (isFirstTimeSetup ? "welcome" : "assistant-setup"));
    setSelectedAssistant(null);
    setAssignedPhoneNumber(null);
    setSaving(false);
    setAssigningPhone(false);
  };

  const handleClose = () => {
    resetModal();
    onOpenChange(false);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case "welcome":
        return (
          <>
            <DialogHeader>
              <VisuallyHidden>
                <DialogTitle>Welcome to Spaak Setup</DialogTitle>
              </VisuallyHidden>
            </DialogHeader>

            <div className="space-y-6 py-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bot className="h-8 w-8 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Let's set up your AI assistant</h3>
                <p className="text-gray-600 mb-6">
                  Your AI assistant will handle missed calls and capture leads for your business.
                </p>
              </div>

              <div className="bg-orange-50 p-4 rounded-lg">
                <h4 className="font-semibold text-orange-900 mb-2">What you'll need to do:</h4>
                <ul className="space-y-1 text-sm text-orange-700">
                  <li>1. Choose an AI assistant personality</li>
                  <li>2. Get a dedicated business phone number</li>
                  <li>3. Call your assistant with your given phone number to test!</li>
                </ul>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                Do Later
              </Button>
              <Button
                onClick={() => setCurrentStep("assistant-setup")}
                className="bg-orange-500 hover:bg-orange-600 cursor-pointer"
              >
                Setup AI Assistant
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </DialogFooter>
          </>
        );

      case "assistant-setup":
        return (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                Choose Your AI Assistant
              </DialogTitle>
              <DialogDescription>
                Select an AI assistant that best fits your business needs. You can change this later.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {loading || !mounted ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="ml-2">Loading assistants...</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {assistantPresets.map((preset) => (
                    <Card
                      key={preset.id}
                      className={`cursor-pointer transition-all border-2 ${
                        selectedAssistant === preset.id
                          ? "border-orange-500 bg-orange-50"
                          : "border-gray-200 hover:border-orange-300"
                      }`}
                      onClick={() => setSelectedAssistant(preset.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center overflow-hidden">
                              {mounted && preset.avatar_url ? (
                                <Image
                                  src={preset.avatar_url}
                                  alt={`${preset.name} avatar`}
                                  width={40}
                                  height={40}
                                  className="w-full h-full object-cover rounded-full"
                                  unoptimized
                                />
                              ) : (
                                <Bot className="h-5 w-5 text-orange-600" />
                              )}
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">{preset.name}</h3>
                              {/* <Badge variant="secondary" className="text-xs">
                                {preset.voice_provider}
                              </Badge> */}
                            </div>
                          </div>
                          {selectedAssistant === preset.id && <Check className="h-5 w-5 text-orange-600" />}
                        </div>

                        <p className="text-sm text-gray-600 mb-3">{preset.description}</p>

                        {preset.default_greeting && (
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-xs text-gray-500 mb-1">Default Greeting:</p>
                            <p className="text-sm text-gray-700 italic">"{preset.default_greeting}"</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {!loading && mounted && assistantPresets.length === 0 && (
                <div className="text-center py-8">
                  <Bot className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No assistant presets available</p>
                </div>
              )}
            </div>

            <DialogFooter>
              {isFirstTimeSetup && (
                <Button variant="outline" onClick={() => setCurrentStep("welcome")} disabled={saving}>
                  Back
                </Button>
              )}
              <Button
                onClick={handleSaveAssistant}
                disabled={!selectedAssistant || saving || loading || !mounted}
                className="bg-orange-500 hover:bg-orange-600"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Configuring...
                  </>
                ) : (
                  "Configure Assistant"
                )}
              </Button>
            </DialogFooter>
          </>
        );

      case "assistant-success":
        return (
          <>
            <DialogHeader>
              <VisuallyHidden>
                <DialogTitle className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-500" />
                  AI Assistant Configured!
                </DialogTitle>
              </VisuallyHidden>
            </DialogHeader>

            <div className="space-y-6 py-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Great! Your AI assistant is set up</h3>
                <p className="text-gray-600 mb-6">
                  Next, you'll need a dedicated business phone number for your assistant.
                </p>
              </div>

              <div className="bg-orange-50 p-4 rounded-lg">
                <h4 className="font-semibold text-orange-900 mb-2">Why you need a business number:</h4>
                <ul className="space-y-1 text-sm text-orange-700">
                  <li>• Customers can call your AI assistant directly</li>
                  <li>• Professional appearance for your business</li>
                  <li>• Keep your personal number private</li>
                </ul>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                Do Later
              </Button>
              <Button onClick={() => setCurrentStep("phone-number")} className="bg-orange-500 hover:bg-orange-600">
                Get Business Number
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </DialogFooter>
          </>
        );

      case "phone-number":
        return (
          <>
            <DialogHeader>
              <VisuallyHidden>
                <DialogTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Get Your Business Phone Number
                </DialogTitle>
              </VisuallyHidden>
            </DialogHeader>

            <div className="space-y-6 py-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone className="h-8 w-8 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Ready to assign your number</h3>
                <p className="text-gray-600 mb-6">
                  Click below to automatically assign an available phone number to your account.
                </p>
              </div>

              {assigningPhone && (
                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="flex items-center justify-center">
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    <span className="text-orange-700">Finding and assigning your number...</span>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setCurrentStep("assistant-success")} disabled={assigningPhone}>
                Back
              </Button>
              <Button
                onClick={handleAssignPhoneNumber}
                disabled={assigningPhone}
                className="bg-orange-500 hover:bg-orange-600"
              >
                {assigningPhone ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Assigning...
                  </>
                ) : (
                  "Assign Phone Number"
                )}
              </Button>
            </DialogFooter>
          </>
        );

      case "phone-success":
        return (
          <>
            <DialogHeader>
              <VisuallyHidden>
                <DialogTitle className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-500" />
                  Phone Number Assigned!
                </DialogTitle>
              </VisuallyHidden>
            </DialogHeader>

            <div className="space-y-6 py-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Congratulations! You're all set up</h3>
                <p className="text-gray-600 mb-6">
                  Your AI assistant is now ready to handle calls at your business number.
                </p>
              </div>

              {assignedPhoneNumber && (
                <div className="bg-orange-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-orange-900 mb-2">Your Business Phone Number:</h4>
                  <div className="flex items-center justify-between bg-white p-3 rounded border">
                    <span className="text-lg font-mono text-orange-700">{assignedPhoneNumber}</span>
                    <Button variant="outline" size="sm" onClick={handleCopyPhoneNumber} className="ml-2">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              <div className="bg-zinc-50 p-4 rounded-lg">
                <h4 className="font-semibold text-zinc-900 mb-2">What's next:</h4>
                <ul className="space-y-1 text-sm text-zinc-700">
                  <li>• Share your business number with customers</li>
                  <li>• Test your AI assistant by calling the number</li>
                  <li>• Monitor incoming calls from your dashboard</li>
                </ul>
              </div>
            </div>

            <DialogFooter>
              <Button onClick={handleClose} className="bg-orange-500 hover:bg-orange-600">
                Complete Setup
              </Button>
            </DialogFooter>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogPortal>
        <DialogOverlay className="backdrop-blur-[6px] duration-1000" />
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto duration-1000 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-98 data-[state=open]:zoom-in-98 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-top-[46%]">
          {renderStepContent()}
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}

export { type Step, type AssistantSetupModalProps };
