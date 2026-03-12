import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "@/app/api/bookings/send-cancellation/route";

const mockCheckRateLimit = vi.fn();
const mockIncrementRateLimit = vi.fn();
const mockGetSalonById = vi.fn();
const mockSendBookingCancellation = vi.fn();
const mockRpc = vi.fn();
const mockAdminMaybeSingle = vi.fn();
const mockEventMaybeSingle = vi.fn();
const mockEventUpsert = vi.fn();
const mockEventUpdateEq = vi.fn();
const mockEventUpdate = vi.fn(() => ({
  eq: vi.fn(() => ({
    eq: (...args: unknown[]) => mockEventUpdateEq(...args),
  })),
}));
const mockAdminFrom = vi.fn((table: string) => {
  if (table === "bookings") {
    return {
      select: () => ({
        eq: () => ({
          eq: () => ({
            maybeSingle: (...args: unknown[]) => mockAdminMaybeSingle(...args),
          }),
        }),
      }),
    };
  }

  return {
    select: () => ({
      eq: () => ({
        eq: () => ({
          maybeSingle: (...args: unknown[]) => mockEventMaybeSingle(...args),
        }),
      }),
    }),
    upsert: (...args: unknown[]) => mockEventUpsert(...args),
    update: () => mockEventUpdate(),
  };
});

vi.mock("@/lib/services/rate-limit-service", () => ({
  checkRateLimit: (...args: unknown[]) => mockCheckRateLimit(...args),
  incrementRateLimit: (...args: unknown[]) => mockIncrementRateLimit(...args),
}));

vi.mock("@/lib/repositories/salons", () => ({
  getSalonById: (...args: unknown[]) => mockGetSalonById(...args),
}));

vi.mock("@/lib/services/email-service", () => ({
  sendBookingCancellation: (...args: unknown[]) => mockSendBookingCancellation(...args),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClientForRouteHandler: () => ({
    rpc: (...args: unknown[]) => mockRpc(...args),
  }),
}));

vi.mock("@/lib/supabase/admin", () => ({
  getAdminClient: () => ({
    from: (...args: unknown[]) => mockAdminFrom(...args),
  }),
}));

vi.mock("@/lib/services/logger", () => ({
  logInfo: vi.fn(),
  logWarn: vi.fn(),
  logError: vi.fn(),
}));

describe("Public bookings/send-cancellation rate limiting", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 429 with headers when blocked", async () => {
    mockCheckRateLimit.mockResolvedValue({
      allowed: false,
      remainingAttempts: 0,
      resetTime: Date.now() + 60_000,
      blocked: true,
      source: "fail_closed",
    });

    const req = new NextRequest("http://localhost/api/bookings/send-cancellation", {
      method: "POST",
      body: JSON.stringify({
        bookingId: "booking-1",
        salonId: "salon-1",
        customerEmail: "customer@example.com",
      }),
      headers: { "content-type": "application/json" },
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(429);
    expect(body.error).toBe("Rate limit exceeded");
    expect(res.headers.get("X-RateLimit-Limit")).toBeTruthy();
    expect(res.headers.get("X-RateLimit-Remaining")).toBe("0");
    expect(res.headers.get("Retry-After")).toBeTruthy();
    expect(mockIncrementRateLimit).not.toHaveBeenCalled();
    expect(mockSendBookingCancellation).not.toHaveBeenCalled();
  });

  it("continues normally when under limit", async () => {
    mockCheckRateLimit.mockResolvedValue({
      allowed: true,
      remainingAttempts: 19,
      resetTime: Date.now() + 60_000,
      blocked: false,
    });
    mockIncrementRateLimit.mockResolvedValue({
      allowed: true,
      remainingAttempts: 18,
      resetTime: Date.now() + 60_000,
      blocked: false,
    });
    mockGetSalonById.mockResolvedValue({
      data: { id: "salon-1", name: "Test Salon", timezone: "UTC", preferred_language: "en" },
      error: null,
    });
    mockAdminMaybeSingle.mockResolvedValue({
      data: {
        id: "booking-1",
        salon_id: "salon-1",
        start_time: "2026-03-01T10:00:00Z",
        end_time: "2026-03-01T11:00:00Z",
        status: "cancelled",
        is_walk_in: false,
        customers: { full_name: "Jane Doe", email: "customer@example.com" },
        employees: { full_name: "Alex" },
        services: { name: "Cut" },
      },
      error: null,
    });
    mockSendBookingCancellation.mockResolvedValue({ data: { id: "email-1" }, error: null });
    mockRpc.mockResolvedValue({ data: 1, error: null });
    mockEventMaybeSingle.mockResolvedValue({ data: null, error: null });
    mockEventUpsert.mockResolvedValue({ error: null });
    mockEventUpdateEq.mockResolvedValue({ error: null });

    const req = new NextRequest("http://localhost/api/bookings/send-cancellation", {
      method: "POST",
      body: JSON.stringify({
        bookingId: "booking-1",
        salonId: "salon-1",
        customerEmail: "customer@example.com",
      }),
      headers: { "content-type": "application/json" },
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.customerEmail).toBeDefined();
    expect(mockIncrementRateLimit).toHaveBeenCalledOnce();
    expect(mockSendBookingCancellation).toHaveBeenCalledOnce();
  });
});
