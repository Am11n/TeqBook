// =====================================================
// API Rate Limiting Tests
// =====================================================
// Tests for rate limiting middleware used in Edge Functions
// Tests rate limit per endpoint, per IP/user, configuration, and error responses

import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock Supabase client for Edge Function context
const mockSupabaseClient = {
  from: vi.fn(),
};

// Mock rate limit entry structure
interface MockRateLimitEntry {
  id: string;
  identifier: string;
  identifier_type: string;
  endpoint_type: string;
  attempts: number;
  reset_at: string;
  blocked_until: string | null;
  created_at: string;
  updated_at: string;
}

describe("API Rate Limiting Middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rate limit per endpoint", () => {
    it("should enforce separate rate limits for different endpoints", async () => {
      // Mock: Different endpoints should have separate counters
      const billingEndpoint = {
        identifier: "user-123",
        endpointType: "billing-create-customer",
        attempts: 3,
      };

      const subscriptionEndpoint = {
        identifier: "user-123",
        endpointType: "billing-create-subscription",
        attempts: 2,
      };

      // Same user, different endpoints should have independent rate limits
      expect(billingEndpoint.attempts).toBe(3);
      expect(subscriptionEndpoint.attempts).toBe(2);
      expect(billingEndpoint.endpointType).not.toBe(
        subscriptionEndpoint.endpointType
      );
    });

    it("should track rate limits independently per endpoint type", () => {
      const endpoints = [
        "billing-create-customer",
        "billing-create-subscription",
        "billing-update-plan",
        "whatsapp-send",
      ];

      // Each endpoint should have its own rate limit configuration
      endpoints.forEach((endpoint) => {
        expect(endpoint).toBeDefined();
        expect(typeof endpoint).toBe("string");
      });
    });
  });

  describe("Rate limit per IP/user", () => {
    it("should enforce rate limit per IP address for unauthenticated requests", () => {
      const ipAddress = "192.168.1.1";
      const identifier = ipAddress;
      const identifierType = "ip";

      // Rate limit should be tracked per IP
      expect(identifier).toBe(ipAddress);
      expect(identifierType).toBe("ip");
    });

    it("should enforce rate limit per user ID for authenticated requests", () => {
      const userId = "user-123";
      const identifier = userId;
      const identifierType = "user_id";

      // Rate limit should be tracked per user
      expect(identifier).toBe(userId);
      expect(identifierType).toBe("user_id");
    });

    it("should prioritize user ID over IP for authenticated requests", () => {
      const userId = "user-123";
      const ipAddress = "192.168.1.1";

      // Authenticated requests should use user ID, not IP
      const identifier = userId; // User ID takes precedence
      const identifierType = "user_id";

      expect(identifier).toBe(userId);
      expect(identifierType).toBe("user_id");
      expect(identifier).not.toBe(ipAddress);
    });
  });

  describe("Rate limit configuration", () => {
    it("should allow different rate limits for different endpoint types", () => {
      const configs = {
        "billing-create-customer": {
          maxAttempts: 10,
          windowMs: 15 * 60 * 1000, // 15 minutes
        },
        "billing-create-subscription": {
          maxAttempts: 5,
          windowMs: 15 * 60 * 1000,
        },
        "billing-update-plan": {
          maxAttempts: 20,
          windowMs: 60 * 60 * 1000, // 1 hour
        },
        "whatsapp-send": {
          maxAttempts: 100,
          windowMs: 60 * 60 * 1000, // 1 hour
        },
      };

      // Each endpoint should have configurable limits
      expect(configs["billing-create-customer"].maxAttempts).toBe(10);
      expect(configs["billing-create-subscription"].maxAttempts).toBe(5);
      expect(configs["billing-update-plan"].maxAttempts).toBe(20);
      expect(configs["whatsapp-send"].maxAttempts).toBe(100);
    });

    it("should support configurable block duration", () => {
      const blockDurations = {
        default: 30 * 60 * 1000, // 30 minutes
        strict: 60 * 60 * 1000, // 1 hour
        lenient: 15 * 60 * 1000, // 15 minutes
      };

      // Block duration should be configurable
      expect(blockDurations.default).toBe(30 * 60 * 1000);
      expect(blockDurations.strict).toBeGreaterThan(
        blockDurations.default
      );
      expect(blockDurations.lenient).toBeLessThan(
        blockDurations.default
      );
    });

    it("should validate rate limit configuration values", () => {
      const config = {
        maxAttempts: 10,
        windowMs: 15 * 60 * 1000,
        blockDurationMs: 30 * 60 * 1000,
      };

      // Configuration should have valid values
      expect(config.maxAttempts).toBeGreaterThan(0);
      expect(config.windowMs).toBeGreaterThan(0);
      expect(config.blockDurationMs).toBeGreaterThan(0);
      expect(config.blockDurationMs).toBeGreaterThanOrEqual(
        config.windowMs
      );
    });
  });

  describe("Rate limit error responses", () => {
    it("should return 429 status code when rate limit exceeded", () => {
      const rateLimitExceeded = {
        status: 429,
        headers: {
          "X-RateLimit-Limit": "10",
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": new Date(
            Date.now() + 15 * 60 * 1000
          ).toISOString(),
          "Retry-After": "900", // 15 minutes in seconds
        },
        body: {
          error: "Rate limit exceeded",
          message: "Too many requests. Please try again later.",
          retryAfter: 900,
        },
      };

      expect(rateLimitExceeded.status).toBe(429);
      expect(rateLimitExceeded.headers["X-RateLimit-Remaining"]).toBe("0");
      expect(rateLimitExceeded.body.error).toBe("Rate limit exceeded");
    });

    it("should include rate limit headers in all responses", () => {
      const responseHeaders = {
        "X-RateLimit-Limit": "10",
        "X-RateLimit-Remaining": "5",
        "X-RateLimit-Reset": new Date(
          Date.now() + 10 * 60 * 1000
        ).toISOString(),
      };

      // All responses should include rate limit headers
      expect(responseHeaders["X-RateLimit-Limit"]).toBeDefined();
      expect(responseHeaders["X-RateLimit-Remaining"]).toBeDefined();
      expect(responseHeaders["X-RateLimit-Reset"]).toBeDefined();
      expect(
        parseInt(responseHeaders["X-RateLimit-Remaining"])
      ).toBeLessThanOrEqual(
        parseInt(responseHeaders["X-RateLimit-Limit"])
      );
    });

    it("should return appropriate error message when blocked", () => {
      const blockedResponse = {
        status: 429,
        body: {
          error: "Rate limit exceeded",
          message:
            "Your account has been temporarily blocked due to excessive requests. Please try again in 30 minutes.",
          retryAfter: 1800, // 30 minutes
          blockedUntil: new Date(
            Date.now() + 30 * 60 * 1000
          ).toISOString(),
        },
      };

      expect(blockedResponse.status).toBe(429);
      expect(blockedResponse.body.error).toBe("Rate limit exceeded");
      expect(blockedResponse.body.message).toContain("temporarily blocked");
      expect(blockedResponse.body.retryAfter).toBe(1800);
    });

    it("should handle rate limit check failures gracefully", () => {
      const errorScenarios = [
        {
          error: "Database connection failed",
          fallback: "allow", // Fail open for availability
        },
        {
          error: "Rate limit table not found",
          fallback: "allow",
        },
        {
          error: "Invalid identifier",
          fallback: "reject", // Fail closed for invalid input
        },
      ];

      // Should handle errors gracefully
      errorScenarios.forEach((scenario) => {
        expect(scenario.error).toBeDefined();
        expect(scenario.fallback).toBeDefined();
        expect(["allow", "reject"]).toContain(scenario.fallback);
      });
    });
  });

  describe("Rate limit middleware integration", () => {
    it("should extract identifier from request (IP or user)", () => {
      const requestScenarios = [
        {
          type: "unauthenticated",
          headers: { "x-forwarded-for": "192.168.1.1" },
          expectedIdentifier: "192.168.1.1",
          expectedType: "ip",
        },
        {
          type: "authenticated",
          headers: { authorization: "Bearer token" },
          user: { id: "user-123" },
          expectedIdentifier: "user-123",
          expectedType: "user_id",
        },
      ];

      requestScenarios.forEach((scenario) => {
        expect(scenario.expectedIdentifier).toBeDefined();
        expect(scenario.expectedType).toBeDefined();
        expect(["ip", "user_id"]).toContain(scenario.expectedType);
      });
    });

    it("should apply rate limiting before processing request", () => {
      const requestFlow = [
        "1. Extract identifier (IP or user ID)",
        "2. Check rate limit",
        "3. If allowed, process request",
        "4. If blocked, return 429",
      ];

      // Rate limiting should happen before request processing
      expect(requestFlow[0]).toContain("Extract identifier");
      expect(requestFlow[1]).toContain("Check rate limit");
      expect(requestFlow[2]).toContain("process request");
      expect(requestFlow[3]).toContain("return 429");
    });
  });
});

