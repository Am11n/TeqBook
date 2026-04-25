import { describe, expect, it } from "vitest";
import {
  issuePublicBookingActionToken,
  verifyPublicBookingActionToken,
} from "@/lib/security/public-booking-action-token";

describe("public booking action token security", () => {
  const bookingId = "11111111-1111-4111-8111-111111111111";

  it("rejects forged token", () => {
    const result = verifyPublicBookingActionToken({
      token: "not.a.valid.token",
      bookingId,
      allowedPurposes: ["confirmation"],
    });
    expect(result.valid).toBe(false);
  });

  it("rejects expired token", () => {
    const token = issuePublicBookingActionToken({
      bookingId,
      purpose: "confirmation",
      ttlSeconds: -1,
    });
    const result = verifyPublicBookingActionToken({
      token,
      bookingId,
      allowedPurposes: ["confirmation"],
    });
    expect(result.valid).toBe(false);
  });

  it("accepts valid token with allowed purpose", () => {
    const token = issuePublicBookingActionToken({
      bookingId,
      purpose: "confirmation",
      ttlSeconds: 60,
    });
    const result = verifyPublicBookingActionToken({
      token,
      bookingId,
      allowedPurposes: ["confirmation"],
    });
    expect(result.valid).toBe(true);
  });

  it("rejects token when purpose does not match route", () => {
    const token = issuePublicBookingActionToken({
      bookingId,
      purpose: "notify",
      ttlSeconds: 60,
    });
    const result = verifyPublicBookingActionToken({
      token,
      bookingId,
      allowedPurposes: ["confirmation"],
    });
    expect(result.valid).toBe(false);
  });
});
