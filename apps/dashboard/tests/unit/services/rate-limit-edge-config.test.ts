import { describe, expect, it } from "vitest";
import { getRateLimitConfig } from "../../../../../supabase/supabase/functions/_shared/rate-limit-config";

describe("Edge rate-limit config", () => {
  it("uses fail-closed for billing-update-plan", () => {
    const policy = getRateLimitConfig("billing-update-plan");
    expect(policy.failurePolicy).toBe("fail_closed");
    expect(policy.maxAttempts).toBe(20);
    expect(policy.windowMs).toBe(60 * 60 * 1000);
    expect(policy.blockDurationMs).toBe(60 * 60 * 1000);
  });
});
