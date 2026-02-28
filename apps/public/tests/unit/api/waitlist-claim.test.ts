import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { GET, POST } from "@/app/api/waitlist/claim/route";

const mockCreateClient = vi.fn();
const mockRpc = vi.fn();

vi.mock("@supabase/supabase-js", () => ({
  createClient: (...args: unknown[]) => mockCreateClient(...args),
}));

describe("Public waitlist claim API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role-key";
    mockCreateClient.mockReturnValue({
      rpc: mockRpc,
    });
  });

  it("accepts claim token via POST", async () => {
    mockRpc.mockResolvedValue({
      data: [{ ok: true, message: "Offer accepted and booking created", result_status: "accepted" }],
      error: null,
    });

    const req = new NextRequest("http://localhost/api/waitlist/claim", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ token: "abc123", action: "accept", channel: "email_link" }),
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.status).toBe("accepted");
  });

  it("declines claim via GET link", async () => {
    mockRpc.mockResolvedValue({
      data: [{ ok: true, message: "Offer declined", result_status: "declined" }],
      error: null,
    });

    const req = new NextRequest(
      "http://localhost/api/waitlist/claim?action=decline&token=abc123&channel=sms_link",
      { method: "GET" }
    );

    const res = await GET(req);
    const text = await res.text();

    expect(res.status).toBe(200);
    expect(text).toContain("Offer declined");
  });
});
