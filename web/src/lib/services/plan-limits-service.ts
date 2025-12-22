// =====================================================
// Plan Limits Service
// =====================================================
// Business logic for checking plan limits and addons

import type { PlanType } from "@/lib/types";
import * as addonsRepo from "@/lib/repositories/addons";
import * as employeesRepo from "@/lib/repositories/employees";

export type PlanLimits = {
  employees: number | null; // null = unlimited
  languages: number | null; // null = unlimited
};

/**
 * Get plan limits based on plan type
 */
export function getPlanLimits(plan: PlanType | null | undefined): PlanLimits {
  switch (plan) {
    case "starter":
      return {
        employees: 2,
        languages: 2,
      };
    case "pro":
      return {
        employees: 5,
        languages: 5,
      };
    case "business":
      return {
        employees: null, // unlimited
        languages: null, // unlimited
      };
    default:
      // Default to starter limits
      return {
        employees: 2,
        languages: 2,
      };
  }
}

/**
 * Get effective limit (plan limit + addons)
 */
export async function getEffectiveLimit(
  salonId: string,
  plan: PlanType | null | undefined,
  limitType: "employees" | "languages"
): Promise<{ limit: number | null; error: string | null }> {
  try {
    const planLimits = getPlanLimits(plan);
    const baseLimit = planLimits[limitType];

    // If unlimited, return null
    if (baseLimit === null) {
      return { limit: null, error: null };
    }

    // Get addon for this limit type
    const addonType = limitType === "employees" ? "extra_staff" : "extra_languages";
    const { data: addon, error: addonError } = await addonsRepo.getAddonByType(
      salonId,
      addonType
    );

    if (addonError) {
      return { limit: null, error: addonError };
    }

    // Calculate effective limit
    const addonQty = addon?.qty || 0;
    const effectiveLimit = baseLimit + addonQty;

    return { limit: effectiveLimit, error: null };
  } catch (err) {
    return {
      limit: null,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * Check if salon can add more employees
 */
export async function canAddEmployee(
  salonId: string,
  plan: PlanType | null | undefined
): Promise<{ canAdd: boolean; currentCount: number; limit: number | null; error: string | null }> {
  try {
    // Get current employee count
    const { data: employeesData, error: employeesError } = await employeesRepo.getEmployeesForCurrentSalon(
      salonId
    );

    if (employeesError) {
      return { canAdd: false, currentCount: 0, limit: null, error: employeesError };
    }

    const currentCount = employeesData?.length || 0;

    // Get effective limit
    const { limit, error: limitError } = await getEffectiveLimit(salonId, plan, "employees");

    if (limitError) {
      return { canAdd: false, currentCount, limit: null, error: limitError };
    }

    // If unlimited, always can add
    if (limit === null) {
      return { canAdd: true, currentCount, limit: null, error: null };
    }

    // Check if under limit
    const canAdd = currentCount < limit;

    return { canAdd, currentCount, limit, error: null };
  } catch (err) {
    return {
      canAdd: false,
      currentCount: 0,
      limit: null,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * Check if salon can add more languages
 */
export async function canAddLanguage(
  salonId: string,
  plan: PlanType | null | undefined,
  currentLanguages: string[]
): Promise<{ canAdd: boolean; currentCount: number; limit: number | null; error: string | null }> {
  try {
    const currentCount = currentLanguages.length;

    // Get effective limit
    const { limit, error: limitError } = await getEffectiveLimit(salonId, plan, "languages");

    if (limitError) {
      return { canAdd: false, currentCount, limit: null, error: limitError };
    }

    // If unlimited, always can add
    if (limit === null) {
      return { canAdd: true, currentCount, limit: null, error: null };
    }

    // Check if under limit
    const canAdd = currentCount < limit;

    return { canAdd, currentCount, limit, error: null };
  } catch (err) {
    return {
      canAdd: false,
      currentCount: 0,
      limit: null,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

