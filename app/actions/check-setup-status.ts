"use server";

import { createClient } from "@/utils/supabase/server";

export interface SetupStatus {
  hasAssistant: boolean;
  hasPhoneNumber: boolean;
  isComplete: boolean;
}

export async function checkSetupStatus(): Promise<{ success: boolean; status?: SetupStatus; error?: string }> {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "User not authenticated" };
    }

    // Get service provider info
    const { data: serviceProvider, error: spError } = await supabase
      .from("service_providers")
      .select("id")
      .eq("auth_user_id", user.id)
      .single();

    if (spError) {
      return { success: false, error: "Service provider not found" };
    }

    // Check if user has an assistant configured
    const { data: assistant, error: assistantError } = await supabase
      .from("service_provider_assistants")
      .select("id")
      .eq("service_provider_id", serviceProvider.id)
      .single();

    const hasAssistant = !assistantError && !!assistant;

    // Check if user has a phone number assigned
    const { data: phoneNumber, error: phoneError } = await supabase
      .from("twilio_phone_numbers")
      .select("id")
      .eq("assigned_to", serviceProvider.id)
      .single();

    const hasPhoneNumber = !phoneError && !!phoneNumber;

    const status: SetupStatus = {
      hasAssistant,
      hasPhoneNumber,
      isComplete: hasAssistant && hasPhoneNumber,
    };

    return { success: true, status };
  } catch (error) {
    console.error("Error checking setup status:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to check setup status",
    };
  }
}
