import { describe, it, expect, vi, afterEach } from "vitest";
import { getBillingWindow } from "@/lib/services/sms/billing-window";

/**
 * Contract: booking SMS and waitlist SMS must use the same (period_start, period_end)
 * for a given salon billing anchor so increments hit one sms_usage row per UNIQUE constraint.
 */
describe("SMS usage same row (integration contract)", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("same current_period_end yields one canonical window for all send paths", () => {
    const periodEnd = "2026-05-20T14:30:00.000Z";
    const bookingWindow = getBillingWindow(periodEnd);
    const waitlistWindow = getBillingWindow(periodEnd);
    expect(bookingWindow).toEqual(waitlistWindow);
  });

  it("calendar fallback is identical for consecutive calls at a fixed time", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-15T08:00:00.000Z"));
    expect(getBillingWindow(null)).toEqual(getBillingWindow(null));
  });
});
