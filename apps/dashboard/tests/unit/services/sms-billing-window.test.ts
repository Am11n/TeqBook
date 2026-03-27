import { describe, it, expect, vi, afterEach } from "vitest";
import { getBillingWindow } from "@/lib/services/sms/billing-window";

describe("getBillingWindow", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("derives period from Stripe-style period end (one UTC month back)", () => {
    const w = getBillingWindow("2026-04-15T10:00:00.000Z");
    expect(w.periodEnd).toBe("2026-04-15T10:00:00.000Z");
    expect(w.periodStart).toBe("2026-03-15T10:00:00.000Z");
  });

  it("returns identical keys for the same anchor (booking vs waitlist contract)", () => {
    const end = "2026-12-01T00:00:00.000Z";
    expect(getBillingWindow(end)).toEqual(getBillingWindow(end));
  });

  it("uses UTC calendar month when period end is null", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-10T12:00:00.000Z"));
    const w = getBillingWindow(null);
    expect(w.periodStart).toBe("2026-06-01T00:00:00.000Z");
    expect(w.periodEnd).toBe("2026-07-01T00:00:00.000Z");
  });
});
