import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "@/app/api/settings/send-test-notification/route";

const mockAuthenticateAndVerifySalon = vi.fn();
const mockCheckRateLimit = vi.fn();
const mockIncrementRateLimit = vi.fn();
const mockGetSalonById = vi.fn();
const mockSendEmail = vi.fn();

vi.mock("@/lib/api-auth", () => ({
  authenticateAndVerifySalon: (...args: unknown[]) => mockAuthenticateAndVerifySalon(...args),
}));

vi.mock("@/lib/services/rate-limit-service", () => ({
  checkRateLimit: (...args: unknown[]) => mockCheckRateLimit(...args),
  incrementRateLimit: (...args: unknown[]) => mockIncrementRateLimit(...args),
}));

vi.mock("@/lib/repositories/salons", () => ({
  getSalonById: (...args: unknown[]) => mockGetSalonById(...args),
}));

vi.mock("@/lib/services/email-service", () => ({
  sendEmail: (...args: unknown[]) => mockSendEmail(...args),
}));

vi.mock("@/lib/services/logger", () => ({
  logInfo: vi.fn(),
  logWarn: vi.fn(),
  logError: vi.fn(),
}));

describe("Dashboard send-test-notification rate limiting", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthenticateAndVerifySalon.mockResolvedValue({
      error: null,
      user: { id: "user-1" },
      hasAccess: true,
    });
  });

  it("returns 429 with headers when blocked", async () => {
    mockCheckRateLimit.mockResolvedValue({
      allowed: false,
      remainingAttempts: 0,
      resetTime: Date.now() + 60_000,
      blocked: true,
      source: "fail_closed",
    });

    const req = new NextRequest("http://localhost/api/settings/send-test-notification", {
      method: "POST",
      body: JSON.stringify({
        recipientEmail: "test@example.com",
        group: "internal",
        salonId: "salon-1",
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
    expect(mockSendEmail).not.toHaveBeenCalled();
  });

  it("sends test email when under limit", async () => {
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
    mockGetSalonById.mockResolvedValue({
      data: { id: "salon-1", name: "Test Salon" },
      error: null,
    });
    mockSendEmail.mockResolvedValue({
      data: { id: "email-1" },
      error: null,
    });

    const req = new NextRequest("http://localhost/api/settings/send-test-notification", {
      method: "POST",
      body: JSON.stringify({
        recipientEmail: "test@example.com",
        group: "internal",
        salonId: "salon-1",
      }),
      headers: { "content-type": "application/json" },
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(mockIncrementRateLimit).toHaveBeenCalledOnce();
    expect(mockSendEmail).toHaveBeenCalledOnce();
  });
});
