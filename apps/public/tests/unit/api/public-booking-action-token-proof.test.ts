import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "@/app/api/public-booking/action-token/route";
import { hashPublicBookingProofCode } from "@/lib/security/public-booking-proof";

const bookingId = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee";
const salonId = "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb";
const customerEmail = "customer@example.com";

let proofRow: {
  code_hash: string;
  expires_at: string;
  failed_attempts: number;
} | null = null;

const mockMaybeSingleBooking = vi.fn();
const mockProofMaybeSingle = vi.fn(async () => ({ data: proofRow, error: null as null }));

vi.mock("@/lib/services/rate-limit-service", () => ({
  checkRateLimit: vi.fn(async () => ({
    allowed: true,
    remainingAttempts: 29,
    resetTime: null as number | null,
  })),
  incrementRateLimit: vi.fn(async () => {}),
}));

vi.mock("@/lib/http/trusted-client-ip", () => ({
  getTrustedClientIp: () => "127.0.0.1",
}));

vi.mock("@/lib/security/public-booking-action-token", () => ({
  issuePublicBookingActionToken: vi.fn(({ purpose }: { purpose: string }) => `jwt-${purpose}`),
  PUBLIC_BOOKING_ACTION_TOKEN_TTL_SECONDS: { confirmation: 60, notify: 60, cancel: 60 },
}));

vi.mock("@/lib/supabase/admin", () => ({
  getAdminClient: () => ({
    from: (table: string) => {
      if (table === "bookings") {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({ maybeSingle: mockMaybeSingleBooking }),
            }),
          }),
        };
      }
      if (table === "public_booking_action_proofs") {
        return {
          select: () => ({
            eq: () => ({ maybeSingle: mockProofMaybeSingle }),
          }),
          delete: () => ({
            eq: vi.fn(async () => {
              proofRow = null;
              return { error: null };
            }),
          }),
          update: () => ({
            eq: vi.fn(async () => ({ error: null })),
          }),
        };
      }
      return {};
    },
  }),
}));

vi.mock("@/lib/services/logger", () => ({
  logInfo: vi.fn(),
  logWarn: vi.fn(),
  logError: vi.fn(),
}));

function jsonRequest(body: Record<string, unknown>) {
  return new NextRequest("http://localhost/api/public-booking/action-token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("public-booking action-token proof gate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    proofRow = null;
    mockMaybeSingleBooking.mockResolvedValue({
      data: {
        id: bookingId,
        salon_id: salonId,
        customers: { email: customerEmail },
      },
      error: null,
    });
  });

  it("returns 403 for wrong proof code (misuse)", async () => {
    const goodCode = "111111";
    proofRow = {
      code_hash: hashPublicBookingProofCode({ bookingId, code: goodCode }),
      expires_at: new Date(Date.now() + 60_000).toISOString(),
      failed_attempts: 0,
    };
    const res = await POST(
      jsonRequest({
        bookingId,
        salonId,
        customerEmail,
        purposes: ["confirmation"],
        proofCode: "999999",
      }),
    );
    expect(res.status).toBe(403);
    const body = (await res.json()) as { error?: string };
    expect(body.error).toMatch(/Invalid verification code/i);
  });

  it("returns 403 when proof is expired", async () => {
    proofRow = {
      code_hash: hashPublicBookingProofCode({ bookingId, code: "111111" }),
      expires_at: new Date(Date.now() - 60_000).toISOString(),
      failed_attempts: 0,
    };
    const res = await POST(
      jsonRequest({
        bookingId,
        salonId,
        customerEmail,
        purposes: ["confirmation"],
        proofCode: "111111",
      }),
    );
    expect(res.status).toBe(403);
    const body = (await res.json()) as { error?: string };
    expect(body.error).toMatch(/expired/i);
  });

  it("rejects replay after successful mint: no second mint without new proof", async () => {
    const code = "222222";
    proofRow = {
      code_hash: hashPublicBookingProofCode({ bookingId, code }),
      expires_at: new Date(Date.now() + 60_000).toISOString(),
      failed_attempts: 0,
    };
    const first = await POST(
      jsonRequest({
        bookingId,
        salonId,
        customerEmail,
        purposes: ["confirmation"],
        proofCode: code,
      }),
    );
    expect(first.status).toBe(200);

    const second = await POST(
      jsonRequest({
        bookingId,
        salonId,
        customerEmail,
        purposes: ["confirmation"],
        proofCode: code,
      }),
    );
    expect(second.status).toBe(403);
    const body = (await second.json()) as { error?: string };
    expect(body.error).toMatch(/No active verification code/i);
  });
});
