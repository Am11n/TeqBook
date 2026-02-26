import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "@/app/api/contact/route";

const mockCheckRateLimit = vi.fn();
const mockIncrementRateLimit = vi.fn();
const mockInsert = vi.fn();

vi.mock("@/lib/services/rate-limit-service", () => ({
  checkRateLimit: (...args: unknown[]) => mockCheckRateLimit(...args),
  incrementRateLimit: (...args: unknown[]) => mockIncrementRateLimit(...args),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClientForRouteHandler: () => ({
    from: () => ({
      insert: (...args: unknown[]) => mockInsert(...args),
    }),
  }),
}));

describe("Public contact API rate limiting", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 429 with rate-limit headers when blocked", async () => {
    mockCheckRateLimit.mockResolvedValue({
      allowed: false,
      remainingAttempts: 0,
      resetTime: Date.now() + 60_000,
      blocked: true,
    });

    const req = new NextRequest("http://localhost/api/contact", {
      method: "POST",
      body: JSON.stringify({
        name: "Jane Doe",
        email: "jane@example.com",
        message: "Hei!",
        consent: true,
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
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it("increments and inserts when request is allowed", async () => {
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
    mockInsert.mockResolvedValue({ error: null });

    const req = new NextRequest("http://localhost/api/contact", {
      method: "POST",
      body: JSON.stringify({
        name: "Jane Doe",
        email: "jane@example.com",
        message: "Hei!",
        consent: true,
      }),
      headers: { "content-type": "application/json" },
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.ok).toBe(true);
    expect(mockIncrementRateLimit).toHaveBeenCalledOnce();
    expect(mockInsert).toHaveBeenCalledOnce();
  });
});
