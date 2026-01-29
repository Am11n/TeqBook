import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  checkRateLimit,
  incrementRateLimit,
  resetRateLimit,
} from "@/lib/services/rate-limit-service";

// Mock fetch for Edge Function calls
global.fetch = vi.fn();

// Mock Supabase client
vi.mock("@/lib/supabase-client", () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: {
          session: {
            access_token: "mock-token",
          },
        },
      }),
    },
  },
}));

const SUPABASE_URL = "https://test.supabase.co";
const EDGE_FUNCTION_BASE = `${SUPABASE_URL}/functions/v1`;

describe("Rate Limit Service (Server-Side)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Set up environment variable
    process.env.NEXT_PUBLIC_SUPABASE_URL = SUPABASE_URL;
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "mock-anon-key";
  });

  describe("checkRateLimit", () => {
    it("should return allowed=true when rate limit is not exceeded", async () => {
      const mockResponse = {
        allowed: true,
        remainingAttempts: 4,
        resetTime: null,
        blocked: false,
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await checkRateLimit("test@example.com", "login");

      expect(result.allowed).toBe(true);
      expect(result.remainingAttempts).toBe(4);
      expect(result.blocked).toBe(false);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/rate-limit-check"),
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            "Content-Type": "application/json",
          }),
        })
      );
    });

    it("should return allowed=false when rate limit is exceeded", async () => {
      const mockResponse = {
        allowed: false,
        remainingAttempts: 0,
        resetTime: Date.now() + 30 * 60 * 1000,
        blocked: true,
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await checkRateLimit("test@example.com", "login");

      expect(result.allowed).toBe(false);
      expect(result.remainingAttempts).toBe(0);
      expect(result.blocked).toBe(true);
      expect(result.resetTime).toBeDefined();
    });

    it("should handle rate limit per IP address", async () => {
      const mockResponse = {
        allowed: true,
        remainingAttempts: 3,
        resetTime: null,
        blocked: false,
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await checkRateLimit("192.168.1.1", "api", {
        identifierType: "ip",
      });

      expect(result.allowed).toBe(true);
      expect(result.remainingAttempts).toBe(3);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/rate-limit-check"),
        expect.objectContaining({
          method: "POST",
          body: expect.stringContaining("ip"),
        })
      );
    });
  });

  describe("incrementRateLimit", () => {
    it("should increment rate limit counter and return status", async () => {
      const mockResponse = {
        allowed: true,
        remainingAttempts: 3,
        resetTime: Date.now() + 15 * 60 * 1000,
        blocked: false,
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await incrementRateLimit("test@example.com", "login");

      expect(result.allowed).toBe(true);
      expect(result.remainingAttempts).toBe(3);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/rate-limit-check"),
        expect.objectContaining({
          method: "POST",
          body: expect.any(String),
        })
      );
      
      // Verify the body contains increment action
      const callArgs = vi.mocked(fetch).mock.calls[0];
      const body = JSON.parse(callArgs[1]?.body as string);
      expect(body.action).toBe("increment");
    });

    it("should block after max attempts exceeded", async () => {
      const mockResponse = {
        allowed: false,
        remainingAttempts: 0,
        resetTime: Date.now() + 30 * 60 * 1000,
        blocked: true,
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await incrementRateLimit("test@example.com", "login");

      expect(result.allowed).toBe(false);
      expect(result.blocked).toBe(true);
    });
  });

  describe("resetRateLimit", () => {
    it("should reset rate limit for identifier", async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      } as Response);

      const result = await resetRateLimit("test@example.com", "login");

      expect(result.success).toBe(true);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/rate-limit-check"),
        expect.objectContaining({
          method: "POST",
        })
      );
      
      // Verify the body contains reset action
      const callArgs = vi.mocked(fetch).mock.calls[0];
      const body = JSON.parse(callArgs[1]?.body as string);
      expect(body.action).toBe("reset");
    });
  });

  describe("rate limit bypass prevention", () => {
    it("should enforce rate limit even if client-side check is bypassed", async () => {
      const mockResponse = {
        allowed: false,
        remainingAttempts: 0,
        resetTime: Date.now() + 30 * 60 * 1000,
        blocked: true,
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      // Simulate client-side check being bypassed
      const result = await checkRateLimit("test@example.com", "login");

      // Server-side should still block
      expect(result.allowed).toBe(false);
      expect(result.blocked).toBe(true);
    });
  });
});

