import type { SupabaseClient } from "@supabase/supabase-js";
import type { PlanType } from "@/lib/types";
import { getBillingWindow } from "./billing-window";
import { getDefaultIncludedSmsQuota } from "./sms-plan-defaults";
import { logSmsBillingWindowResolved, logSmsBillingWindowMismatch } from "./sms-billing-observability";

export type SmsUsageSummaryMetrics = {
  included: number;
  used: number;
  overage: number;
  overageCostEstimate: number;
  hardCapReached: boolean;
};

export type LoadSmsUsageSummaryResult = {
  window: { periodStart: string; periodEnd: string };
  metrics: SmsUsageSummaryMetrics | null;
  status: "ok" | "unavailable" | "duplicate_row";
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

/**
 * Load SMS usage for the billing settings card: same window as all SMS writes (getBillingWindow).
 */
export async function loadSmsUsageSummaryForBilling(
  supabase: SupabaseClient,
  input: { salonId: string; plan: PlanType; currentPeriodEnd: string | null | undefined }
): Promise<LoadSmsUsageSummaryResult> {
  const { periodStart, periodEnd } = getBillingWindow(input.currentPeriodEnd ?? null);
  logSmsBillingWindowResolved("billing_read", input.salonId, periodStart, periodEnd);

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
    return {
      window: { periodStart, periodEnd },
      metrics: {
        included: row.included_quota,
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

  const smsRow = featureRows?.find((r) => smsNotificationFeatureKey(r) === "SMS_NOTIFICATIONS");
  const limitVal = smsRow?.limit_value;
  const included =
    typeof limitVal === "number" ? Math.floor(limitVal) : getDefaultIncludedSmsQuota(input.plan);

  return {
    window: { periodStart, periodEnd },
    metrics: {
      included,
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
