import { createHash, randomInt, timingSafeEqual } from "node:crypto";

export const PUBLIC_BOOKING_PROOF_TTL_MS = 15 * 60 * 1000;
export const PUBLIC_BOOKING_PROOF_MAX_FAILED_ATTEMPTS = 8;

export function getPublicBookingProofPepper(): string {
  const explicit = process.env.TEQBOOK_PUBLIC_BOOKING_PROOF_SECRET?.trim();
  if (explicit) return explicit;
  const actionSecret = process.env.PUBLIC_BOOKING_ACTION_TOKEN_SECRET?.trim();
  if (actionSecret) return `${actionSecret}:teqbook-public-booking-proof`;
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "Set TEQBOOK_PUBLIC_BOOKING_PROOF_SECRET or PUBLIC_BOOKING_ACTION_TOKEN_SECRET for booking proof hashing",
    );
  }
  return "dev-local-public-booking-proof-pepper";
}

export function generatePublicBookingProofCode(): string {
  return randomInt(0, 1_000_000).toString().padStart(6, "0");
}

export function hashPublicBookingProofCode(params: { bookingId: string; code: string }): string {
  return createHash("sha256")
    .update(`${getPublicBookingProofPepper()}:${params.bookingId}:${params.code}`)
    .digest("hex");
}

export function verifyPublicBookingProofCode(params: {
  bookingId: string;
  code: string;
  storedHash: string;
}): boolean {
  const computed = hashPublicBookingProofCode({ bookingId: params.bookingId, code: params.code });
  try {
    return timingSafeEqual(Buffer.from(computed, "hex"), Buffer.from(params.storedHash, "hex"));
  } catch {
    return false;
  }
}

export function resolvePublicBookingProofCodeForRequest(): string | null {
  const testCode = process.env.TEQBOOK_PUBLIC_BOOKING_PROOF_TEST_CODE?.trim();
  if (process.env.NODE_ENV === "test" && testCode && /^\d{6}$/.test(testCode)) {
    return testCode;
  }
  return null;
}
