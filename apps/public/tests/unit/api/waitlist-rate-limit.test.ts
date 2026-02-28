import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "@/app/api/waitlist/route";

const mockCheckRateLimit = vi.fn();
const mockIncrementRateLimit = vi.fn();
const mockCreateClient = vi.fn();

vi.mock("@/lib/services/rate-limit-service", () => ({
  checkRateLimit: (...args: unknown[]) => mockCheckRateLimit(...args),
  incrementRateLimit: (...args: unknown[]) => mockIncrementRateLimit(...args),
}));

vi.mock("@supabase/supabase-js", () => ({
  createClient: (...args: unknown[]) => mockCreateClient(...args),
}));

function buildMockSupabaseClient() {
  const query = {
    select: vi.fn(() => query),
    eq: vi.fn(() => query),
    or: vi.fn(() => query),
    in: vi.fn(() => query),
    limit: vi.fn(() => query),
    maybeSingle: vi.fn(async () => ({ data: null, error: null })),
  };

  query.maybeSingle = vi
    .fn()
    .mockResolvedValueOnce({ data: { id: "salon-1", is_public: true }, error: null })
    .mockResolvedValueOnce({ data: { id: "service-1" }, error: null })
    .mockResolvedValueOnce({ data: null, error: null });

  const insertChain = {
    select: vi.fn(() => insertChain),
    single: vi.fn(async () => ({ data: { id: "entry-1", status: "waiting" }, error: null })),
  };

  return {
    from: vi.fn((table: string) => {
      if (table === "waitlist_entries") {
        return {
          ...query,
          insert: vi.fn(() => insertChain),
        };
      }
      return query;
    }),
  };
}

describe("Public waitlist API rate limiting", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role-key";
  });

  it("returns 429 when blocked by rate limiter", async () => {
    mockCheckRateLimit.mockResolvedValue({
      allowed: false,
      remainingAttempts: 0,
      resetTime: Date.now() + 60_000,
      blocked: true,
    });

    const req = new NextRequest("http://localhost/api/waitlist", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        salonId: "11111111-1111-4111-8111-111111111111",
        serviceId: "22222222-2222-4222-8222-222222222222",
        preferredDate: "2026-03-10",
        customerName: "Jane Doe",
        customerEmail: "jane@example.com",
      }),
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(429);
    expect(body.error).toBe("Rate limit exceeded");
    expect(mockIncrementRateLimit).not.toHaveBeenCalled();
  });

  it("creates waitlist entry when allowed", async () => {
    mockCheckRateLimit.mockResolvedValue({
      allowed: true,
      remainingAttempts: 9,
      resetTime: Date.now() + 60_000,
      blocked: false,
    });
    mockIncrementRateLimit.mockResolvedValue({
      allowed: true,
      remainingAttempts: 8,
      resetTime: Date.now() + 60_000,
      blocked: false,
    });
    mockCreateClient.mockReturnValue(buildMockSupabaseClient());

    const req = new NextRequest("http://localhost/api/waitlist", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        salonId: "11111111-1111-4111-8111-111111111111",
        serviceId: "22222222-2222-4222-8222-222222222222",
        preferredDate: "2026-03-10",
        customerName: "Jane Doe",
        customerEmail: "jane@example.com",
      }),
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.ok).toBe(true);
    expect(mockIncrementRateLimit).toHaveBeenCalledOnce();
    expect(mockCreateClient).toHaveBeenCalledOnce();
  });
});
