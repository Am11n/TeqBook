import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase/admin";
import {
  issuePublicBookingActionToken,
  type PublicBookingActionPurpose,
  PUBLIC_BOOKING_ACTION_TOKEN_TTL_SECONDS,
} from "@/lib/security/public-booking-action-token";
import {
  PUBLIC_BOOKING_PROOF_MAX_FAILED_ATTEMPTS,
  verifyPublicBookingProofCode,
} from "@/lib/security/public-booking-proof";
import { checkRateLimit, incrementRateLimit } from "@/lib/services/rate-limit-service";
import { getRateLimitPolicy } from "@teqbook/shared/services/rate-limit";
import { getTrustedClientIp } from "@/lib/http/trusted-client-ip";

const VALID_PURPOSES = new Set<PublicBookingActionPurpose>(["confirmation", "notify", "cancel"]);

type ActionTokenRequest = {
  bookingId: string;
  salonId: string;
  customerEmail: string;
  purposes: PublicBookingActionPurpose[];
  proofCode: string;
};

function normalizePurposes(raw: unknown): PublicBookingActionPurpose[] | null {
  if (!Array.isArray(raw) || raw.length === 0) return null;
  const out: PublicBookingActionPurpose[] = [];
  const seen = new Set<string>();
  for (const entry of raw) {
    if (typeof entry !== "string" || !VALID_PURPOSES.has(entry as PublicBookingActionPurpose)) {
      return null;
    }
    const p = entry as PublicBookingActionPurpose;
    if (seen.has(p)) continue;
    seen.add(p);
    out.push(p);
  }
  return out.length ? out : null;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<ActionTokenRequest>;
    const bookingId = body.bookingId?.trim();
    const salonId = body.salonId?.trim();
    const customerEmail = body.customerEmail?.trim().toLowerCase() ?? "";
    const purposes = normalizePurposes(body.purposes);
    const proofCode = body.proofCode?.trim() ?? "";

    if (!bookingId || !salonId || !customerEmail) {
      return NextResponse.json(
        { error: "bookingId, salonId and customerEmail are required" },
        { status: 400 },
      );
    }

    if (!purposes) {
      return NextResponse.json(
        {
          error:
            "purposes must be a non-empty array of unique values: confirmation, notify, cancel",
        },
        { status: 400 },
      );
    }

    if (!/^\d{6}$/.test(proofCode)) {
      return NextResponse.json({ error: "proofCode must be a 6-digit verification code" }, { status: 400 });
    }

    const rateLimitPolicy = getRateLimitPolicy("public-booking-action-token");
    const ipIdentifier = getTrustedClientIp(request);
    const rateLimitIdentifier = `${ipIdentifier}:${salonId}:${bookingId}`;
    const rateLimitResult = await checkRateLimit(rateLimitIdentifier, "public-booking-action-token", {
      identifierType: "ip",
      failurePolicy: rateLimitPolicy.failurePolicy,
    });
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded",
          message: "Too many requests. Please try again later.",
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": rateLimitPolicy.maxAttempts.toString(),
            "X-RateLimit-Remaining": rateLimitResult.remainingAttempts.toString(),
            "X-RateLimit-Reset": rateLimitResult.resetTime
              ? Math.ceil(rateLimitResult.resetTime / 1000).toString()
              : Math.ceil((Date.now() + rateLimitPolicy.windowMs) / 1000).toString(),
            "Retry-After": rateLimitResult.resetTime
              ? Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString()
              : Math.ceil(rateLimitPolicy.windowMs / 1000).toString(),
          },
        },
      );
    }

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

    const { data: proofRow, error: proofSelectError } = await admin
      .from("public_booking_action_proofs")
      .select("code_hash, expires_at, failed_attempts")
      .eq("booking_id", bookingId)
      .maybeSingle();

    if (proofSelectError) {
      return NextResponse.json({ error: "Verification lookup failed" }, { status: 500 });
    }
    if (!proofRow) {
      return NextResponse.json(
        { error: 'No active verification code. Use "Resend code" on the booking page.' },
        { status: 403 },
      );
    }

    if (new Date(proofRow.expires_at).getTime() <= Date.now()) {
      await admin.from("public_booking_action_proofs").delete().eq("booking_id", bookingId);
      return NextResponse.json({ error: "Verification code expired" }, { status: 403 });
    }

    if (
      !verifyPublicBookingProofCode({
        bookingId,
        code: proofCode,
        storedHash: proofRow.code_hash,
      })
    ) {
      const nextFails = (proofRow.failed_attempts ?? 0) + 1;
      if (nextFails >= PUBLIC_BOOKING_PROOF_MAX_FAILED_ATTEMPTS) {
        await admin.from("public_booking_action_proofs").delete().eq("booking_id", bookingId);
        return NextResponse.json(
          { error: "Too many incorrect attempts. Request a new verification code." },
          { status: 403 },
        );
      }
      await admin
        .from("public_booking_action_proofs")
        .update({ failed_attempts: nextFails })
        .eq("booking_id", bookingId);
      return NextResponse.json({ error: "Invalid verification code" }, { status: 403 });
    }

    await admin.from("public_booking_action_proofs").delete().eq("booking_id", bookingId);

    await incrementRateLimit(rateLimitIdentifier, "public-booking-action-token", {
      identifierType: "ip",
      failurePolicy: rateLimitPolicy.failurePolicy,
    });

    const tokens: Partial<Record<PublicBookingActionPurpose, string>> = {};
    for (const purpose of purposes) {
      tokens[purpose] = issuePublicBookingActionToken({
        bookingId,
        purpose,
        ttlSeconds: PUBLIC_BOOKING_ACTION_TOKEN_TTL_SECONDS[purpose],
      });
    }

    return NextResponse.json({ tokens }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
