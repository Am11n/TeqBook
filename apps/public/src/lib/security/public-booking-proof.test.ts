import { describe, expect, it, vi } from "vitest";
import {
  hashPublicBookingProofCode,
  verifyPublicBookingProofCode,
} from "@/lib/security/public-booking-proof";

describe("public-booking-proof", () => {
  it("verifyPublicBookingProofCode accepts matching code", () => {
    vi.stubEnv("TEQBOOK_PUBLIC_BOOKING_PROOF_SECRET", "unit-test-pepper");
    const bookingId = "550e8400-e29b-41d4-a716-446655440000";
    const code = "123456";
    const storedHash = hashPublicBookingProofCode({ bookingId, code });
    expect(
      verifyPublicBookingProofCode({ bookingId, code, storedHash }),
    ).toBe(true);
    expect(
      verifyPublicBookingProofCode({ bookingId, code: "000000", storedHash }),
    ).toBe(false);
    vi.unstubAllEnvs();
  });
});
