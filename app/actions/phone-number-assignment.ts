"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export async function findAndAssignPhoneNumber() {
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

    // 1. Get the service provider ID and assistant ID for the current user
    const { data: serviceProvider, error: spError } = await supabase
      .from("service_providers")
      .select(
        `
        id,
        service_provider_assistants!inner(
          assistant_id
        )
      `
      )
      .eq("auth_user_id", user.id)
      .single();

    if (spError) {
      return { success: false, error: "Service provider not found" };
    }

    // 2. Find an available phone number (not assigned to any service provider)
    const { data: availableNumbers, error: numbersError } = await supabase
      .from("twilio_phone_numbers")
      .select("*")
      .is("assigned_to", null)
      .eq("is_active", true)
      .limit(1);

    if (numbersError) {
      return { success: false, error: "Error finding available phone numbers" };
    }

    if (!availableNumbers || availableNumbers.length === 0) {
      return {
        success: false,
        error: "Sorry! We can't assign you a phone number at this time. Please check back later.",
      };
    }

    const phoneNumberToAssign = availableNumbers[0];

    // 3. Assign the phone number to the service provider
    const { error: updateError } = await supabase
      .from("twilio_phone_numbers")
      .update({
        assigned_to: serviceProvider.id,
        assigned_at: new Date().toISOString(),
        is_active: false,
      })
      .eq("id", phoneNumberToAssign.id);

    if (updateError) {
      return { success: false, error: "Error assigning phone number" };
    }

    // 4. Call the Supabase Edge Function to import the phone number to Vapi
    const { error: importError } = await supabase.functions.invoke("import-twilio-number", {
      body: {
        twilioPhoneNumber: phoneNumberToAssign.phone_number,
        serviceProviderId: serviceProvider.id,
      },
    });

    if (importError) {
      return {
        success: false,
        error: "Sorry! We can't assign you a phone number at this time. Please check back later.",
      };
    }

    // Success!
    return {
      success: true,
      phoneNumber: phoneNumberToAssign.phone_number,
      message: "Phone number assigned successfully!",
    };
  } catch (error) {
    console.error("Error assigning phone number:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to assign phone number",
    };
  }
}

export async function deletePhoneNumber() {
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

    // Get the service provider ID for the current user
    const { data: serviceProvider, error: spError } = await supabase
      .from("service_providers")
      .select("id")
      .eq("auth_user_id", user.id)
      .single();

    if (spError) {
      return { success: false, error: "Service provider not found" };
    }

    // Call the Supabase Edge Function to delete the phone number from VAPI
    const { data: deleteResult, error: deleteError } = await supabase.functions.invoke("delete-vapi-number", {
      body: {
        serviceProviderId: serviceProvider.id,
      },
    });

    if (deleteError) {
      return {
        success: false,
        error: "Failed to remove phone number. Please try again.",
      };
    }

    // Success!
    return {
      success: true,
      message: "Phone number removed successfully!",
      phoneNumber: deleteResult?.phoneNumber,
    };
  } catch (error) {
    console.error("Error deleting phone number:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to remove phone number",
    };
  }
}
