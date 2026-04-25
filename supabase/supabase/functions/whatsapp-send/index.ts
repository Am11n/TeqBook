// =====================================================
// WhatsApp Send Edge Function
// =====================================================
// Sends WhatsApp messages via external API (e.g., Twilio, WhatsApp Business API)
// This is a template that needs to be configured with your WhatsApp provider

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { authenticateRequest, authorizeSalonAccess } from "../_shared/auth.ts";
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
  /** Required when WHATSAPP_SEND_ENABLED=true (tenant-scoped send). */
  salon_id?: string;
  booking_id?: string;
}

function isAllowedWhatsappApiUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") return false;
    const host = parsed.hostname.toLowerCase();
    return (
      host === "api.twilio.com" ||
      host.endsWith(".twilio.com") ||
      host === "graph.facebook.com" ||
      host.endsWith(".facebook.com")
    );
  } catch {
    return false;
  }
}

function normalizeE164(input: string | null | undefined): string | null {
  if (!input) return null;
  const trimmed = input.trim();
  if (!trimmed) return null;
  const normalized = trimmed.replace(/[^\d+]/g, "").replace(/(?!^)\+/g, "");
  const phoneRegex = /^\+[1-9]\d{1,14}$/;
  return phoneRegex.test(normalized) ? normalized : null;
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

    if (Deno.env.get("WHATSAPP_SEND_ENABLED") !== "true") {
      return new Response(
        JSON.stringify({
          error: "WhatsApp send is disabled",
          hint: "Set WHATSAPP_SEND_ENABLED=true only after WHATSAPP_API_URL points to an allowed HTTPS host and salon_id is enforced.",
        }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } },
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

    const salonId = typeof body.salon_id === "string" ? body.salon_id.trim() : "";
    if (!salonId) {
      return new Response(JSON.stringify({ error: "Missing required field: salon_id" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const authz = await authorizeSalonAccess(user.id, salonId, supabaseUrl, supabaseServiceKey);
    if (!authz.allowed) {
      return new Response(JSON.stringify({ error: authz.error ?? "Forbidden" }), {
        status: authz.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const bookingId = typeof body.booking_id === "string" ? body.booking_id.trim() : "";
    if (!bookingId) {
      return new Response(JSON.stringify({ error: "Missing required field: booking_id" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { data: bookingRow, error: bookingError } = await supabase
      .from("bookings")
      .select("id, salon_id, customers(phone), employees(phone)")
      .eq("id", bookingId)
      .eq("salon_id", salonId)
      .maybeSingle();
    if (bookingError || !bookingRow) {
      return new Response(JSON.stringify({ error: "Booking not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const customerRaw = Array.isArray((bookingRow as { customers?: unknown }).customers)
      ? (bookingRow as { customers?: Array<{ phone?: string | null }> }).customers?.[0]
      : (bookingRow as { customers?: { phone?: string | null } | null }).customers;
    const employeeRaw = Array.isArray((bookingRow as { employees?: unknown }).employees)
      ? (bookingRow as { employees?: Array<{ phone?: string | null }> }).employees?.[0]
      : (bookingRow as { employees?: { phone?: string | null } | null }).employees;
    const allowedRecipients = new Set<string>();
    const normalizedCustomer = normalizeE164(customerRaw?.phone ?? null);
    const normalizedEmployee = normalizeE164(employeeRaw?.phone ?? null);
    if (normalizedCustomer) allowedRecipients.add(normalizedCustomer);
    if (normalizedEmployee) allowedRecipients.add(normalizedEmployee);
    if (!allowedRecipients.has(body.to)) {
      return new Response(
        JSON.stringify({
          error: "Recipient is not allowed for this salon/booking policy",
        }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (!whatsappApiUrl || !isAllowedWhatsappApiUrl(whatsappApiUrl)) {
      return new Response(
        JSON.stringify({
          error: "WHATSAPP_API_URL must be an https URL on an allowlisted host (Twilio or Meta Graph API)",
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

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
      await response.text();
      return new Response(
        JSON.stringify({
          error: "Failed to send WhatsApp message",
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
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

