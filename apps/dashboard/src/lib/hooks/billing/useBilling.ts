import { useState, useEffect, useRef } from "react";
import { useCurrentSalon } from "@/components/salon-provider";
import { getAddonsForSalon } from "@/lib/repositories/addons";
import { getSalonById } from "@/lib/repositories/salons";
import { getEmployeesForSalon } from "@/lib/services/employees-service";
import {
  expectedExtraPaidUnits,
  getEffectiveLimit,
  getPlanLimits,
  invalidatePlanLimitsCache,
} from "@/lib/services/plan-limits-service";
import {
  listBillingInvoices,
  previewBillingUpcomingInvoice,
  refreshSubscriptionProjection,
  syncSalonAddonUsageImmediate,
} from "@/lib/services/billing-service";
import { isSubscriptionBillingPeriodEndStale } from "@/lib/utils/billing/subscription-period-stale";
import type { PlanType } from "@/lib/types";
import type { Addon } from "@/lib/repositories/addons";
import type { BillingInvoiceResponse, PreviewBillingUpcomingInvoiceResponse } from "@/lib/services/billing/shared";
import type { Employee } from "@/lib/types";

const MAX_STALE_STRIPE_REFRESH = 8;

export type BillingSummaryViewModel = {
  usage: {
    /** Seats/languages included in the plan package (not add-on extended cap). */
    planIncludesEmployees: number | null;
    planIncludesLanguages: number | null;
    /** Hard cap = plan includes + purchased add-on units (same as invariant `allowed`). */
    employeesAllowed: number | null;
    languagesAllowed: number | null;
    employeesActive: number;
    languagesActive: number;
    /** Billable extras vs package: max(0, usage - planIncludes). */
    employeesExtraBilled: number;
    languagesExtraBilled: number;
  };
  history: BillingInvoiceResponse[];
};

export function useBilling() {
  const { salon, isReady, refreshSalon } = useCurrentSalon();
  const [currentPlan, setCurrentPlan] = useState<PlanType | null>(null);
  const [addons, setAddons] = useState<Addon[]>([]);
  const [summary, setSummary] = useState<BillingSummaryViewModel | null>(null);
  const [invoicePreview, setInvoicePreview] = useState<PreviewBillingUpcomingInvoiceResponse | null>(null);
  const [addonStripeUsageTrusted, setAddonStripeUsageTrusted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshToken, setRefreshToken] = useState(0);
  const [billingPeriodStaleSyncFailed, setBillingPeriodStaleSyncFailed] = useState(false);
  /** Avoid duplicate Stripe refresh when refreshSalon() updates context and re-runs this effect. */
  const stripeRefreshCompletedKey = useRef<string | null>(null);
  const staleStripeAttemptsRef = useRef(0);
  const prevSalonIdRef = useRef<string | undefined>(undefined);
  const prevRefreshTokenRef = useRef(0);

  const refetch = () => setRefreshToken((prev) => prev + 1);

  useEffect(() => {
    if (prevSalonIdRef.current !== salon?.id) {
      prevSalonIdRef.current = salon?.id;
      staleStripeAttemptsRef.current = 0;
    }
    if (prevRefreshTokenRef.current !== refreshToken) {
      prevRefreshTokenRef.current = refreshToken;
      staleStripeAttemptsRef.current = 0;
    }
  }, [salon?.id, refreshToken]);

  useEffect(() => {
    async function loadData() {
      if (!isReady || !salon?.id) return;
      setLoading(true);

      const periodStaleAtStart = isSubscriptionBillingPeriodEndStale(salon);
      if (!periodStaleAtStart) {
        setBillingPeriodStaleSyncFailed(false);
      }

      const plan = (salon.plan || "starter") as PlanType;
      setCurrentPlan(plan);

      const stripeRefreshKey = `${salon.id}:${refreshToken}`;

      const allowInitialStripeRefresh =
        Boolean(salon.billing_subscription_id) &&
        !periodStaleAtStart &&
        stripeRefreshCompletedKey.current !== stripeRefreshKey;

      const allowStaleStripeRefresh =
        Boolean(salon.billing_subscription_id) &&
        periodStaleAtStart &&
        staleStripeAttemptsRef.current < MAX_STALE_STRIPE_REFRESH;

      const shouldStripeRefresh = allowInitialStripeRefresh || allowStaleStripeRefresh;

      if (shouldStripeRefresh && salon.billing_subscription_id) {
        if (allowStaleStripeRefresh) {
          staleStripeAttemptsRef.current += 1;
        }
        const { data: refreshData, error: refreshError } = await refreshSubscriptionProjection(salon.id);
        if (!refreshError && refreshData?.refreshed) {
          await refreshSalon({ background: true });
          if (allowInitialStripeRefresh) {
            stripeRefreshCompletedKey.current = stripeRefreshKey;
          }
        }
      }

      if (salon.billing_subscription_id) {
        if (shouldStripeRefresh || refreshToken > 0) {
          await syncSalonAddonUsageImmediate(salon.id);
          invalidatePlanLimitsCache(salon.id);
        }
        const { data: freshSalon } = await getSalonById(salon.id);
        const trusted =
          freshSalon?.addon_billing_sync_state === "synced" &&
          freshSalon.product_access_state !== "inconsistent_billing";
        setAddonStripeUsageTrusted(Boolean(trusted));
        if (trusted) {
          const { data: inv, error: invErr } = await previewBillingUpcomingInvoice(salon.id);
          if (!invErr && inv) {
            setInvoicePreview(inv);
          } else {
            setInvoicePreview({
              mode: "degraded",
              reason: "preview_unavailable",
              details: invErr ?? undefined,
            });
          }
        } else if (freshSalon?.addon_billing_sync_state === "syncing") {
          setInvoicePreview({ mode: "degraded", reason: "addon_syncing" });
        } else if (freshSalon?.product_access_state === "inconsistent_billing") {
          setInvoicePreview({ mode: "degraded", reason: "inconsistent_billing" });
        } else if (freshSalon?.addon_billing_sync_state) {
          setInvoicePreview({
            mode: "degraded",
            reason: `addon_state:${freshSalon.addon_billing_sync_state}`,
          });
        } else {
          setInvoicePreview({ mode: "degraded", reason: "addon_not_synced" });
        }
      } else {
        setAddonStripeUsageTrusted(false);
        setInvoicePreview({ mode: "no_subscription" });
      }

      const didAddonSync =
        Boolean(salon.billing_subscription_id) && (shouldStripeRefresh || refreshToken > 0);
      if (didAddonSync) {
        await refreshSalon({ background: true });
      }

      const [addonsResult, employeesResult, employeeLimitResult, languageLimitResult, invoicesResult] =
        await Promise.all([
          getAddonsForSalon(salon.id),
          getEmployeesForSalon(salon.id, { page: 0, pageSize: 1000 }),
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

      const planLimits = getPlanLimits(plan);
      const employeesAllowed = employeeLimitResult.limit ?? null;
      const languagesAllowed = languageLimitResult.limit ?? null;
      const employeesExtraBilled = expectedExtraPaidUnits(employeesActive, planLimits.employees);
      const languagesExtraBilled = expectedExtraPaidUnits(languagesActive, planLimits.languages);

      setSummary({
        usage: {
          planIncludesEmployees: planLimits.employees,
          planIncludesLanguages: planLimits.languages,
          employeesAllowed,
          languagesAllowed,
          employeesActive,
          employeesExtraBilled,
          languagesActive,
          languagesExtraBilled,
        },
        history: invoicesResult.data?.invoices ?? [],
      });

      if (
        periodStaleAtStart &&
        staleStripeAttemptsRef.current >= MAX_STALE_STRIPE_REFRESH
      ) {
        setBillingPeriodStaleSyncFailed(true);
      }

      setLoading(false);
    }
    void loadData();
  }, [isReady, salon, refreshSalon, refreshToken]);

  return {
    currentPlan,
    addons,
    summary,
    invoicePreview,
    addonStripeUsageTrusted,
    loading,
    refetch,
    billingPeriodStaleSyncFailed,
  };
}

