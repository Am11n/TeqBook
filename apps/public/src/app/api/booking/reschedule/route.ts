import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { checkRateLimit, incrementRateLimit } from "@/lib/services/rate-limit-service";
import { getRateLimitPolicy } from "@teqbook/shared/services/rate-limit";
import { logError, logInfo, logWarn } from "@/lib/services/logger";

function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

type Action = "accept" | "decline";

export async function POST(request: NextRequest) {
  const rateLimitPolicy = getRateLimitPolicy("public-booking-reschedule");

  try {
    const body = (await request.json()) as { token?: string; action?: string; channel?: string };
    const token = typeof body.token === "string" ? body.token.trim() : "";
    const actionRaw = body.action;
    const action: Action | null = actionRaw === "accept" || actionRaw === "decline" ? actionRaw : null;
    const channel =
      body.channel === "sms_link" || body.channel === "email_link" ? body.channel : "email_link";

    if (!token || !action) {
      return NextResponse.json({ error: "token and action are required" }, { status: 400 });
    }

    const ipIdentifier = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const rateLimitIdentifier = `${ipIdentifier}:${token.slice(0, 12)}`;

    const rl = await checkRateLimit(rateLimitIdentifier, "public-booking-reschedule", {
      identifierType: "ip",
      failurePolicy: rateLimitPolicy.failurePolicy,
    });
    if (!rl.allowed) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }
    await incrementRateLimit(rateLimitIdentifier, "public-booking-reschedule", {
      identifierType: "ip",
      failurePolicy: rateLimitPolicy.failurePolicy,
    });

    const supabase = getAdminClient();
    const { data, error } = await supabase.rpc("respond_booking_reschedule_proposal", {
      p_token: token,
      p_action: action,
      p_response_channel: channel,
    });

    if (error) {
      logWarn("respond_booking_reschedule_proposal rpc error", { message: error.message });
      return NextResponse.json(
        { ok: false, message: error.message, resultStatus: "error" },
        { status: 400 },
      );
    }

    const row = (Array.isArray(data) ? data[0] : data) as
      | {
          ok?: boolean;
          message?: string;
          result_status?: string;
          booking_id?: string;
          salon_id?: string;
        }
      | undefined;

    logInfo("booking reschedule respond", {
      ok: row?.ok,
      result_status: row?.result_status,
    });

    return NextResponse.json(
      {
        ok: Boolean(row?.ok),
        message: row?.message,
        resultStatus: row?.result_status,
        bookingId: row?.booking_id,
        salonId: row?.salon_id,
      },
      { status: 200 },
    );
  } catch (e) {
    logError("public booking reschedule POST failed", e, {});
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
