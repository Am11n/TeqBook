// =====================================================
// WhatsApp Send Edge Function
// =====================================================
// Sends WhatsApp messages via external API (e.g., Twilio, WhatsApp Business API)
// This is a template that needs to be configured with your WhatsApp provider

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { authenticateRequest } from "../_shared/auth.ts";
import { checkRateLimit, createRateLimitErrorResponse } from "../_shared/rate-limit.ts";

function extractIdentifier(
  req: Request,
  user: { id: string } | null
): { identifier: string; identifierType: "ip" | "user_id" } {
  if (user?.id) {
    return { identifier: user.id, identifierType: "user_id" };
  }
  const forwardedFor = req.headers.get("x-forwarded-for");
  const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : "unknown";
  return { identifier: ip, identifierType: "ip" };
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface WhatsAppMessageRequest {
  to: string; // Phone number with country code (e.g., +4799999999)
  message: string;
  salon_id?: string; // Optional: for logging/auditing
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get environment variables
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const whatsappApiKey = Deno.env.get("WHATSAPP_API_KEY") ?? "";
    const whatsappApiUrl = Deno.env.get("WHATSAPP_API_URL") ?? "";

    // Authenticate request
    const { user, error: authError } = await authenticateRequest(
      req,
      supabaseUrl,
      supabaseAnonKey
    );

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized", details: authError }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Check rate limit
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const rateLimitResult = await checkRateLimit(
      req,
      {
        endpointType: "whatsapp-send",
        supabaseUrl,
        supabaseServiceKey,
      },
      user
    );

    if (!rateLimitResult.allowed) {
      const { identifier, identifierType } = extractIdentifier(req, user);
      return createRateLimitErrorResponse(
        rateLimitResult,
        identifier,
        identifierType,
        "whatsapp-send",
        supabaseUrl,
        supabaseServiceKey
      );
    }

    // Parse request body
    const body: WhatsAppMessageRequest = await req.json();

    // Validate request
    if (!body.to || !body.message) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: to, message" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Validate phone number format (basic check)
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    if (!phoneRegex.test(body.to)) {
      return new Response(
        JSON.stringify({
          error: "Invalid phone number format. Must be E.164 format (e.g., +4799999999)",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // TODO: Integrate with your WhatsApp provider
    // Example with generic HTTP API:
    const response = await fetch(whatsappApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${whatsappApiKey}`,
      },
      body: JSON.stringify({
        to: body.to,
        message: body.message,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return new Response(
        JSON.stringify({
          error: "Failed to send WhatsApp message",
          details: errorText,
        }),
        {
          status: response.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const result = await response.json();

    return new Response(
      JSON.stringify({
        success: true,
        messageId: result.id || result.message_id,
        to: body.to,
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          ...rateLimitResult.headers,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

