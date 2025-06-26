import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

interface RequestBody {
  twilioPhoneNumber: string;
  serviceProviderId: string;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const VAPI_API_BASE = "https://api.vapi.ai";
const VAPI_API_KEY = Deno.env.get("VAPI_API_KEY")!;
const TWILIO_ACCOUNT_SID = Deno.env.get("TWILIO_ACCOUNT_SID")!;
const TWILIO_AUTH_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { twilioPhoneNumber, serviceProviderId }: RequestBody = await req.json();
    console.log("twilioPhoneNumber: ", twilioPhoneNumber);
    console.log("serviceProviderId: ", serviceProviderId);

    if (!twilioPhoneNumber.startsWith("+")) {
      throw new Error("Phone number must be in E.164 format (e.g., +61412345678)");
    }

    // // Get the assistant ID for the service provider
    // const { data: providerData, error: providerError } = await supabaseClient
    //   .from("service_provider_assistants")
    //   .select("assistant_preset_id")
    //   .eq("service_provider_id", serviceProviderId)
    //   .single();

    // if (providerError || !providerData) {
    //   throw new Error("Failed to fetch assistant preset ID");
    // }

    const vapiPayload = {
      provider: "twilio",
      number: twilioPhoneNumber,
      twilioAccountSid: TWILIO_ACCOUNT_SID,
      twilioAuthToken: TWILIO_AUTH_TOKEN,
      // assistantId: providerData.assistant_id,
      assistantId: null,
      server: {
        url: `https://kiuwkrlaozjfpwwyiqpr.supabase.co/functions/v1/vapi-assistant-selector`,
        headers: {
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        },
      },
    };
    console.log("vapiPayload: ", vapiPayload);

    const vapiResponse = await fetch(`${VAPI_API_BASE}/phone-number`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${VAPI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(vapiPayload),
    });

    console.log("vapiResponse: ", vapiResponse);

    if (!vapiResponse.ok) {
      const errorText = await vapiResponse.text();
      throw new Error(`Vapi API error: ${errorText}`);
    }

    const vapiData = await vapiResponse.json();

    console.log("vapiData: ", vapiData);

    // Update your Supabase record
    const { error: updateError } = await supabaseClient
      .from("twilio_phone_numbers")
      .update({
        vapi_phone_number_id: vapiData.id,
        vapi_imported_at: new Date().toISOString(),
      })
      .eq("phone_number", twilioPhoneNumber);

    if (updateError) {
      throw new Error(`Supabase update failed: ${updateError.message}`);
    }

    return new Response(JSON.stringify({ success: true, data: vapiData }), {
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
