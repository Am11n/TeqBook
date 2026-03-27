import { useState, useEffect } from "react";
import { useCurrentSalon } from "@/components/salon-provider";
import { getAddonsForSalon } from "@/lib/repositories/addons";
import { getEmployeesForSalon } from "@/lib/services/employees-service";
import { getEffectiveLimit } from "@/lib/services/plan-limits-service";
import { listBillingInvoices } from "@/lib/services/billing-service";
import type { PlanType } from "@/lib/types";
import type { Addon } from "@/lib/repositories/addons";
import type { BillingInvoiceResponse } from "@/lib/services/billing/shared";
import type { Employee } from "@/lib/types";

export type BillingSummaryViewModel = {
  usage: {
    employeesIncluded: number | null;
    employeesActive: number;
    employeesExtraBilled: number;
    languagesIncluded: number | null;
    languagesActive: number;
    languagesExtraBilled: number;
  };
  history: BillingInvoiceResponse[];
};

export function useBilling() {
  const { salon, isReady } = useCurrentSalon();
  const [currentPlan, setCurrentPlan] = useState<PlanType | null>(null);
  const [addons, setAddons] = useState<Addon[]>([]);
  const [summary, setSummary] = useState<BillingSummaryViewModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshToken, setRefreshToken] = useState(0);

  const refetch = () => setRefreshToken((prev) => prev + 1);

  useEffect(() => {
    async function loadData() {
      if (!isReady || !salon?.id) return;
      setLoading(true);

      const plan = (salon.plan || "starter") as PlanType;
      setCurrentPlan(plan);

      const [addonsResult, employeesResult, employeeLimitResult, languageLimitResult, invoicesResult] =
        await Promise.all([
          getAddonsForSalon(salon.id),
          getEmployeesForSalon(salon.id, { page: 1, pageSize: 1000 }),
          getEffectiveLimit(salon.id, plan, "employees"),
          getEffectiveLimit(salon.id, plan, "languages"),
          listBillingInvoices(salon.id),
        ]);

      if (!addonsResult.error && addonsResult.data) {
        setAddons(addonsResult.data);
      }

      const employeesActive =
        employeesResult.data?.filter((employee: Employee) => employee.is_active).length ?? 0;
      const languagesActive = Array.isArray(salon.supported_languages)
        ? salon.supported_languages.length
        : 0;

      const employeesIncluded = employeeLimitResult.limit ?? null;
      const languagesIncluded = languageLimitResult.limit ?? null;
      const employeesExtraBilled =
        employeesIncluded === null ? 0 : Math.max(employeesActive - employeesIncluded, 0);
      const languagesExtraBilled =
        languagesIncluded === null ? 0 : Math.max(languagesActive - languagesIncluded, 0);

      setSummary({
        usage: {
          employeesIncluded,
          employeesActive,
          employeesExtraBilled,
          languagesIncluded,
          languagesActive,
          languagesExtraBilled,
        },
        history: invoicesResult.data?.invoices ?? [],
      });

      setLoading(false);
    }
    void loadData();
  }, [isReady, salon, refreshToken]);

  return {
    currentPlan,
    addons,
    summary,
    loading,
    refetch,
  };
}

