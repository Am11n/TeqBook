import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "@/app/api/bookings/send-notifications/route";

const mockCheckRateLimit = vi.fn();
const mockIncrementRateLimit = vi.fn();
const mockGetSalonById = vi.fn();
const mockSendBookingConfirmation = vi.fn();
const mockScheduleReminders = vi.fn();
const mockRpc = vi.fn();

vi.mock("@/lib/services/rate-limit-service", () => ({
  checkRateLimit: (...args: unknown[]) => mockCheckRateLimit(...args),
  incrementRateLimit: (...args: unknown[]) => mockIncrementRateLimit(...args),
}));

vi.mock("@/lib/repositories/salons", () => ({
  getSalonById: (...args: unknown[]) => mockGetSalonById(...args),
}));

vi.mock("@/lib/services/email-service", () => ({
  sendBookingConfirmation: (...args: unknown[]) => mockSendBookingConfirmation(...args),
}));

vi.mock("@/lib/services/reminder-service", () => ({
  scheduleReminders: (...args: unknown[]) => mockScheduleReminders(...args),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClientForRouteHandler: () => ({
    rpc: (...args: unknown[]) => mockRpc(...args),
  }),
}));

vi.mock("@/lib/services/logger", () => ({
  logInfo: vi.fn(),
  logWarn: vi.fn(),
  logError: vi.fn(),
}));

describe("Public bookings/send-notifications rate limiting", () => {
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

    const req = new NextRequest("http://localhost/api/bookings/send-notifications", {
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
    expect(mockSendBookingConfirmation).not.toHaveBeenCalled();
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
    mockSendBookingConfirmation.mockResolvedValue({ data: { id: "email-1" }, error: null });
    mockScheduleReminders.mockResolvedValue({ error: null });
    mockRpc.mockResolvedValue({ data: 1, error: null });

    const req = new NextRequest("http://localhost/api/bookings/send-notifications", {
      method: "POST",
      body: JSON.stringify({
        bookingId: "booking-1",
        salonId: "salon-1",
        customerEmail: "customer@example.com",
        bookingData: {
          id: "booking-1",
          salon_id: "salon-1",
          start_time: "2026-03-01T10:00:00Z",
          end_time: "2026-03-01T11:00:00Z",
          status: "confirmed",
          is_walk_in: false,
          customer_full_name: "Jane Doe",
          service_name: "Cut",
          employee_name: "Alex",
        },
      }),
      headers: { "content-type": "application/json" },
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.email).toBeDefined();
    expect(mockIncrementRateLimit).toHaveBeenCalledOnce();
    expect(mockSendBookingConfirmation).toHaveBeenCalledOnce();
  });
});
