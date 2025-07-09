import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

interface RequestBody {
  serviceProviderId: string;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const VAPI_API_BASE = "https://api.vapi.ai";
const VAPI_API_KEY = Deno.env.get("VAPI_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { serviceProviderId }: RequestBody = await req.json();
    console.log("serviceProviderId: ", serviceProviderId);

    // Find the phone number assigned to this service provider
    const { data: phoneNumber, error: findError } = await supabaseClient
      .from("twilio_phone_numbers")
      .select("*")
      .eq("assigned_to", serviceProviderId)
      .single();

    if (findError || !phoneNumber) {
      throw new Error("No phone number found for this service provider");
    }

    if (!phoneNumber.vapi_phone_number_id) {
      throw new Error("Phone number is not imported to VAPI");
    }

    console.log("Deleting VAPI phone number: ", phoneNumber.vapi_phone_number_id);

    // Delete the phone number from VAPI
    const vapiResponse = await fetch(`${VAPI_API_BASE}/phone-number/${phoneNumber.vapi_phone_number_id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${VAPI_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    console.log("vapiResponse: ", vapiResponse);

    if (!vapiResponse.ok) {
      const errorText = await vapiResponse.text();
      throw new Error(`VAPI API error: ${errorText}`);
    }

    // Update the database to clear VAPI data only (keep phone number assigned)
    const { error: updateError } = await supabaseClient
      .from("twilio_phone_numbers")
      .update({
        vapi_phone_number_id: null,
        vapi_imported_at: null,
      })
      .eq("id", phoneNumber.id);

    if (updateError) {
      throw new Error(`Supabase update failed: ${updateError.message}`);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Phone number deleted from VAPI (kept assigned to user)",
      phoneNumber: phoneNumber.phone_number
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Function error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});