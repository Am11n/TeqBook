// =====================================================
// SMS Status Webhook (Twilio)
// =====================================================
// Updates sms_log status fields from provider callbacks.
// Idempotent on provider_message_id + status.
// =====================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type, x-twilio-signature, x-twilio-request-timestamp",
};

type SmsStatus = "sent" | "delivered" | "undelivered" | "failed";

export function mapTwilioStatus(status?: string): SmsStatus | null {
  if (!status) return null;
  if (status === "sent") return "sent";
  if (status === "delivered") return "delivered";
  if (status === "undelivered") return "undelivered";
  if (status === "failed") return "failed";
  return null;
}

export function statusRank(status: SmsStatus): number {
  if (status === "sent") return 1;
  if (status === "delivered") return 2;
  if (status === "undelivered" || status === "failed") return 3;
  return 0;
}

function toBase64(bytes: Uint8Array): string {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary);
}

function safeEqual(a: string, b: string): boolean {
  const aBytes = new TextEncoder().encode(a);
  const bBytes = new TextEncoder().encode(b);
  if (aBytes.length !== bBytes.length) return false;
  let diff = 0;
  for (let i = 0; i < aBytes.length; i += 1) {
    diff |= aBytes[i] ^ bBytes[i];
  }
  return diff === 0;
}

export function buildTwilioSignaturePayload(url: string, params: URLSearchParams): string {
  const entries = Array.from(params.entries()).sort(([a], [b]) => a.localeCompare(b));
  let payload = url;
  for (const [key, value] of entries) {
    payload += `${key}${value}`;
  }
  return payload;
}

export async function computeTwilioSignature(payload: string, authToken: string): Promise<string> {
  const enc = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    enc.encode(authToken),
    { name: "HMAC", hash: "SHA-1" },
    false,
    ["sign"]
  );
  const signatureBytes = new Uint8Array(
    await crypto.subtle.sign("HMAC", cryptoKey, enc.encode(payload))
  );
  return toBase64(signatureBytes);
}

export async function isValidTwilioSignature(options: {
  requestUrl: string;
  canonicalUrl?: string | null;
  params: URLSearchParams;
  providedSignature: string;
  authToken: string;
}): Promise<boolean> {
  const urlCandidates = [options.canonicalUrl, options.requestUrl].filter(
    (value): value is string => typeof value === "string" && value.length > 0
  );

  for (const candidate of urlCandidates) {
    const payload = buildTwilioSignaturePayload(candidate, options.params);
    const expectedSignature = await computeTwilioSignature(payload, options.authToken);
    if (safeEqual(expectedSignature, options.providedSignature)) {
      return true;
    }
  }
  return false;
}

export async function handleSmsStatusWebhook(req: Request) {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const providedSignature = req.headers.get("x-twilio-signature") ?? "";
    const twilioAuthToken = Deno.env.get("TWILIO_AUTH_TOKEN") ?? "";
    const twilioCanonicalWebhookUrl = Deno.env.get("TWILIO_STATUS_WEBHOOK_URL") ?? "";
    if (!providedSignature || !twilioAuthToken) {
      return new Response("Unauthorized", { status: 401, headers: corsHeaders });
    }

    // Twilio replay guard: enforce freshness when timestamp header exists.
    const timestampHeader = req.headers.get("x-twilio-request-timestamp");
    if (timestampHeader) {
      const timestampSec = Number.parseInt(timestampHeader, 10);
      if (Number.isFinite(timestampSec)) {
        const nowSec = Math.floor(Date.now() / 1000);
        const skewSec = Math.abs(nowSec - timestampSec);
        if (skewSec > 300) {
          return new Response("Stale callback", { status: 401, headers: corsHeaders });
        }
      }
    }

    const rawBody = await req.text();
    const params = new URLSearchParams(rawBody);
    const signatureIsValid = await isValidTwilioSignature({
      requestUrl: req.url,
      canonicalUrl: twilioCanonicalWebhookUrl,
      params,
      providedSignature,
      authToken: twilioAuthToken,
    });
    if (!signatureIsValid) {
      return new Response("Unauthorized", { status: 401, headers: corsHeaders });
    }

    const messageSid = params.get("MessageSid");
    const messageStatus = params.get("MessageStatus");
    const errorCode = params.get("ErrorCode");

    if (!messageSid || !messageStatus) {
      return new Response("Bad Request", { status: 400, headers: corsHeaders });
    }

    const mappedStatus = mapTwilioStatus(messageStatus);
    if (!mappedStatus) {
      return new Response(
        JSON.stringify({ success: true, ignored: true, reason: "status_not_mapped" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: existing } = await supabase
      .from("sms_log")
      .select("id, status, metadata")
      .eq("provider_message_id", messageSid)
      .maybeSingle();

    if (!existing) {
      return new Response(JSON.stringify({ success: true, ignored: true, reason: "message_not_found" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const previousStatus = mapTwilioStatus(existing.status ?? undefined);
    if (previousStatus && statusRank(mappedStatus) < statusRank(previousStatus)) {
      return new Response(JSON.stringify({ success: true, ignored: true, reason: "status_regression" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (existing.status === mappedStatus) {
      return new Response(JSON.stringify({ success: true, idempotent: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const mergedMetadata =
      existing.metadata && typeof existing.metadata === "object"
        ? {
            ...(existing.metadata as Record<string, unknown>),
            twilio_status: messageStatus,
            twilio_error_code: errorCode,
            twilio_signature_verified: true,
            twilio_request_timestamp: timestampHeader,
            twilio_status_rank: statusRank(mappedStatus),
          }
        : {
            twilio_status: messageStatus,
            twilio_error_code: errorCode,
            twilio_signature_verified: true,
            twilio_request_timestamp: timestampHeader,
            twilio_status_rank: statusRank(mappedStatus),
          };

    const { error } = await supabase
      .from("sms_log")
      .update({
        status: mappedStatus,
        delivered_at: mappedStatus === "delivered" ? new Date().toISOString() : null,
        error_message: errorCode ? `Twilio error ${errorCode}` : null,
        metadata: mergedMetadata,
      })
      .eq("id", existing.id);

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
}

if (import.meta.main) {
  serve(handleSmsStatusWebhook);
}
