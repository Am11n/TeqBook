// =====================================================
// Plan Limits Service
// =====================================================
// Business logic for checking plan limits and addons.
// Policy + invariant: @teqbook/shared-core (must match Postgres RPC / edge billing).

import type { PlanType } from "@/lib/types";
import {
  capAddonUnitsForPlan,
  expectedExtraPaidUnits,
  getIncludedInPlan,
  invariantEval,
} from "@teqbook/shared-core";
import * as addonsRepo from "@/lib/repositories/addons";
import * as employeesRepo from "@/lib/repositories/employees";
import { getSalonById } from "@/lib/repositories/salons";
import { cacheGetOrSet, cacheInvalidateByPrefix, CacheKeys, CacheTTL } from "@/lib/services/cache-service";

export type PlanLimits = {
  employees: number | null;
  languages: number | null;
};

export function getPlanLimits(plan: PlanType | null | undefined): PlanLimits {
  return {
    employees: getIncludedInPlan(plan, "employees"),
    languages: getIncludedInPlan(plan, "languages"),
  };
}

export async function getEffectiveLimit(
  salonId: string,
  plan: PlanType | null | undefined,
  limitType: "employees" | "languages",
): Promise<{ limit: number | null; error: string | null }> {
  try {
    const { data: salonRow, error: salonErr } = await getSalonById(salonId);
    if (salonErr) {
      return { limit: null, error: salonErr };
    }
    const pendingStaff = Number(salonRow?.pending_extra_staff) || 0;
    const pendingLang = Number(salonRow?.pending_extra_languages) || 0;
    const cacheKey = `${CacheKeys.planLimits(salonId)}:${limitType}:ps:${pendingStaff}:pl:${pendingLang}`;

    const cachedResult = await cacheGetOrSet(
      cacheKey,
      async () => {
        const included = getIncludedInPlan(plan, limitType);
        if (included === null) {
          return { limit: null as number | null, error: null as string | null };
        }

        const addonType = limitType === "employees" ? "extra_staff" : "extra_languages";
        const { data: addon, error: addonError } = await addonsRepo.getAddonByType(salonId, addonType);

        if (addonError) {
          return { limit: null as number | null, error: addonError };
        }

        const pending = limitType === "employees" ? pendingStaff : pendingLang;
        const addonQtyRaw = (addon?.qty ?? 0) + pending;
        const maxAddon = capAddonUnitsForPlan(plan, limitType, addonQtyRaw);
        return { limit: included + maxAddon, error: null as string | null };
      },
      CacheTTL.MEDIUM,
    );

    return cachedResult;
  } catch (err) {
    return {
      limit: null,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

export function invalidatePlanLimitsCache(salonId: string): void {
  cacheInvalidateByPrefix(`${CacheKeys.planLimits(salonId)}:`);
}

export async function canAddEmployee(
  salonId: string,
  plan: PlanType | null | undefined,
): Promise<{ canAdd: boolean; currentCount: number; limit: number | null; error: string | null }> {
  try {
    const { data: employeesData, error: employeesError } = await employeesRepo.getEmployeesForCurrentSalon(
      salonId,
    );

    if (employeesError) {
      return { canAdd: false, currentCount: 0, limit: null, error: employeesError };
    }

    const currentCount = (employeesData ?? []).filter((e) => e.is_active).length;

    const { data: salonRow, error: salonErr } = await getSalonById(salonId);
    if (salonErr) {
      return { canAdd: false, currentCount, limit: null, error: salonErr };
    }
    const pendingStaff = Number(salonRow?.pending_extra_staff) || 0;

    const addonType = "extra_staff" as const;
    const { data: addon, error: addonError } = await addonsRepo.getAddonByType(salonId, addonType);
    if (addonError) {
      return { canAdd: false, currentCount, limit: null, error: addonError };
    }

    const inv = invariantEval({
      usageAfter: currentCount + 1,
      plan,
      dimension: "employees",
      addonQtyRaw: (addon?.qty ?? 0) + pendingStaff,
    });

    return {
      canAdd: !inv.violates,
      currentCount,
      limit: inv.allowed,
      error: inv.violates ? "TB|ADDON_USAGE_REQUIRES_UPGRADE" : null,
    };
  } catch (err) {
    return {
      canAdd: false,
      currentCount: 0,
      limit: null,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

export async function canAddLanguage(
  salonId: string,
  plan: PlanType | null | undefined,
  currentLanguages: string[],
): Promise<{ canAdd: boolean; currentCount: number; limit: number | null; error: string | null }> {
  try {
    const currentCount = currentLanguages.length;

    const { data: salonRow, error: salonErr } = await getSalonById(salonId);
    if (salonErr) {
      return { canAdd: false, currentCount, limit: null, error: salonErr };
    }
    const pendingLang = Number(salonRow?.pending_extra_languages) || 0;

    const { data: addon, error: addonError } = await addonsRepo.getAddonByType(salonId, "extra_languages");
    if (addonError) {
      return { canAdd: false, currentCount, limit: null, error: addonError };
    }

    const inv = invariantEval({
      usageAfter: currentCount,
      plan,
      dimension: "languages",
      addonQtyRaw: (addon?.qty ?? 0) + pendingLang,
    });

    return {
      canAdd: !inv.violates,
      currentCount,
      limit: inv.allowed,
      error: inv.violates ? "TB|ADDON_USAGE_REQUIRES_UPGRADE" : null,
    };
  } catch (err) {
    return {
      canAdd: false,
      currentCount: 0,
      limit: null,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

export { expectedExtraPaidUnits };
