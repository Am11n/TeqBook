import { describe, it, expect, vi, beforeEach } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  loadSmsUsageSummaryForBilling,
  smsBillingWindowKey,
} from "@/lib/services/sms/load-sms-usage-summary";
import { SMS_UNLIMITED_INCLUDED_QUOTA } from "@/lib/services/sms/sms-plan-defaults";

vi.mock("@/lib/services/sms/sms-billing-observability", () => ({
  logSmsBillingWindowResolved: vi.fn(),
  logSmsBillingWindowMismatch: vi.fn(),
}));

function createChainedBuilder(final: { limit?: ReturnType<typeof vi.fn> }) {
  const builder: Record<string, unknown> = {};
  builder.select = () => builder;
  builder.eq = () => builder;
  builder.limit = final.limit ?? vi.fn();
  return builder;
}

function createPlanFeaturesMock(result: { data: unknown[] | null; error: unknown }) {
  const eqResolve = vi.fn().mockResolvedValue(result);
  return { select: () => ({ eq: eqResolve }), eqResolve };
}

describe("loadSmsUsageSummaryForBilling", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns no_sms_feature when SMS_NOTIFICATIONS is not in plan_features", async () => {
    const pf = createPlanFeaturesMock({
      data: [{ limit_value: 5, features: { key: "MULTILINGUAL" } }],
      error: null,
    });
    const mockSupabase = {
      from: vi.fn((table: string) => {
        if (table === "plan_features") return pf;
        throw new Error(`unexpected table ${table}`);
      }),
    } as unknown as SupabaseClient;

    const out = await loadSmsUsageSummaryForBilling(mockSupabase, {
      salonId: "s1",
      plan: "starter",
      currentPeriodEnd: null,
    });

    expect(out.status).toBe("no_sms_feature");
    expect(out.metrics).toBeNull();
  });

  it("returns metrics from sms_usage row when present", async () => {
    const pf = createPlanFeaturesMock({
      data: [{ limit_value: 250, features: { key: "SMS_NOTIFICATIONS" } }],
      error: null,
    });
    const limit = vi.fn().mockResolvedValue({
      data: [
        {
          included_quota: 250,
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
        if (table === "plan_features") return pf;
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
      included: 250,
      used: 12,
      overage: 2,
      overageCostEstimate: 1.2,
      hardCapReached: false,
    });
    expect(limit).toHaveBeenCalledWith(2);
  });

  it("maps stored unlimited quota to included null", async () => {
    const pf = createPlanFeaturesMock({
      data: [{ limit_value: null, features: { key: "SMS_NOTIFICATIONS" } }],
      error: null,
    });
    const limit = vi.fn().mockResolvedValue({
      data: [
        {
          included_quota: SMS_UNLIMITED_INCLUDED_QUOTA,
          used_count: 3,
          overage_count: 0,
          overage_cost_estimate: 0,
          hard_cap_reached: false,
        },
      ],
      error: null,
    });
    const mockSupabase = {
      from: vi.fn((table: string) => {
        if (table === "plan_features") return pf;
        if (table === "sms_usage") return createChainedBuilder({ limit });
        throw new Error(`unexpected table ${table}`);
      }),
    } as unknown as SupabaseClient;

    const out = await loadSmsUsageSummaryForBilling(mockSupabase, {
      salonId: "s1",
      plan: "pro",
      currentPeriodEnd: null,
    });

    expect(out.status).toBe("ok");
    expect(out.metrics?.included).toBeNull();
    expect(out.metrics?.used).toBe(3);
  });

  it("no usage row: unlimited when plan SMS limit_value is null", async () => {
    const pf = createPlanFeaturesMock({
      data: [{ limit_value: null, features: { key: "SMS_NOTIFICATIONS" } }],
      error: null,
    });
    const limit = vi.fn().mockResolvedValue({ data: [], error: null });
    const mockSupabase = {
      from: vi.fn((table: string) => {
        if (table === "plan_features") return pf;
        if (table === "sms_usage") return createChainedBuilder({ limit });
        throw new Error(`unexpected table ${table}`);
      }),
    } as unknown as SupabaseClient;

    const out = await loadSmsUsageSummaryForBilling(mockSupabase, {
      salonId: "s1",
      plan: "starter",
      currentPeriodEnd: null,
    });

    expect(out.status).toBe("ok");
    expect(out.metrics?.included).toBeNull();
    expect(out.metrics?.used).toBe(0);
  });

  it("no usage row: numeric included from plan_features", async () => {
    const pf = createPlanFeaturesMock({
      data: [{ limit_value: 250, features: { key: "SMS_NOTIFICATIONS" } }],
      error: null,
    });
    const limit = vi.fn().mockResolvedValue({ data: [], error: null });
    const mockSupabase = {
      from: vi.fn((table: string) => {
        if (table === "plan_features") return pf;
        if (table === "sms_usage") return createChainedBuilder({ limit });
        throw new Error(`unexpected table ${table}`);
      }),
    } as unknown as SupabaseClient;

    const out = await loadSmsUsageSummaryForBilling(mockSupabase, {
      salonId: "s1",
      plan: "pro",
      currentPeriodEnd: null,
    });

    expect(out.status).toBe("ok");
    expect(out.metrics?.included).toBe(250);
  });

  it("duplicate rows yields duplicate_row status", async () => {
    const pf = createPlanFeaturesMock({
      data: [{ limit_value: 100, features: { key: "SMS_NOTIFICATIONS" } }],
      error: null,
    });
    const limit = vi.fn().mockResolvedValue({ data: [{}, {}], error: null });
    const mockSupabase = {
      from: vi.fn((table: string) => {
        if (table === "plan_features") return pf;
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

  it("usage query error yields unavailable", async () => {
    const pf = createPlanFeaturesMock({
      data: [{ limit_value: 100, features: { key: "SMS_NOTIFICATIONS" } }],
      error: null,
    });
    const limit = vi.fn().mockResolvedValue({ data: [], error: { message: "rls" } });
    const mockSupabase = {
      from: vi.fn((table: string) => {
        if (table === "plan_features") return pf;
        if (table === "sms_usage") return createChainedBuilder({ limit });
        throw new Error(`unexpected table ${table}`);
      }),
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
