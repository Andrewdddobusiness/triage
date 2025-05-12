import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

// Environment variables
const VAPI_API_KEY = Deno.env.get("VAPI_API_KEY")!;
const VAPI_API_BASE = "https://api.vapi.ai";
const WEBHOOK_URL = "https://kiuwkrlaozjfpwwyiqpr.supabase.co/functions/v1/vapi_call_webhook";

// Supabase setup
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, serviceRoleKey);

// Helper: Fetch full call details from Vapi
async function fetchCallDetails(callId: string) {
  try {
    const res = await fetch(`${VAPI_API_BASE}/call/${callId}`, {
      headers: { Authorization: `Bearer ${VAPI_API_KEY}` },
    });

    if (!res.ok) {
      console.error(`Failed to fetch call ${callId}. Status: ${res.status}`);
      return null;
    }

    return await res.json();
  } catch (err) {
    console.error(`Error fetching details for call ${callId}:`, err);
    return null;
  }
}

// Helper: Fetch ended calls in the last hour
async function fetchRecentCalls() {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const url = `${VAPI_API_BASE}/call?createdAtGt=${encodeURIComponent(oneHourAgo)}`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${VAPI_API_KEY}` },
  });

  if (!res.ok) {
    console.error(`Failed to fetch recent calls. Status: ${res.status}`);
    return [];
  }

  return await res.json();
}

// Main polling function
async function processCalls() {
  console.log("Polling recent calls...");
  const calls = await fetchRecentCalls();

  const results = [];

  for (const call of calls) {
    const callId = call.id;
    if (!callId || call.status !== "ended") continue;

    // Skip if already exists in Supabase
    const { data: existing, error } = await supabase
      .from("customer_inquiries")
      .select("id")
      .eq("call_sid", callId)
      .limit(1);

    if (error) {
      console.error(`DB check failed for call ${callId}:`, error.message);
      continue;
    }

    if (existing && existing.length > 0) {
      console.log(`Call ${callId} already processed. Skipping.`);
      continue;
    }

    const full = await fetchCallDetails(callId);
    if (!full?.analysis?.structuredData) {
      console.warn(`Call ${callId} missing structuredData. Skipping.`);
      continue;
    }

    const payload = {
      structuredData: full.analysis.structuredData,
      callId: full.id,
      assistantId: full.assistantId,
    };

    try {
      const res = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${serviceRoleKey}`,
        },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      console.log(`Webhook response for call ${callId}:`, text);
      results.push({ callId, status: res.status });
    } catch (err) {
      console.error(`Failed to send webhook for call ${callId}:`, err);
      results.push({ callId, status: 500 });
    }
  }

  return results;
}

// HTTP handler
serve(async () => {
  console.log("Poller function triggered");
  try {
    const start = Date.now();
    const results = await processCalls();
    const duration = Date.now() - start;
    return new Response(`Processed ${results.length} calls in ${duration}ms`, { status: 200 });
  } catch (err) {
    console.error("Poller crash:", err);
    return new Response("Internal error", { status: 500 });
  }
});
