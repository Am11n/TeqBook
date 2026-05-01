import type { AddonDimension } from "./plan-addons-policy";
import { allowedUsage, getIncludedInPlan, capAddonUnitsForPlan } from "./plan-addons-policy";

export type AddonUsageStatus = "within_limit" | "at_limit" | "requires_upgrade";

export type InvariantEvalResult = {
  /** Finite cap, or null when unlimited. */
  allowed: number | null;
  includedInPlan: number | null;
  maxAddonUnits: number;
  addonUsageStatus: AddonUsageStatus;
  /** True when usage would exceed allowed (finite caps only). */
  violates: boolean;
};

/**
 * Core invariant: usageAfter <= allowed_usage (or allowed is null / unlimited).
 * No grandfathering parameters — policy is fully determined by plan + purchased add-on units.
 */
export function invariantEval(input: {
  usageAfter: number;
  plan: string | null | undefined;
  dimension: AddonDimension;
  addonQtyRaw: number;
}): InvariantEvalResult {
  const includedInPlan = getIncludedInPlan(input.plan, input.dimension);
  const maxAddonUnits = capAddonUnitsForPlan(input.plan, input.dimension, input.addonQtyRaw);
  const allowed = allowedUsage(input.plan, input.dimension, input.addonQtyRaw);

  if (allowed === null) {
    return {
      allowed: null,
      includedInPlan,
      maxAddonUnits,
      addonUsageStatus: "within_limit",
      violates: false,
    };
  }

  const u = input.usageAfter;
  const violates = u > allowed;
  let addonUsageStatus: AddonUsageStatus;
  if (violates) {
    addonUsageStatus = "requires_upgrade";
  } else if (u === allowed) {
    addonUsageStatus = "at_limit";
  } else {
    addonUsageStatus = "within_limit";
  }

  return {
    allowed,
    includedInPlan,
    maxAddonUnits,
    addonUsageStatus,
    violates,
  };
}
