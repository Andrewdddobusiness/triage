"use server";

import { createClient } from "@/utils/supabase/server";

export async function reconnectPhoneNumberToVapi() {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: "User not authenticated" };
    }

    // Get service provider ID
    const { data: serviceProvider, error: spError } = await supabase
      .from("service_providers")
      .select("id")
      .eq("auth_user_id", user.id)
      .single();

    if (spError || !serviceProvider) {
      return { success: false, error: "Service provider not found" };
    }

    // Find the phone number already assigned to this service provider
    const { data: phoneNumber, error: phoneError } = await supabase
      .from("twilio_phone_numbers")
      .select("phone_number, vapi_phone_number_id")
      .eq("assigned_to", serviceProvider.id)
      .single();

    if (phoneError || !phoneNumber) {
      return { 
        success: false, 
        error: "No phone number assigned to this service provider. Please use the assistant setup to assign a phone number first." 
      };
    }

    // Check if already connected to VAPI
    if (phoneNumber.vapi_phone_number_id) {
      return { 
        success: true, 
        message: "Phone number is already connected to VAPI",
        phoneNumber: phoneNumber.phone_number,
        alreadyConnected: true
      };
    }

    // Call the Supabase Edge Function to import the phone number to VAPI
    const { data: importResult, error: importError } = await supabase.functions.invoke("import-twilio-number", {
      body: {
        twilioPhoneNumber: phoneNumber.phone_number,
        serviceProviderId: serviceProvider.id,
      },
    });

    if (importError) {
      return { 
        success: false, 
        error: "Failed to connect phone number to VAPI. Please try again." 
      };
    }

    // Success!
    return { 
      success: true, 
      message: "Phone number connected to VAPI successfully!",
      phoneNumber: phoneNumber.phone_number
    };

  } catch (error) {
    console.error("Error reconnecting phone number to VAPI:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to connect phone number to VAPI" 
    };
  }
}