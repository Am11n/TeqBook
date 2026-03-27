/**
 * Single source of truth for SMS usage billing period boundaries.
 * All sms_usage reads/writes must use these timestamps (no inline period math elsewhere).
 */

export type SmsBillingWindow = {
  /** ISO string aligned with DB `sms_usage.period_start` */
  periodStart: string;
  /** ISO string aligned with DB `sms_usage.period_end` */
  periodEnd: string;
};

/**
 * @param periodEndIso Salon `current_period_end` from Stripe projection, or null for calendar-month fallback.
 */
export function getBillingWindow(periodEndIso?: string | null): SmsBillingWindow {
  if (periodEndIso) {
    const end = new Date(periodEndIso);
    const start = new Date(
      Date.UTC(
        end.getUTCFullYear(),
        end.getUTCMonth() - 1,
        end.getUTCDate(),
        end.getUTCHours(),
        end.getUTCMinutes(),
        end.getUTCSeconds(),
        end.getUTCMilliseconds(),
      ),
    );
    return { periodStart: start.toISOString(), periodEnd: end.toISOString() };
  }

  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0));
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1, 0, 0, 0));
  return { periodStart: start.toISOString(), periodEnd: end.toISOString() };
}
