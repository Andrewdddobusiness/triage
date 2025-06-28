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
    // Redirect back to the billing page in the web app
    const redirectUrl = `${Deno.env.get("NEXT_PUBLIC_SITE_URL") || "http://localhost:3000"}/dashboard/billing`;
    
    return new Response(null, {
      status: 302,
      headers: {
        "Location": redirectUrl,
        ...corsHeaders,
      },
    });
  } catch (error) {
    console.error("Customer portal redirect error:", error);
    
    // Fallback redirect to billing page
    const fallbackUrl = `${Deno.env.get("NEXT_PUBLIC_SITE_URL") || "http://localhost:3000"}/dashboard/billing`;
    
    return new Response(null, {
      status: 302,
      headers: {
        "Location": fallbackUrl,
        ...corsHeaders,
      },
    });
  }
});
