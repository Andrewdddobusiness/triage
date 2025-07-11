"use server";

import { createClient } from "@/utils/supabase/server";
import { generatePhoneFormats } from "@/utils/phone-utils";

export interface Inquiry {
  id: string;
  name: string;
  phone: string; // Customer's phone number (caller)
  email?: string | null;
  inquiry_date?: string | null;
  preferred_service_date?: string | null;
  preferred_service_date_text?: string | null;
  estimated_completion?: string | null;
  budget?: number | null;
  job_type?: string | null;
  job_description?: string | null;
  street_address?: string | null;
  city?: string | null;
  state?: string | null;
  postal_code?: string | null;
  country?: string | null;
  status: "new" | "contacted" | "scheduled" | "completed" | "cancelled";
  created_at: string;
  updated_at: string;
  business_phone?: string | null; // Service provider's phone number (receiver)
  business_phone_id?: string | null; // VAPI phone number ID
  // Legacy field mappings for backwards compatibility
  service_date?: string | null;
}

export async function fetchUserInquiries() {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: "User not authenticated", data: [] };
    }

    // Get service provider ID
    const { data: serviceProvider, error: spError } = await supabase
      .from("service_providers")
      .select("id")
      .eq("auth_user_id", user.id)
      .single();

    if (spError || !serviceProvider) {
      return { success: false, error: "Service provider not found", data: [] };
    }

    // Get the phone number assigned to this service provider
    const { data: phoneNumber, error: phoneError } = await supabase
      .from("twilio_phone_numbers")
      .select("phone_number, vapi_phone_number_id")
      .eq("assigned_to", serviceProvider.id)
      .single();

    if (phoneError || !phoneNumber) {
      // No phone number assigned yet, return empty array
      return { success: true, data: [] };
    }

    // If we have a VAPI phone number ID, use it for precise matching
    if (phoneNumber.vapi_phone_number_id) {
      console.log('Using VAPI phone number ID for lookup:', phoneNumber.vapi_phone_number_id);
      
      const { data: inquiries, error: inquiriesError } = await supabase
        .from("customer_inquiries")
        .select("*")
        .eq("business_phone_id", phoneNumber.vapi_phone_number_id)
        .order("created_at", { ascending: false });

      if (inquiriesError) {
        return { success: false, error: inquiriesError.message, data: [] };
      }

      return { success: true, data: inquiries as Inquiry[] };
    }

    // Fallback: Search by phone number formats if no VAPI ID
    const userPhoneNumber = phoneNumber.phone_number;
    const possibleFormats = generatePhoneFormats(userPhoneNumber);
    
    console.log('User phone number:', userPhoneNumber);
    console.log('Searching for business_phone formats (fallback):', possibleFormats);

    // Query for inquiries that were received by this user's business phone number
    const { data: inquiries, error: inquiriesError } = await supabase
      .from("customer_inquiries")
      .select("*")
      .in("business_phone", possibleFormats)
      .order("created_at", { ascending: false });

    if (inquiriesError) {
      return { success: false, error: inquiriesError.message, data: [] };
    }

    return { success: true, data: inquiries as Inquiry[] };
  } catch (error) {
    console.error("Error fetching user inquiries:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to fetch inquiries",
      data: [] 
    };
  }
}

export async function fetchInquiryDetails(inquiryId: string) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: "User not authenticated", data: null };
    }

    // Get service provider ID
    const { data: serviceProvider, error: spError } = await supabase
      .from("service_providers")
      .select("id")
      .eq("auth_user_id", user.id)
      .single();

    if (spError || !serviceProvider) {
      return { success: false, error: "Service provider not found", data: null };
    }

    // Get the phone number assigned to this service provider for verification
    const { data: phoneNumber, error: phoneError } = await supabase
      .from("twilio_phone_numbers")
      .select("phone_number, vapi_phone_number_id")
      .eq("assigned_to", serviceProvider.id)
      .single();

    if (phoneError || !phoneNumber) {
      return { success: false, error: "No phone number assigned", data: null };
    }

    // Fetch the specific inquiry
    const { data: inquiry, error: inquiryError } = await supabase
      .from("customer_inquiries")
      .select("*")
      .eq("id", inquiryId)
      .single();

    if (inquiryError) {
      return { success: false, error: inquiryError.message, data: null };
    }

    if (!inquiry) {
      return { success: false, error: "Inquiry not found", data: null };
    }

    // Verify this inquiry belongs to the current user by checking business phone
    let isOwner = false;
    
    if (phoneNumber.vapi_phone_number_id && inquiry.business_phone_id) {
      // Check by VAPI phone number ID (most reliable)
      isOwner = inquiry.business_phone_id === phoneNumber.vapi_phone_number_id;
    } else if (inquiry.business_phone) {
      // Fallback: Check by phone number formats
      const possibleFormats = generatePhoneFormats(phoneNumber.phone_number);
      isOwner = possibleFormats.includes(inquiry.business_phone);
    }

    if (!isOwner) {
      return { success: false, error: "Unauthorized access to inquiry", data: null };
    }

    return { success: true, data: inquiry as Inquiry };
  } catch (error) {
    console.error("Error fetching inquiry details:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to fetch inquiry details",
      data: null 
    };
  }
}