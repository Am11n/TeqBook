import { describe, expect, it } from "vitest";
import { getRateLimitPolicy } from "@teqbook/shared/services/rate-limit";

describe("Rate limit policy matrix", () => {
  it("uses fail-closed policy for sensitive endpoints", () => {
    expect(getRateLimitPolicy("login").failurePolicy).toBe("fail_closed");
    expect(getRateLimitPolicy("booking-notifications").failurePolicy).toBe("fail_closed");
    expect(getRateLimitPolicy("booking-cancellation").failurePolicy).toBe("fail_closed");
    expect(getRateLimitPolicy("billing-update-plan").failurePolicy).toBe("fail_closed");
    expect(getRateLimitPolicy("admin-impersonate").failurePolicy).toBe("fail_closed");
  });

  it("uses fail-open policy only for low-risk public data", () => {
    const publicData = getRateLimitPolicy("public-booking-data");
    expect(publicData.failurePolicy).toBe("fail_open");
    expect(publicData.identifierType).toBe("ip");
  });

  it("returns default policy for unknown endpoint types", () => {
    const policy = getRateLimitPolicy("some-unknown-endpoint");
    expect(policy.endpointType).toBe("default");
    expect(policy.failurePolicy).toBe("fail_closed");
    expect(policy.maxAttempts).toBeGreaterThan(0);
  });
});
