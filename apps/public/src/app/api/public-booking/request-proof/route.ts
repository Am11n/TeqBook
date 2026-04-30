import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase/admin";
import { checkRateLimit, incrementRateLimit } from "@/lib/services/rate-limit-service";
import { getRateLimitPolicy } from "@teqbook/shared/services/rate-limit";
import { getTrustedClientIp } from "@/lib/http/trusted-client-ip";
import { sendEmail } from "@/lib/services/email/core";
import { logInfo, logWarn } from "@/lib/services/logger";
import {
  PUBLIC_BOOKING_PROOF_RESEND_COOLDOWN_MS,
  PUBLIC_BOOKING_PROOF_TTL_MS,
  generatePublicBookingProofCode,
  hashPublicBookingProofCode,
  resolvePublicBookingProofCodeForRequest,
  toSecondsCeil,
} from "@/lib/security/public-booking-proof";

type RequestProofBody = {
  bookingId?: string;
  salonId?: string;
  customerEmail?: string;
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as RequestProofBody;
    const bookingId = body.bookingId?.trim();
    const salonId = body.salonId?.trim();
    const customerEmail = body.customerEmail?.trim().toLowerCase() ?? "";
    const ipIdentifier = getTrustedClientIp(request);
    const requestLogContext = { bookingId, salonId, customerEmail, ipIdentifier };

    if (!bookingId || !salonId || !customerEmail) {
      return NextResponse.json(
        { error: "bookingId, salonId and customerEmail are required" },
        { status: 400 },
      );
    }

    const rateLimitPolicy = getRateLimitPolicy("public-booking-request-proof");
    const rateLimitIdentifier = `${ipIdentifier}:${salonId}:${bookingId}`;
    const rateLimitResult = await checkRateLimit(rateLimitIdentifier, "public-booking-request-proof", {
      identifierType: "ip",
      failurePolicy: rateLimitPolicy.failurePolicy,
    });
    if (!rateLimitResult.allowed) {
      const retryAfterSec = rateLimitResult.resetTime
        ? toSecondsCeil(rateLimitResult.resetTime - Date.now())
        : toSecondsCeil(rateLimitPolicy.windowMs);
      logWarn("Public booking proof request blocked by rate limit", {
        ...requestLogContext,
        retryAfterSec,
      });
      return NextResponse.json(
        {
          error: "Rate limit exceeded",
          message: "Too many requests. Please try again later.",
          retryAfterSec,
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": rateLimitPolicy.maxAttempts.toString(),
            "X-RateLimit-Remaining": rateLimitResult.remainingAttempts.toString(),
            "X-RateLimit-Reset": rateLimitResult.resetTime
              ? Math.ceil(rateLimitResult.resetTime / 1000).toString()
              : Math.ceil((Date.now() + rateLimitPolicy.windowMs) / 1000).toString(),
            "Retry-After": retryAfterSec.toString(),
          },
        },
      );
    }

    await incrementRateLimit(rateLimitIdentifier, "public-booking-request-proof", {
      identifierType: "ip",
      failurePolicy: rateLimitPolicy.failurePolicy,
    });

    const admin = getAdminClient();
    const { data: bookingRow, error: bookingError } = await admin
      .from("bookings")
      .select("id, salon_id, customers(email)")
      .eq("id", bookingId)
      .eq("salon_id", salonId)
      .maybeSingle();

    if (bookingError || !bookingRow) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const bookingCustomer = Array.isArray(bookingRow.customers)
      ? bookingRow.customers[0]
      : bookingRow.customers;
    const authoritativeEmail = bookingCustomer?.email?.trim().toLowerCase() ?? "";
    if (!authoritativeEmail) {
      return NextResponse.json({ error: "Booking has no customer ownership proof" }, { status: 403 });
    }
    if (authoritativeEmail !== customerEmail) {
      return NextResponse.json({ error: "Customer ownership mismatch" }, { status: 403 });
    }

    const { data: existingProof } = await admin
      .from("public_booking_action_proofs")
      .select("created_at, expires_at")
      .eq("booking_id", bookingId)
      .maybeSingle();

    if (existingProof?.created_at) {
      const msSinceIssue = Date.now() - new Date(existingProof.created_at).getTime();
      const cooldownRemainingMs = PUBLIC_BOOKING_PROOF_RESEND_COOLDOWN_MS - msSinceIssue;
      if (cooldownRemainingMs > 0) {
        const retryAfterSec = toSecondsCeil(cooldownRemainingMs);
        logWarn("Public booking proof resend cooldown active", {
          ...requestLogContext,
          retryAfterSec,
        });
        return NextResponse.json(
          {
            error: "Please wait before requesting another verification code",
            retryAfterSec,
            cooldownActive: true,
          },
          {
            status: 429,
            headers: {
              "Retry-After": retryAfterSec.toString(),
            },
          },
        );
      }
    }

    const testCode = resolvePublicBookingProofCodeForRequest();
    const code = testCode ?? generatePublicBookingProofCode();
    const codeHash = hashPublicBookingProofCode({ bookingId, code });
    const expiresAt = new Date(Date.now() + PUBLIC_BOOKING_PROOF_TTL_MS).toISOString();

    const { error: upsertError } = await admin.from("public_booking_action_proofs").upsert(
      {
        booking_id: bookingId,
        code_hash: codeHash,
        expires_at: expiresAt,
        failed_attempts: 0,
      },
      { onConflict: "booking_id" },
    );

    if (upsertError) {
      logWarn("Could not persist public booking proof", {
        ...requestLogContext,
        reason: upsertError.message,
      });
      return NextResponse.json({ error: "Could not store verification code" }, { status: 500 });
    }

    const subject = "Your booking verification code";
    const html = `
      <p>Your verification code is:</p>
      <p style="font-size: 24px; font-weight: bold; letter-spacing: 4px;">${code}</p>
      <p>This code expires in 15 minutes. If you did not request this, you can ignore this email.</p>
    `;

    await sendEmail({
      to: customerEmail,
      subject,
      html,
      emailType: "booking_action_verification",
      salonId,
      metadata: { bookingId, kind: "public_booking_action_proof" },
    });

    logInfo("Public booking proof code issued", {
      ...requestLogContext,
      expiresAt,
      resendAvailableInSec: toSecondsCeil(PUBLIC_BOOKING_PROOF_RESEND_COOLDOWN_MS),
    });

    return NextResponse.json(
      {
        ok: true,
        expiresAt,
        resendAvailableInSec: toSecondsCeil(PUBLIC_BOOKING_PROOF_RESEND_COOLDOWN_MS),
      },
      { status: 200 },
    );
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
