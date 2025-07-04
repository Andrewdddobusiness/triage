"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { createClient } from "@/utils/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Bot, Phone, Settings, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { AssistantSetupModal } from "@/components/assistant-setup-modal";
import { SetupAlert } from "@/components/setup-alert";

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

interface ServiceProviderAssistant {
  id: string;
  assistant_id: string;
  assistant_preset_id: string;
  greeting_message: string;
  enabled: boolean;
  assistant_preset?: AssistantPreset;
}

interface TwilioPhoneNumber {
  id: string;
  phone_number: string;
  friendly_name: string;
  is_active: boolean;
}

export default function AssistantSettingsPage() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [serviceProviderAssistant, setServiceProviderAssistant] = useState<ServiceProviderAssistant | null>(null);
  const [assignedPhoneNumber, setAssignedPhoneNumber] = useState<TwilioPhoneNumber | null>(null);
  const [assistantEnabled, setAssistantEnabled] = useState(false);
  const [showSetupModal, setShowSetupModal] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchAssistantData();
    }
  }, [user?.id]);

  const fetchAssistantData = async () => {
    try {
      setLoading(true);
      const supabase = createClient();

      // Get service provider ID
      const { data: serviceProvider, error: spError } = await supabase
        .from("service_providers")
        .select("id")
        .eq("auth_user_id", user?.id)
        .single();

      if (spError || !serviceProvider) {
        throw new Error("Service provider not found");
      }

      // Get service provider assistant with preset details
      const { data: assistantData, error: assistantError } = await supabase
        .from("service_provider_assistants")
        .select(
          `
          *,
          assistant_preset:assistant_presets(*)
        `
        )
        .eq("service_provider_id", serviceProvider.id)
        .single();

      if (assistantError && assistantError.code !== "PGRST116") {
        console.error("Error fetching assistant:", assistantError);
      }

      if (assistantData) {
        setServiceProviderAssistant(assistantData);
        setAssistantEnabled(assistantData.enabled);
      }

      // Get assigned phone number
      const { data: phoneNumber, error: phoneError } = await supabase
        .from("twilio_phone_numbers")
        .select("*")
        .eq("assigned_to", serviceProvider.id)
        .eq("is_active", true)
        .single();

      if (phoneError && phoneError.code !== "PGRST116") {
        console.error("Error fetching phone number:", phoneError);
      }

      if (phoneNumber) {
        setAssignedPhoneNumber(phoneNumber);
      }
    } catch (error) {
      console.error("Error fetching assistant data:", error);
      toast.error("Failed to load assistant settings");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAssistant = async (enabled: boolean) => {
    if (!serviceProviderAssistant) {
      toast.error("No assistant configured");
      return;
    }

    if (enabled && !assignedPhoneNumber) {
      toast.error("You need a business phone number to activate your AI assistant");
      return;
    }

    try {
      setUpdating(true);
      const supabase = createClient();

      const { error } = await supabase
        .from("service_provider_assistants")
        .update({ enabled })
        .eq("id", serviceProviderAssistant.id);

      if (error) {
        throw error;
      }

      setAssistantEnabled(enabled);
      setServiceProviderAssistant((prev) => (prev ? { ...prev, enabled } : null));

      toast.success(enabled ? "AI Assistant activated!" : "AI Assistant deactivated");
    } catch (error) {
      console.error("Error updating assistant status:", error);
      toast.error("Failed to update assistant status");
    } finally {
      setUpdating(false);
    }
  };

  const isSetupRequired = !assignedPhoneNumber;
  const canActivateAssistant = serviceProviderAssistant && assignedPhoneNumber;

  const handleAssistantConfigured = () => {
    // Refresh assistant data after configuration
    fetchAssistantData();
  };

  const handlePhoneNumberAssigned = (phoneNumber: string) => {
    // Update the assigned phone number state
    setAssignedPhoneNumber({
      id: "temp-id",
      phone_number: phoneNumber,
      friendly_name: "Business Number",
      is_active: true,
    });
    // Also refresh the full data
    fetchAssistantData();
  };

  const handleSetupButtonClick = () => {
    // Open the setup modal starting from the appropriate step
    setShowSetupModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p>Loading assistant settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 mb-2">Assistant Settings</h1>
        <p className="text-zinc-600">Configure and manage your AI assistant</p>
      </div>

      {/* Setup Alert */}
      <SetupAlert />

      {/* AI Assistant Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Bot className="h-5 w-5" />
            AI Assistant Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className=" text-sm">Your AI Assistant is {assistantEnabled ? "Online" : "Offline"}</span>
                {assistantEnabled ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-zinc-400" />
                )}
              </div>
              {!canActivateAssistant && (
                <p className="text-sm text-orange-600">Requires business phone number to activate</p>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Label htmlFor="assistant-toggle" className="sr-only">
                Toggle AI Assistant
              </Label>
              <Switch
                id="assistant-toggle"
                checked={assistantEnabled}
                onCheckedChange={handleToggleAssistant}
                disabled={updating || !canActivateAssistant}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Assistant */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Settings className="h-5 w-5" />
            Current Assistant
          </CardTitle>
        </CardHeader>
        <CardContent>
          {serviceProviderAssistant?.assistant_preset ? (
            <div className="space-y-2">
              <h3 className="font-medium">{serviceProviderAssistant.assistant_preset.name}</h3>
              <p className="text-sm text-zinc-600">{serviceProviderAssistant.assistant_preset.description}</p>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-zinc-500">No assistant configured</p>
              <Button variant="outline" className="mt-2" onClick={() => setShowSetupModal(true)}>
                Setup Assistant
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Business Phone Number */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Phone className="h-5 w-5" />
            Business Phone Number
          </CardTitle>
        </CardHeader>
        <CardContent>
          {assignedPhoneNumber ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm">{assignedPhoneNumber.phone_number}</span>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Active
                </Badge>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-zinc-500 text-sm">No number assigned</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assistant Setup Modal */}
      <AssistantSetupModal
        open={showSetupModal}
        onOpenChange={setShowSetupModal}
        onAssistantSelected={handleAssistantConfigured}
        onPhoneNumberAssigned={handlePhoneNumberAssigned}
      />
    </div>
  );
}
