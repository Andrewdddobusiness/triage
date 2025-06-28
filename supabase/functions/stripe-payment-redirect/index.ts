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
    
    // Redirect to your web app pages instead of deep links
    const redirectUrl = status === "success" 
      ? `${Deno.env.get("NEXT_PUBLIC_SITE_URL") || "http://localhost:3000"}/dashboard/billing?payment=success`
      : `${Deno.env.get("NEXT_PUBLIC_SITE_URL") || "http://localhost:3000"}/dashboard/billing?payment=cancelled`;
    
    return new Response(null, {
      status: 302,
      headers: {
        "Location": redirectUrl,
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
