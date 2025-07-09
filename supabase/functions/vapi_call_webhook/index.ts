// Import Supabase Edge Runtime-compatible server + client
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

// Supabase and VAPI env vars
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, serviceRoleKey);

const VAPI_API_KEY = Deno.env.get("VAPI_API_KEY")!;
const VAPI_API_BASE = "https://api.vapi.ai";

// Helper function to get business phone number from VAPI
async function getBusinessPhoneNumber(phoneNumberId: string): Promise<string | null> {
  try {
    const response = await fetch(`${VAPI_API_BASE}/phone-number/${phoneNumberId}`, {
      headers: {
        Authorization: `Bearer ${VAPI_API_KEY}`,
      },
    });

    if (!response.ok) {
      console.error(`Failed to fetch phone number ${phoneNumberId}. Status: ${response.status}`);
      return null;
    }

    const phoneData = await response.json();
    return phoneData.number || null;
  } catch (error) {
    console.error(`Error fetching phone number ${phoneNumberId}:`, error);
    return null;
  }
}

// Start HTTP handler
serve(async (req: Request): Promise<Response> => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const body = await req.json();
    console.log("Webhook payload:", JSON.stringify(body));

    const structuredData = body.structuredData;
    const callId = body.callId ?? null;
    const assistantId = body.assistantId ?? null;
    const phoneNumberId = body.phoneNumberId ?? null;
    const customer = body.customer ?? null;

    if (!structuredData || !structuredData.flow) {
      console.error("Missing structuredData or flow.");
      return new Response("Missing structured data", { status: 400 });
    }

    const flow = structuredData.flow;

    if (flow === "new_job") {
      const {
        name,
        email,
        job_type,
        job_description,
        budget,
        preferred_service_date_text,
        street_address,
        city,
        state,
        postal_code,
        country,
      } = structuredData;

      // Get the caller's actual phone number from customer object
      const callerPhoneNumber = customer?.number;
      
      // Debug logging
      console.log("Customer object:", JSON.stringify(customer, null, 2));
      console.log("Caller phone number:", callerPhoneNumber);
      
      // Validate that we have a phone number, with fallback to structured data
      let finalPhoneNumber = callerPhoneNumber;
      if (!finalPhoneNumber) {
        // Try to extract phone number from structured data as fallback
        const structuredPhone = structuredData?.phone;
        if (structuredPhone) {
          console.log("Using phone number from structured data as fallback:", structuredPhone);
          finalPhoneNumber = structuredPhone;
        } else {
          console.error("Missing caller phone number - neither customer.number nor structured data phone available");
          console.error("Full body:", JSON.stringify(body, null, 2));
          return new Response("Missing caller phone number", { status: 400 });
        }
      }

      // Get the business phone number using VAPI API
      let businessPhoneNumber: string | null = null;
      if (phoneNumberId) {
        businessPhoneNumber = await getBusinessPhoneNumber(phoneNumberId);
      }

      const { error } = await supabase.from("customer_inquiries").insert({
        flow: "new_job",
        name,
        phone: finalPhoneNumber, // Use actual caller's phone number from VAPI
        email,
        job_type,
        job_description,
        budget: budget ? Number(budget) : null,
        preferred_service_date_text,
        street_address,
        city,
        state,
        postal_code,
        country: country || "Australia",
        call_sid: callId,
        status: "new",
        assistant_id: assistantId,
        business_phone: businessPhoneNumber, // Business phone number from VAPI API
        business_phone_id: phoneNumberId,
      });

      if (error) {
        console.error("Insert error (customer_inquiries):", error.message);
        return new Response("Database error", { status: 500 });
      }

      return new Response("New job saved", { status: 200 });
    }


    console.error("Unsupported flow type:", flow);
    return new Response(`Unsupported flow type: ${flow}. Only 'new_job' flow is supported.`, { status: 400 });
  } catch (err) {
    console.error("Webhook error:", err);
    return new Response("Bad request", { status: 400 });
  }
});
