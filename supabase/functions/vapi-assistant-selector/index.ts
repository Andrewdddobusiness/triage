import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

// Setup Supabase client
const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

serve(async (req) => {
  const rawBody = await req.text();

  let body;
  try {
    body = JSON.parse(rawBody);
  } catch (err) {
    console.error("❌ Failed to parse JSON:", err);
    return new Response("Invalid JSON", { status: 400 });
  }

  if (body.message?.type !== "assistant-request") {
    return new Response("Invalid message type", { status: 400 });
  }

  const phoneNumber = body.message?.phoneNumber?.number;
  if (!phoneNumber) {
    console.warn("⚠️ No Vapi phone number in message.phoneNumber.number");
    return new Response("Missing assistant phone number", { status: 400 });
  }

  // 🔍 Step 1: Get assigned service provider via Vapi phone number
  const { data: phoneRecord, error: phoneError } = await supabase
    .from("twilio_phone_numbers")
    .select("assigned_to")
    .eq("phone_number", phoneNumber)
    .single();

  if (phoneError || !phoneRecord?.assigned_to) {
    console.warn(`❌ No service provider assigned to number ${phoneNumber}`);
    return new Response(JSON.stringify({ error: "Phone number not assigned to any service provider." }), {
      status: 200,
    });
  }

  const serviceProviderId = phoneRecord.assigned_to;

  // 🔍 Step 2: Get service provider business info
  const { data: provider, error: providerError } = await supabase
    .from("service_providers")
    .select("business_name, owner_name, services_offered")
    .eq("id", serviceProviderId)
    .single();

  if (providerError || !provider) {
    return new Response(JSON.stringify({ error: "Service provider not found." }), { status: 200 });
  }

  // 🔍 Step 3: Get assistant preset ID
  const { data: assistant, error: assistantError } = await supabase
    .from("service_provider_assistants")
    .select("assistant_preset_id")
    .eq("service_provider_id", serviceProviderId)
    .single();

  if (assistantError || !assistant?.assistant_preset_id) {
    return new Response(JSON.stringify({ error: "No assistant preset linked to service provider." }), {
      status: 200,
    });
  }

  // 🔍 Step 4: Get assistant preset details
  const { data: preset, error: presetError } = await supabase
    .from("assistant_presets")
    .select("assistant_id, name")
    .eq("id", assistant.assistant_preset_id)
    .single();

  if (presetError || !preset) {
    return new Response(JSON.stringify({ error: "Assistant preset not found." }), { status: 200 });
  }

  // ✅ Response
  return new Response(
    JSON.stringify({
      assistantId: preset.assistant_id,
      assistantOverrides: {
        variableValues: {
          assistant_name: preset.name,
          business_name: provider.business_name,
          services_offered: (provider.services_offered || []).join(", "),
          owner_name: provider.owner_name,
        },
      },
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
});
