"use server";

import { createClient } from "@/utils/supabase/server";

export async function findAndAssignPhoneNumber() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase.functions.invoke<{
      success: boolean;
      phoneNumber?: string;
      message?: string;
      error?: string;
    }>("assign-phone-number");

    if (error) {
      console.error("assign-phone-number function error:", error);
      return { success: false, error: "Failed to assign phone number" };
    }

    if (!data?.success) {
      return {
        success: false,
        error: data?.error || "Sorry! We can't assign you a phone number at this time. Please check back later.",
      };
    }

    return {
      success: true,
      phoneNumber: data.phoneNumber,
      message: data.message || "Phone number assigned successfully!",
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
