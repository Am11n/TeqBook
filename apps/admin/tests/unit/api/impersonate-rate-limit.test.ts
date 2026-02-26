import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "@/app/api/impersonate/route";

const mockCheckRateLimit = vi.fn();
const mockIncrementRateLimit = vi.fn();
const mockFrom = vi.fn();

function profileQuery() {
  return {
    select: () => ({
      eq: () => ({
        single: async () => ({ data: { is_superadmin: true }, error: null }),
      }),
    }),
  };
}

function salonQuery() {
  return {
    select: () => ({
      eq: () => ({
        single: async () => ({ data: { id: "salon-1", name: "Test Salon" }, error: null }),
      }),
    }),
  };
}

function employeesQuery() {
  return {
    select: () => ({
      eq: async () => ({ data: [], error: null }),
    }),
  };
}

function bookingsQuery() {
  return {
    select: () => ({
      eq: () => ({
        order: () => ({
          limit: async () => ({ data: [], error: null }),
        }),
      }),
    }),
  };
}

function servicesQuery() {
  return {
    select: () => ({
      eq: async () => ({ data: [], error: null }),
    }),
  };
}

function auditLogQuery() {
  return {
    insert: async () => ({ error: null }),
  };
}

vi.mock("@/lib/services/rate-limit-service", () => ({
  checkRateLimit: (...args: unknown[]) => mockCheckRateLimit(...args),
  incrementRateLimit: (...args: unknown[]) => mockIncrementRateLimit(...args),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    auth: {
      getUser: async () => ({ data: { user: { id: "admin-user-1", email: "admin@teqbook.com" } } }),
    },
    from: (...args: unknown[]) => mockFrom(...args),
  }),
}));

describe("Admin impersonate API rate limiting", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockFrom.mockImplementation((table: string) => {
      if (table === "profiles") return profileQuery();
      if (table === "salons") return salonQuery();
      if (table === "employees") return employeesQuery();
      if (table === "bookings") return bookingsQuery();
      if (table === "services") return servicesQuery();
      if (table === "security_audit_log") return auditLogQuery();
      throw new Error(`Unexpected table: ${table}`);
    });
  });

  it("returns 429 with headers when rate-limited", async () => {
    mockCheckRateLimit.mockResolvedValue({
      allowed: false,
      remainingAttempts: 0,
      resetTime: Date.now() + 60_000,
      blocked: true,
    });

    const req = new NextRequest("http://localhost/api/impersonate?salon_id=salon-1");
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(429);
    expect(body.error).toBe("Rate limit exceeded");
    expect(res.headers.get("X-RateLimit-Limit")).toBeTruthy();
    expect(res.headers.get("X-RateLimit-Remaining")).toBe("0");
    expect(mockIncrementRateLimit).not.toHaveBeenCalled();
  });

  it("increments and returns impersonation payload when allowed", async () => {
    mockCheckRateLimit.mockResolvedValue({
      allowed: true,
      remainingAttempts: 29,
      resetTime: Date.now() + 60_000,
      blocked: false,
    });
    mockIncrementRateLimit.mockResolvedValue({
      allowed: true,
      remainingAttempts: 28,
      resetTime: Date.now() + 60_000,
      blocked: false,
    });

    const req = new NextRequest("http://localhost/api/impersonate?salon_id=salon-1");
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.salon).toBeTruthy();
    expect(Array.isArray(body.employees)).toBe(true);
    expect(mockIncrementRateLimit).toHaveBeenCalledOnce();
  });
});
