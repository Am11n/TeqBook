import type { PlanType } from "@/lib/types";

/** Shared with billing UI and `resolveSmsPolicyForSalon` — single source, no drift. */
export const DEFAULT_INCLUDED_QUOTA_BY_PLAN: Record<PlanType, number> = {
  starter: 100,
  pro: 500,
  business: 2000,
};

export function getDefaultIncludedSmsQuota(plan: PlanType): number {
  return DEFAULT_INCLUDED_QUOTA_BY_PLAN[plan];
}
