import { useState, useEffect } from "react";
import { useCurrentSalon } from "@/components/salon-provider";
import { getEffectiveLimit } from "@/lib/services/plan-limits-service";

export type LimitInfo = {
  current: number;
  limit: number | null; // null = unlimited
  atLimit: boolean;
  blocked: boolean; // true when trying to exceed limit
  percentage: number; // 0-100
};

export type PlanLimitsState = {
  employees: LimitInfo | null;
  loading: boolean;
  error: string | null;
};

/**
 * Hook to get server-verified plan limits for the current salon.
 * Reusable across all entity pages.
 */
export function usePlanLimits(currentCounts: {
  employees?: number;
}): PlanLimitsState {
  const { salon } = useCurrentSalon();
  const [employeeLimit, setEmployeeLimit] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadLimits() {
      if (!salon?.id || !salon?.plan) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      const { limit, error: limitError } = await getEffectiveLimit(
        salon.id,
        salon.plan,
        "employees",
      );

      if (limitError) {
        setError(limitError);
      } else {
        setEmployeeLimit(limit);
      }

      setLoading(false);
    }

    loadLimits();
  }, [salon?.id, salon?.plan]);

  const employeesInfo: LimitInfo | null =
    employeeLimit !== null && currentCounts.employees !== undefined
      ? {
          current: currentCounts.employees,
          limit: employeeLimit,
          atLimit: currentCounts.employees >= employeeLimit,
          blocked: currentCounts.employees >= employeeLimit,
          percentage: Math.min(
            (currentCounts.employees / employeeLimit) * 100,
            100,
          ),
        }
      : employeeLimit === null && currentCounts.employees !== undefined
        ? {
            current: currentCounts.employees,
            limit: null,
            atLimit: false,
            blocked: false,
            percentage: 0,
          }
        : null;

  return {
    employees: employeesInfo,
    loading,
    error,
  };
}
