import type { SupabaseClient } from "@supabase/supabase-js";
import type { PlanType } from "@/lib/types";
import { getBillingWindow } from "./billing-window";
import { isStoredUnlimitedIncludedQuota } from "./sms-plan-defaults";
import { logSmsBillingWindowResolved, logSmsBillingWindowMismatch } from "./sms-billing-observability";

export type SmsUsageSummaryMetrics = {
  /** null = unlimited included quota for this period */
  included: number | null;
  used: number;
  overage: number;
  overageCostEstimate: number;
  hardCapReached: boolean;
};

export type LoadSmsUsageSummaryResult = {
  window: { periodStart: string; periodEnd: string };
  metrics: SmsUsageSummaryMetrics | null;
  status: "ok" | "unavailable" | "duplicate_row" | "no_sms_feature";
  usageError: string | null;
  featureError: string | null;
};

function smsNotificationFeatureKey(row: {
  features: unknown;
  limit_value?: number | null;
}): string | undefined {
  const f = row.features as { key?: string } | null;
  return f?.key;
}

function includedFromPlanLimit(limitVal: number | null | undefined): number | null {
  if (limitVal === null || limitVal === undefined) {
    return null;
  }
  return Math.max(0, Math.floor(limitVal));
}

/**
 * Load SMS usage for billing: only when SMS_NOTIFICATIONS is enabled for the plan in admin plan features.
 */
export async function loadSmsUsageSummaryForBilling(
  supabase: SupabaseClient,
  input: { salonId: string; plan: PlanType; currentPeriodEnd: string | null | undefined }
): Promise<LoadSmsUsageSummaryResult> {
  const { periodStart, periodEnd } = getBillingWindow(input.currentPeriodEnd ?? null);
  logSmsBillingWindowResolved("billing_read", input.salonId, periodStart, periodEnd);

  const { data: featureRows, error: featureError } = await supabase
    .from("plan_features")
    .select("limit_value, features:feature_id(key)")
    .eq("plan_type", input.plan);

  if (featureError) {
    return {
      window: { periodStart, periodEnd },
      metrics: null,
      status: "unavailable",
      usageError: null,
      featureError: featureError.message,
    };
  }

  const smsPlanRow = featureRows?.find((r) => smsNotificationFeatureKey(r) === "SMS_NOTIFICATIONS");
  if (!smsPlanRow) {
    return {
      window: { periodStart, periodEnd },
      metrics: null,
      status: "no_sms_feature",
      usageError: null,
      featureError: null,
    };
  }

  const planIncluded = includedFromPlanLimit(smsPlanRow.limit_value);

  const { data: rows, error: usageError } = await supabase
    .from("sms_usage")
    .select("included_quota, used_count, overage_count, overage_cost_estimate, hard_cap_reached")
    .eq("salon_id", input.salonId)
    .eq("period_start", periodStart)
    .eq("period_end", periodEnd)
    .limit(2);

  if (usageError) {
    return {
      window: { periodStart, periodEnd },
      metrics: null,
      status: "unavailable",
      usageError: usageError.message,
      featureError: null,
    };
  }

  const rowList = rows ?? [];
  if (rowList.length > 1) {
    logSmsBillingWindowMismatch(
      "Multiple sms_usage rows for same salon and billing window",
      input.salonId,
      periodStart,
      periodEnd,
      { row_count: rowList.length }
    );
    return {
      window: { periodStart, periodEnd },
      metrics: null,
      status: "duplicate_row",
      usageError: null,
      featureError: null,
    };
  }

  const row = rowList[0] ?? null;

  if (row) {
    const includedDisplay = isStoredUnlimitedIncludedQuota(row.included_quota)
      ? null
      : row.included_quota;
    return {
      window: { periodStart, periodEnd },
      metrics: {
        included: includedDisplay,
        used: row.used_count,
        overage: row.overage_count,
        overageCostEstimate: Number(row.overage_cost_estimate ?? 0),
        hardCapReached: row.hard_cap_reached,
      },
      status: "ok",
      usageError: null,
      featureError: null,
    };
  }

  return {
    window: { periodStart, periodEnd },
    metrics: {
      included: planIncluded,
      used: 0,
      overage: 0,
      overageCostEstimate: 0,
      hardCapReached: false,
    },
    status: "ok",
    usageError: null,
    featureError: null,
  };
}

export function smsBillingWindowKey(window: { periodStart: string; periodEnd: string }): string {
  return `${window.periodStart}\0${window.periodEnd}`;
}
