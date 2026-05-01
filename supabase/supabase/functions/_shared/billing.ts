export type BillingPlan = "starter" | "pro" | "business";
export type AddonType = "extra_staff" | "extra_languages";

export type BillingPriceConfig = {
  planPriceIds: Record<BillingPlan, string>;
  addonPriceIds: Record<AddonType, string>;
};

export function getBillingPriceConfig(): BillingPriceConfig {
  return {
    planPriceIds: {
      starter: Deno.env.get("STRIPE_PRICE_STARTER") || "",
      pro: Deno.env.get("STRIPE_PRICE_PRO") || "",
      business: Deno.env.get("STRIPE_PRICE_BUSINESS") || "",
    },
    addonPriceIds: {
      extra_staff: Deno.env.get("STRIPE_PRICE_ADDON_EXTRA_STAFF") || "",
      extra_languages: Deno.env.get("STRIPE_PRICE_ADDON_EXTRA_LANGUAGES") || "",
    },
  };
}

export function getBaseLimits(plan: BillingPlan): { employees: number | null; languages: number | null } {
  switch (plan) {
    case "starter":
      return { employees: 2, languages: 2 };
    case "pro":
      return { employees: 5, languages: 5 };
    case "business":
      return { employees: null, languages: null };
    default:
      return { employees: 2, languages: 2 };
  }
}

export function computeExtraQuantity(activeCount: number, included: number | null): number {
  if (included === null) return 0;
  return Math.max(activeCount - included, 0);
}

/** Pilot caps for Starter add-on billing (must match dashboard plan-limits). */
export const STARTER_MAX_EXTRA_STAFF_ADDON = 20;
export const STARTER_MAX_EXTRA_LANGUAGES_ADDON = 8;

export function capStarterAddonQuantities(plan: BillingPlan | string, qty: { extra_staff: number; extra_languages: number }): {
  extra_staff: number;
  extra_languages: number;
} {
  if (plan !== "starter") return qty;
  return {
    extra_staff: Math.min(qty.extra_staff, STARTER_MAX_EXTRA_STAFF_ADDON),
    extra_languages: Math.min(qty.extra_languages, STARTER_MAX_EXTRA_LANGUAGES_ADDON),
  };
}

export function isValidStripePriceId(priceId: string): boolean {
  return typeof priceId === "string" && priceId.startsWith("price_");
}

export function getPlanFromPriceId(priceId: string, planPriceIds: Record<BillingPlan, string>): BillingPlan | null {
  if (priceId === planPriceIds.starter) return "starter";
  if (priceId === planPriceIds.pro) return "pro";
  if (priceId === planPriceIds.business) return "business";
  return null;
}
