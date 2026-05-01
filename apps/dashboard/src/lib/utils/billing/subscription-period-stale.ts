import type { Salon } from "@/lib/types";

/**
 * True when the salon has a Stripe subscription id but `current_period_end` is strictly before `now`.
 * In that case the projection is usually stale (renewal should have moved the period forward).
 */
export function isSubscriptionBillingPeriodEndStale(
  salon: Pick<Salon, "billing_subscription_id" | "current_period_end"> | null | undefined,
  nowMs: number = Date.now(),
): boolean {
  if (!salon?.billing_subscription_id || !salon.current_period_end) return false;
  const t = new Date(salon.current_period_end).getTime();
  if (!Number.isFinite(t)) return false;
  return t < nowMs;
}
