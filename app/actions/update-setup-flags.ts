"use server";

import { createClient } from "@/utils/supabase/server";

export async function updateSetupFlags(flags: {
  has_seen_assistant_setup?: boolean;
  has_seen_phone_number_setup?: boolean;
}) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { success: false, error: "User not authenticated" };
    }

    // Update the setup flags for the service provider
    const { error: updateError } = await supabase
      .from("service_providers")
      .update({
        ...flags,
        updated_at: new Date().toISOString()
      })
      .eq("auth_user_id", user.id);

    if (updateError) {
      return { success: false, error: "Failed to update setup flags" };
    }

    return { success: true };

  } catch (error) {
    console.error("Error updating setup flags:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to update setup flags" 
    };
  }
}

export async function getSetupFlags() {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { success: false, error: "User not authenticated", flags: null };
    }

    // Try to get the setup flags for the service provider
    // Use a more flexible query in case columns don't exist yet
    const { data: serviceProvider, error: fetchError } = await supabase
      .from("service_providers")
      .select("*")
      .eq("auth_user_id", user.id)
      .single();

    if (fetchError) {
      console.error("Database error fetching service provider:", fetchError);
      return { success: false, error: "Failed to fetch setup flags", flags: null };
    }

    // Handle case where columns might not exist yet
    const flags = {
      has_seen_assistant_setup: serviceProvider?.has_seen_assistant_setup || false,
      has_seen_phone_number_setup: serviceProvider?.has_seen_phone_number_setup || false
    };

    console.log("🏪 Service provider data:", serviceProvider);
    console.log("🏁 Parsed flags:", flags);

    return { 
      success: true, 
      flags
    };

  } catch (error) {
    console.error("Error fetching setup flags:", error);
    // Return default flags for first-time users on error
    return { 
      success: true, 
      flags: {
        has_seen_assistant_setup: false,
        has_seen_phone_number_setup: false
      }
    };
  }
}