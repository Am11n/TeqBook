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
  "Access-Control-Allow-Headers": "content-type, x-twilio-signature",
};

function mapTwilioStatus(status?: string): "sent" | "delivered" | "undelivered" | "failed" | null {
  if (!status) return null;
  if (status === "sent") return "sent";
  if (status === "delivered") return "delivered";
  if (status === "undelivered") return "undelivered";
  if (status === "failed") return "failed";
  return null;
}

function toBase64(bytes: Uint8Array): string {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary);
}

async function isValidTwilioSignature(
  requestUrl: string,
  form: FormData,
  providedSignature: string,
  authToken: string
): Promise<boolean> {
  const params: Array<[string, string]> = [];
  for (const [key, value] of form.entries()) {
    params.push([key, String(value)]);
  }
  params.sort((a, b) => a[0].localeCompare(b[0]));

  let payload = requestUrl;
  for (const [key, value] of params) {
    payload += `${key}${value}`;
  }

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
  const expectedSignature = toBase64(signatureBytes);
  return expectedSignature === providedSignature;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const providedSignature = req.headers.get("x-twilio-signature") ?? "";
    const twilioAuthToken = Deno.env.get("TWILIO_AUTH_TOKEN") ?? "";
    if (!providedSignature || !twilioAuthToken) {
      return new Response("Unauthorized", { status: 401, headers: corsHeaders });
    }

    const form = await req.formData();
    const signatureIsValid = await isValidTwilioSignature(
      req.url,
      form,
      providedSignature,
      twilioAuthToken
    );
    if (!signatureIsValid) {
      return new Response("Unauthorized", { status: 401, headers: corsHeaders });
    }

    const messageSid = (form.get("MessageSid") as string | null) ?? null;
    const messageStatus = (form.get("MessageStatus") as string | null) ?? null;
    const errorCode = (form.get("ErrorCode") as string | null) ?? null;

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
          }
        : { twilio_status: messageStatus, twilio_error_code: errorCode };

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
});
