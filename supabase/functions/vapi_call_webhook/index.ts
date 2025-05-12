// Import Supabase Edge Runtime-compatible server + client
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

// Supabase env vars
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, serviceRoleKey);

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

    if (!structuredData || !structuredData.flow) {
      console.error("Missing structuredData or flow.");
      return new Response("Missing structured data", { status: 400 });
    }

    const flow = structuredData.flow;

    if (flow === "new_job") {
      const {
        name,
        phone,
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

      const { error } = await supabase.from("customer_inquiries").insert({
        flow: "new_job",
        name,
        phone,
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
      });

      if (error) {
        console.error("Insert error (customer_inquiries):", error.message);
        return new Response("Database error", { status: 500 });
      }

      return new Response("New job saved", { status: 200 });
    }

    if (flow === "existing_job_message") {
      const { name, phone, email, message } = structuredData;

      const { error } = await supabase.from("customer_messages").insert({
        name,
        phone,
        email,
        message,
        call_sid: callId,
      });

      if (error) {
        console.error("Insert error (customer_messages):", error.message);
        return new Response(`Database error: ${error.message}`, { status: 500 });
      }

      return new Response("Message saved", { status: 200 });
    }

    return new Response("Unknown flow type", { status: 400 });
  } catch (err) {
    console.error("Webhook error:", err);
    return new Response("Bad request", { status: 400 });
  }
});
