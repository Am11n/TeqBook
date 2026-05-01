import { describe, it, expect } from "vitest";
import { isSubscriptionBillingPeriodEndStale } from "@/lib/utils/billing/subscription-period-stale";

describe("isSubscriptionBillingPeriodEndStale", () => {
  it("returns false without subscription id", () => {
    expect(
      isSubscriptionBillingPeriodEndStale(
        { billing_subscription_id: null, current_period_end: "2020-01-01T00:00:00.000Z" },
        Date.now(),
      ),
    ).toBe(false);
  });

  it("returns false without period end", () => {
    expect(
      isSubscriptionBillingPeriodEndStale(
        { billing_subscription_id: "sub_x", current_period_end: null },
        Date.now(),
      ),
    ).toBe(false);
  });

  it("returns true when period end is before now", () => {
    const now = new Date("2026-05-01T12:00:00.000Z").getTime();
    expect(
      isSubscriptionBillingPeriodEndStale(
        { billing_subscription_id: "sub_x", current_period_end: "2026-04-27T23:59:59.000Z" },
        now,
      ),
    ).toBe(true);
  });

  it("returns false when period end is after now", () => {
    const now = new Date("2026-04-26T12:00:00.000Z").getTime();
    expect(
      isSubscriptionBillingPeriodEndStale(
        { billing_subscription_id: "sub_x", current_period_end: "2026-04-27T23:59:59.000Z" },
        now,
      ),
    ).toBe(false);
  });
});
