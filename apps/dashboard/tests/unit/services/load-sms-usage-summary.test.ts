import { describe, it, expect, vi, beforeEach } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  loadSmsUsageSummaryForBilling,
  smsBillingWindowKey,
} from "@/lib/services/sms/load-sms-usage-summary";

vi.mock("@/lib/services/sms/sms-billing-observability", () => ({
  logSmsBillingWindowResolved: vi.fn(),
  logSmsBillingWindowMismatch: vi.fn(),
}));

function createChainedBuilder(final: { limit?: ReturnType<typeof vi.fn>; eq?: ReturnType<typeof vi.fn> }) {
  const builder: Record<string, unknown> = {};
  builder.select = () => builder;
  builder.eq = () => builder;
  if (final.eq) {
    builder.eq = final.eq;
  }
  builder.limit = final.limit ?? vi.fn();
  return builder;
}

describe("loadSmsUsageSummaryForBilling", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns metrics from exact sms_usage row when present", async () => {
    const limit = vi.fn().mockResolvedValue({
      data: [
        {
          included_quota: 100,
          used_count: 12,
          overage_count: 2,
          overage_cost_estimate: 1.2,
          hard_cap_reached: false,
        },
      ],
      error: null,
    });
    const mockSupabase = {
      from: vi.fn((table: string) => {
        if (table === "sms_usage") return createChainedBuilder({ limit });
        throw new Error(`unexpected table ${table}`);
      }),
    } as unknown as SupabaseClient;

    const out = await loadSmsUsageSummaryForBilling(mockSupabase, {
      salonId: "s1",
      plan: "starter",
      currentPeriodEnd: "2026-04-01T00:00:00.000Z",
    });

    expect(out.status).toBe("ok");
    expect(out.metrics).toEqual({
      included: 100,
      used: 12,
      overage: 2,
      overageCostEstimate: 1.2,
      hardCapReached: false,
    });
    expect(limit).toHaveBeenCalledWith(2);
  });

  it("duplicate rows yields duplicate_row status", async () => {
    const limit = vi.fn().mockResolvedValue({ data: [{}, {}], error: null });
    const mockSupabase = {
      from: vi.fn((table: string) => {
        if (table === "sms_usage") return createChainedBuilder({ limit });
        throw new Error(`unexpected table ${table}`);
      }),
    } as unknown as SupabaseClient;

    const out = await loadSmsUsageSummaryForBilling(mockSupabase, {
      salonId: "s1",
      plan: "starter",
      currentPeriodEnd: null,
    });

    expect(out.status).toBe("duplicate_row");
    expect(out.metrics).toBeNull();
  });

  it("no row: uses plan default when SMS feature has no numeric limit in plan_features", async () => {
    const limit = vi.fn().mockResolvedValue({ data: [], error: null });
    const pfEq = vi.fn().mockResolvedValue({
      data: [{ limit_value: null, features: { key: "SMS_NOTIFICATIONS" } }],
      error: null,
    });
    const pfBuilder = { select: () => ({ eq: pfEq }) };
    const mockSupabase = {
      from: vi.fn((table: string) => {
        if (table === "sms_usage") return createChainedBuilder({ limit });
        if (table === "plan_features") return pfBuilder;
        throw new Error(`unexpected table ${table}`);
      }),
    } as unknown as SupabaseClient;

    const out = await loadSmsUsageSummaryForBilling(mockSupabase, {
      salonId: "s1",
      plan: "starter",
      currentPeriodEnd: null,
    });

    expect(out.status).toBe("ok");
    expect(out.metrics?.included).toBe(100);
    expect(out.metrics?.used).toBe(0);
  });

  it("usage query error yields unavailable", async () => {
    const limit = vi.fn().mockResolvedValue({ data: [], error: { message: "rls" } });
    const mockSupabase = {
      from: vi.fn(() => createChainedBuilder({ limit })),
    } as unknown as SupabaseClient;

    const out = await loadSmsUsageSummaryForBilling(mockSupabase, {
      salonId: "s1",
      plan: "pro",
      currentPeriodEnd: null,
    });

    expect(out.status).toBe("unavailable");
    expect(out.metrics).toBeNull();
    expect(out.usageError).toBe("rls");
  });

  it("smsBillingWindowKey is stable for merge logic", () => {
    const w = { periodStart: "a", periodEnd: "b" };
    expect(smsBillingWindowKey(w)).toBe(smsBillingWindowKey(w));
  });
});
