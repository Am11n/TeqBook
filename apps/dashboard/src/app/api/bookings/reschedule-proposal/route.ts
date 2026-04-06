import { NextRequest, NextResponse } from "next/server";
import { createClientForRouteHandler } from "@/lib/supabase/server";
import { authenticateAndVerifySalon } from "@/lib/api-auth";
import { enforceSameOrigin } from "@/lib/api-security";
import { checkRateLimit, incrementRateLimit } from "@/lib/services/rate-limit-service";
import { getRateLimitPolicy } from "@teqbook/shared/services/rate-limit";
import { REQUEST_ID_HEADER, getRequestIdFromHeaders } from "@teqbook/shared";
import { logError, logInfo, logWarn } from "@/lib/services/logger";
import { sendRescheduleProposalRequest } from "@/lib/services/email-service";
import { sendSms } from "@/lib/services/sms";
import { getSalonById } from "@/lib/repositories/salons";
import { getBillingWindow } from "@/lib/services/sms/billing-window";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const E164_REGEX = /^\+[1-9]\d{1,14}$/;

function normalizeToE164(input?: string | null): string | null {
  if (!input) return null;
  const trimmed = input.trim();
  if (!trimmed) return null;
  const normalized = trimmed.replace(/[^\d+]/g, "").replace(/(?!^)\+/g, "");
  return E164_REGEX.test(normalized) ? normalized : null;
}

function publicAppBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_APP_URL || "";
  return raw.replace(/\/$/, "");
}

type Body = {
  bookingId?: string;
  salonId?: string;
  proposedStartUtc?: string;
  proposedEndUtc?: string;
  language?: string;
};

export async function POST(request: NextRequest) {
  const response = NextResponse.next();
  const requestId = getRequestIdFromHeaders(request.headers);
  const rateLimitPolicy = getRateLimitPolicy("dashboard-reschedule-proposal");

  try {
    const csrfGuard = enforceSameOrigin(request);
    if (csrfGuard) return csrfGuard;

    const body = (await request.json()) as Body;
    const { bookingId, salonId: bodySalonId, proposedStartUtc, proposedEndUtc, language } = body;

    if (!bookingId || !UUID_REGEX.test(bookingId)) {
      return NextResponse.json({ error: "Invalid bookingId" }, { status: 400 });
    }
    if (!proposedStartUtc || !proposedEndUtc) {
      return NextResponse.json({ error: "proposedStartUtc and proposedEndUtc are required" }, { status: 400 });
    }

    const supabase = createClientForRouteHandler(request, response, requestId);

    const { data: bookingRow, error: bookingErr } = await supabase
      .from("bookings")
      .select(
        "id, salon_id, start_time, end_time, customers(full_name, email, phone), services(name), employees(full_name)",
      )
      .eq("id", bookingId)
      .maybeSingle();

    if (bookingErr || !bookingRow) {
      return NextResponse.json({ error: bookingErr?.message || "Booking not found" }, { status: 404 });
    }

    const salonId = bodySalonId || bookingRow.salon_id;
    const authResult = await authenticateAndVerifySalon(request, salonId, response);
    if (authResult.error || !authResult.user || !authResult.hasAccess) {
      const statusCode = !authResult.user ? 401 : 403;
      return NextResponse.json({ error: authResult.error || "Unauthorized" }, { status: statusCode });
    }

    const rlId = `${authResult.user.id}:${salonId}`;
    const rl = await checkRateLimit(rlId, "dashboard-reschedule-proposal", {
      identifierType: "user_id",
      failurePolicy: rateLimitPolicy.failurePolicy,
    });
    if (!rl.allowed) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }
    await incrementRateLimit(rlId, "dashboard-reschedule-proposal", {
      identifierType: "user_id",
      failurePolicy: rateLimitPolicy.failurePolicy,
    });

    const customer = bookingRow.customers as { full_name?: string; email?: string | null; phone?: string | null } | null;
    const email = customer?.email?.trim() || null;
    const phone = normalizeToE164(customer?.phone);

    if (!email && !phone) {
      return NextResponse.json(
        { error: "Customer needs an email or E.164 phone to receive the proposal" },
        { status: 400 },
      );
    }

    const publicBase = publicAppBaseUrl();
    if (!publicBase) {
      logError("reschedule-proposal missing NEXT_PUBLIC_APP_URL", new Error("no public base"), { requestId });
      return NextResponse.json({ error: "Server is not configured with a public app URL" }, { status: 500 });
    }

    const { data: createRows, error: createErr } = await supabase.rpc("create_booking_reschedule_proposal", {
      p_salon_id: salonId,
      p_booking_id: bookingId,
      p_proposed_start_time: proposedStartUtc,
      p_proposed_end_time: proposedEndUtc,
    });

    if (createErr) {
      logWarn("create_booking_reschedule_proposal failed", { requestId, message: createErr.message });
      return NextResponse.json({ error: createErr.message }, { status: 400 });
    }

    const created = (Array.isArray(createRows) ? createRows[0] : createRows) as
      | { ok?: boolean; proposal_id?: string; raw_token?: string; error_code?: string; message?: string }
      | undefined;

    if (!created?.ok || !created.proposal_id || !created.raw_token) {
      return NextResponse.json(
        { error: created?.message || created?.error_code || "Could not create proposal" },
        { status: 400 },
      );
    }

    const respondUrl = `${publicBase}/booking/reschedule?token=${encodeURIComponent(created.raw_token)}`;
    const lang = language || "en";
    const { data: salonRow } = await getSalonById(salonId);
    const salonName = salonRow?.name || "Salon";
    const timezone = salonRow?.timezone || "UTC";
    const serviceName = (bookingRow.services as { name?: string } | null)?.name || "Appointment";
    const customerName = customer?.full_name || "Customer";

    const deliveryAttempts: { channel: string; success: boolean; error?: string; id?: string }[] = [];

    if (email) {
      const emailResult = await sendRescheduleProposalRequest({
        recipientEmail: email,
        salonName,
        serviceName,
        customerName,
        previousStartIso: bookingRow.start_time,
        previousEndIso: bookingRow.end_time,
        proposedStartIso: proposedStartUtc,
        proposedEndIso: proposedEndUtc,
        timezone,
        respondUrl,
        language: lang,
        salonId,
      });
      deliveryAttempts.push({
        channel: "email",
        success: !emailResult.error && !!emailResult.data,
        error: emailResult.error || undefined,
        id: emailResult.data?.id,
      });
    }

    if (phone) {
      const { periodStart, periodEnd } = getBillingWindow(salonRow?.current_period_end ?? null);
      const smsBody =
        lang === "nb"
          ? `${salonName}: Ny tid foreslått for ${serviceName}. Svar innen 15 min: ${respondUrl}`
          : `${salonName}: Proposed new time for ${serviceName}. Respond within 15 min: ${respondUrl}`;
      const smsResult = await sendSms({
        salonId,
        recipient: phone,
        type: "booking_reschedule_proposal",
        body: smsBody,
        billingPeriodStart: periodStart,
        billingPeriodEnd: periodEnd,
        idempotencyKey: `${created.proposal_id}:sms`,
        bookingId,
        metadata: { request_id: requestId },
      });
      deliveryAttempts.push({
        channel: "sms",
        success: smsResult.allowed && smsResult.status === "sent",
        error: smsResult.error || smsResult.blockedReason,
        id: smsResult.providerMessageId || smsResult.logId,
      });
    }

    const anyOk = deliveryAttempts.some((a) => a.success);

    const { data: actRows, error: actErr } = await supabase.rpc("activate_booking_reschedule_proposal", {
      p_proposal_id: created.proposal_id,
      p_salon_id: salonId,
      p_delivery_attempts: deliveryAttempts,
      p_any_channel_succeeded: anyOk,
    });

    if (actErr) {
      logError("activate_booking_reschedule_proposal failed", actErr, { requestId, proposalId: created.proposal_id });
      return NextResponse.json({ error: actErr.message }, { status: 500 });
    }

    const activated = (Array.isArray(actRows) ? actRows[0] : actRows) as
      | { ok?: boolean; error_code?: string; message?: string }
      | undefined;

    logInfo("reschedule proposal flow completed", {
      requestId,
      proposalId: created.proposal_id,
      anyChannelSucceeded: anyOk,
      activateErrorCode: activated?.error_code,
    });

    return NextResponse.json(
      {
        proposalId: created.proposal_id,
        deliveryAttempts,
        pendingCustomer: anyOk,
        notificationFailed: !anyOk,
        message: activated?.message,
      },
      { status: 200, headers: { [REQUEST_ID_HEADER]: requestId } },
    );
  } catch (e) {
    logError("reschedule-proposal route error", e, { requestId });
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
