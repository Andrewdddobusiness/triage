import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const status = url.searchParams.get("status");
    
    const deepLink = status === "success" ? "spaak://payment-success" : "spaak://payment-cancelled";
    
    // Just do a direct redirect without any HTML
    return new Response(null, {
      status: 302,
      headers: {
        "Location": deepLink,
        ...corsHeaders,
      },
    });
  } catch (error) {
    return new Response("Error", {
      status: 500,
      headers: corsHeaders,
    });
  }
});
