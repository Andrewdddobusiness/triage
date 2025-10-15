import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const VAPI_API_KEY = Deno.env.get("VAPI_API_KEY")!;
const TWILIO_ACCOUNT_SID = Deno.env.get("TWILIO_ACCOUNT_SID")!;
const TWILIO_AUTH_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN")!;
const FUNCTIONS_URL = `${SUPABASE_URL}/functions/v1`;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function revertPhoneAssignment(supabase: ReturnType<typeof createClient>, phoneId: string) {
  const { error } = await supabase
    .from("twilio_phone_numbers")
    .update({
      assigned_to: null,
      assigned_at: null,
      is_active: true,
    })
    .eq("id", phoneId);

  if (error) {
    console.error("Failed to revert phone assignment:", error);
  }
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ success: false, error: "Method not allowed" }, 405);
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return jsonResponse({ success: false, error: "Unauthorized" }, 401);
  }

  const accessToken = authHeader.replace("Bearer ", "").trim();
  if (!accessToken) {
    return jsonResponse({ success: false, error: "Unauthorized" }, 401);
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(accessToken);

    if (userError || !user) {
      console.error("Auth error:", userError);
      return jsonResponse({ success: false, error: "Unauthorized" }, 401);
    }

    const { data: serviceProvider, error: spError } = await supabase
      .from("service_providers")
      .select("id, service_provider_assistants!inner(assistant_id)")
      .eq("auth_user_id", user.id)
      .single();

    if (spError || !serviceProvider) {
      console.error("Service provider fetch error:", spError);
      return jsonResponse({ success: false, error: "Service provider not found" }, 404);
    }

    const assistantId = serviceProvider.service_provider_assistants?.[0]?.assistant_id || null;

    const { data: availableNumbers, error: numbersError } = await supabase
      .from("twilio_phone_numbers")
      .select("id, phone_number")
      .is("assigned_to", null)
      .eq("is_active", true)
      .order("created_at", { ascending: true })
      .limit(1);

    if (numbersError) {
      console.error("Phone number lookup error:", numbersError);
      return jsonResponse({ success: false, error: "Failed to find available phone numbers" }, 500);
    }

    if (!availableNumbers || availableNumbers.length === 0) {
      return jsonResponse({
        success: false,
        error: "Sorry! We can't assign you a phone number at this time. Please check back later.",
      }, 409);
    }

    const phoneRecord = availableNumbers[0];
    const timestamp = new Date().toISOString();

    const { data: assignmentResult, error: assignmentError } = await supabase
      .from("twilio_phone_numbers")
      .update({
        assigned_to: serviceProvider.id,
        assigned_at: timestamp,
        is_active: false,
      })
      .eq("id", phoneRecord.id)
      .is("assigned_to", null)
      .select("phone_number")
      .maybeSingle();

    if (assignmentError) {
      console.error("Error assigning phone number:", assignmentError);
      return jsonResponse({ success: false, error: "Error assigning phone number" }, 500);
    }

    if (!assignmentResult) {
      return jsonResponse({ success: false, error: "Phone number already assigned. Please try again." }, 409);
    }

    try {
      const vapiPayload = {
        provider: "twilio",
        number: phoneRecord.phone_number,
        twilioAccountSid: TWILIO_ACCOUNT_SID,
        twilioAuthToken: TWILIO_AUTH_TOKEN,
        assistantId: assistantId,
        server: {
          url: `${FUNCTIONS_URL}/vapi-assistant-selector`,
          headers: {
            Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
          },
        },
      };

      const vapiResponse = await fetch("https://api.vapi.ai/phone-number", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${VAPI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(vapiPayload),
      });

      if (!vapiResponse.ok) {
        const errorText = await vapiResponse.text();
        console.error("Vapi import failed:", errorText);
        await revertPhoneAssignment(supabase, phoneRecord.id);
        return jsonResponse({
          success: false,
          error: "Sorry! We can't assign you a phone number at this time. Please check back later.",
        }, 502);
      }

      const vapiData = await vapiResponse.json();

      const { error: markImportedError } = await supabase
        .from("twilio_phone_numbers")
        .update({
          vapi_phone_number_id: vapiData.id,
          vapi_imported_at: new Date().toISOString(),
        })
        .eq("id", phoneRecord.id);

      if (markImportedError) {
        console.error("Failed to mark number as imported:", markImportedError);
      }

      return jsonResponse({
        success: true,
        phoneNumber: phoneRecord.phone_number,
        message: "Phone number assigned successfully!",
      });
    } catch (error) {
      console.error("Unexpected error during Vapi import:", error);
      await revertPhoneAssignment(supabase, phoneRecord.id);
      return jsonResponse({
        success: false,
        error: "Failed to assign phone number",
      }, 500);
    }
  } catch (error) {
    console.error("assign-phone-number failed:", error);
    return jsonResponse({ success: false, error: "Unexpected error" }, 500);
  }
});
