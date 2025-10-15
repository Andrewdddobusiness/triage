import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

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

function normalizeToE164(phone: string | null): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");

  if (digits.startsWith("61")) {
    return `+${digits}`;
  }

  if (digits.startsWith("0") && digits.length === 10) {
    return `+61${digits.slice(1)}`;
  }

  if (digits.length === 9) {
    return `+61${digits}`;
  }

  return phone.startsWith("+") ? phone : null;
}

function normalizeToLocal(phone: string | null): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");

  if (digits.startsWith("61")) {
    return `0${digits.slice(2)}`;
  }

  if (digits.startsWith("0")) {
    return digits;
  }

  if (digits.length === 9) {
    return `0${digits}`;
  }

  return phone;
}

function generatePhoneFormats(phone: string | null): string[] {
  if (!phone) return [];

  const formats = new Set<string>();
  formats.add(phone);

  const e164 = normalizeToE164(phone);
  if (e164) {
    formats.add(e164);
    if (e164.length === 12) {
      formats.add(`${e164.slice(0, 3)} ${e164.slice(3, 6)} ${e164.slice(6, 9)} ${e164.slice(9)}`);
      formats.add(`${e164.slice(0, 3)} (0) ${e164.slice(3, 6)} ${e164.slice(6, 9)} ${e164.slice(9)}`);
    }
  }

  const local = normalizeToLocal(phone);
  if (local) {
    formats.add(local);
    if (local.length === 10) {
      formats.add(`${local.slice(0, 4)} ${local.slice(4, 7)} ${local.slice(7)}`);
      formats.add(`(${local.slice(0, 2)}) ${local.slice(2, 6)} ${local.slice(6)}`);
    }
  }

  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("61")) {
    formats.add(digits.slice(2));
  } else if (digits.startsWith("0")) {
    formats.add(digits.slice(1));
  }

  return Array.from(formats).filter(Boolean);
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "GET" && req.method !== "POST") {
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
      .select("id")
      .eq("auth_user_id", user.id)
      .single();

    if (spError || !serviceProvider) {
      console.error("Service provider not found:", spError);
      return jsonResponse({ success: true, data: [] });
    }

    const { data: phoneNumbers, error: phoneError } = await supabase
      .from("twilio_phone_numbers")
      .select("phone_number")
      .eq("assigned_to", serviceProvider.id)
      .not("assigned_at", "is", null);

    if (phoneError) {
      console.error("Error fetching phone numbers:", phoneError);
      return jsonResponse({ success: false, error: "Failed to fetch phone numbers" }, 500);
    }

    const { data: assistants, error: assistantError } = await supabase
      .from("service_provider_assistants")
      .select("assistant_id")
      .eq("service_provider_id", serviceProvider.id);

    if (assistantError) {
      console.error("Error fetching assistants:", assistantError);
      return jsonResponse({ success: false, error: "Failed to fetch assistants" }, 500);
    }

    const phoneFormats = new Set<string>();
    (phoneNumbers || []).forEach((entry) => {
      generatePhoneFormats(entry.phone_number).forEach((format) => phoneFormats.add(format));
    });

    const assistantIds = new Set<string>();
    (assistants || []).forEach((assistant) => {
      if (assistant.assistant_id) {
        assistantIds.add(assistant.assistant_id);
      }
    });

    const inquiriesMap = new Map<string, unknown>();

    if (phoneFormats.size > 0) {
      const { data: phoneMatches, error: phoneQueryError } = await supabase
        .from("customer_inquiries")
        .select("*")
        .in("business_phone", Array.from(phoneFormats))
        .order("created_at", { ascending: false });

      if (phoneQueryError) {
        console.error("Error fetching phone-based inquiries:", phoneQueryError);
        return jsonResponse({ success: false, error: "Failed to fetch inquiries" }, 500);
      }

      (phoneMatches || []).forEach((inquiry) => {
        inquiriesMap.set(inquiry.id, inquiry);
      });
    }

    if (assistantIds.size > 0) {
      const { data: assistantMatches, error: assistantQueryError } = await supabase
        .from("customer_inquiries")
        .select("*")
        .in("assistant_id", Array.from(assistantIds))
        .order("created_at", { ascending: false });

      if (assistantQueryError) {
        console.error("Error fetching assistant-based inquiries:", assistantQueryError);
        return jsonResponse({ success: false, error: "Failed to fetch inquiries" }, 500);
      }

      (assistantMatches || []).forEach((inquiry) => {
        inquiriesMap.set(inquiry.id, inquiry);
      });
    }

    const inquiries = Array.from(inquiriesMap.values()).sort((a: any, b: any) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return dateB - dateA;
    });

    return jsonResponse({ success: true, data: inquiries });
  } catch (error) {
    console.error("Unhandled error in get-inquiries:", error);
    return jsonResponse({ success: false, error: "Unexpected error" }, 500);
  }
});
