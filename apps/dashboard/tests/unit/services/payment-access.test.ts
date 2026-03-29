import { describe, it, expect, vi, beforeEach } from "vitest";
import { checkSalonPaymentAccess } from "@/lib/services/billing/payment-access";
import { supabase } from "@/lib/supabase-client";

vi.mock("@/lib/supabase-client");
vi.mock("@/lib/services/logger");

describe("checkSalonPaymentAccess", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns hasAccess true when RPC grants access", async () => {
    vi.mocked(supabase.rpc).mockResolvedValueOnce({ data: true, error: null } as never);

    const result = await checkSalonPaymentAccess("salon-1");

    expect(supabase.rpc).toHaveBeenCalledWith("salon_product_access_granted", { p_salon_id: "salon-1" });
    expect(result.error).toBeNull();
    expect(result.data).toEqual({ hasAccess: true, reason: null, gracePeriodEndsAt: null });
  });

  it("returns hasAccess false and grace end when RPC denies and payment_failed_at is set", async () => {
    const failedAt = "2026-01-01T12:00:00.000Z";
    vi.mocked(supabase.rpc).mockResolvedValueOnce({ data: false, error: null } as never);
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { payment_failed_at: failedAt },
            error: null,
          }),
        }),
      }),
    } as never);

    const result = await checkSalonPaymentAccess("salon-2");

    expect(result.error).toBeNull();
    expect(result.data?.hasAccess).toBe(false);
    expect(result.data?.reason).toBe("no_product_access");
    expect(result.data?.gracePeriodEndsAt).toBeTruthy();
  });

  it("propagates RPC error", async () => {
    vi.mocked(supabase.rpc).mockResolvedValueOnce({
      data: null,
      error: { message: "rpc failed" },
    } as never);

    const result = await checkSalonPaymentAccess("salon-3");

    expect(result.data).toBeNull();
    expect(result.error).toBe("rpc failed");
  });
});
