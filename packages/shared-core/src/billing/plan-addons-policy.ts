/** Plan types that participate in add-on billing. */
export type BillingPlanType = "starter" | "pro" | "business";

/** Dimension keyed by usage counters (active staff, supported language count). */
export type AddonDimension = "employees" | "languages";

export const STARTER_MAX_EXTRA_STAFF_ADDON = 20;
export const STARTER_MAX_EXTRA_LANGUAGES_ADDON = 8;

const INCLUDED: Record<BillingPlanType, { employees: number | null; languages: number | null }> = {
  starter: { employees: 2, languages: 2 },
  pro: { employees: 5, languages: 5 },
  business: { employees: null, languages: null },
};

export function getIncludedInPlan(
  plan: BillingPlanType | string | null | undefined,
  dimension: AddonDimension,
): number | null {
  const p = (plan === "starter" || plan === "pro" || plan === "business" ? plan : "starter") as BillingPlanType;
  return INCLUDED[p][dimension];
}

/** Raw add-on units from `addons` row (or 0). Capped for Starter only (billing pilot). */
export function capAddonUnitsForPlan(
  plan: BillingPlanType | string | null | undefined,
  dimension: AddonDimension,
  rawAddonQty: number,
): number {
  const p = (plan === "starter" || plan === "pro" || plan === "business" ? plan : "starter") as BillingPlanType;
  if (p !== "starter") return Math.max(0, rawAddonQty);
  const cap =
    dimension === "employees" ? STARTER_MAX_EXTRA_STAFF_ADDON : STARTER_MAX_EXTRA_LANGUAGES_ADDON;
  return Math.min(Math.max(0, rawAddonQty), cap);
}

/** allowed_usage = included + capped addon qty; null means unlimited. */
export function allowedUsage(
  plan: BillingPlanType | string | null | undefined,
  dimension: AddonDimension,
  addonQtyRaw: number,
): number | null {
  const included = getIncludedInPlan(plan, dimension);
  if (included === null) return null;
  const maxAddon = capAddonUnitsForPlan(plan, dimension, addonQtyRaw);
  return included + maxAddon;
}

export function expectedExtraPaidUnits(usage: number, includedInPlan: number | null): number {
  if (includedInPlan === null) return 0;
  return Math.max(0, usage - includedInPlan);
}
