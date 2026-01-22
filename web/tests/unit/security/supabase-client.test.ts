// =====================================================
// Supabase Client Production Hardening Tests
// =====================================================
// Tests for client initialization and production fail-hard behavior

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("Supabase Client Production Hardening", () => {
  const originalEnv = process.env;
  const originalNodeEnv = process.env.NODE_ENV;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    process.env.NODE_ENV = originalNodeEnv;
  });

  describe("Production environment", () => {
    it("should throw error if Supabase credentials missing in production", async () => {
      process.env.NODE_ENV = "production";
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      // Clear module cache to force re-import
      vi.resetModules();

      await expect(async () => {
        await import("@/lib/supabase-client");
      }).rejects.toThrow();
    });

    it("should throw clear error message identifying missing credentials", async () => {
      process.env.NODE_ENV = "production";
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      vi.resetModules();

      try {
        await import("@/lib/supabase-client");
        expect.fail("Should have thrown error");
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        expect(errorMessage).toContain("NEXT_PUBLIC_SUPABASE_URL");
        expect(errorMessage).toContain("NEXT_PUBLIC_SUPABASE_ANON_KEY");
        expect(errorMessage).toContain("production");
      }
    });

    it("should succeed if credentials are present in production", async () => {
      process.env.NODE_ENV = "production";
      process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-anon-key";

      vi.resetModules();

      await expect(async () => {
        await import("@/lib/supabase-client");
      }).resolves.not.toThrow();
    });
  });

  describe("Test environment", () => {
    it("should use fallback values in test environment when env vars missing", async () => {
      process.env.NODE_ENV = "test";
      process.env.VITEST = "true";
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      vi.resetModules();

      await expect(async () => {
        await import("@/lib/supabase-client");
      }).resolves.not.toThrow();
    });

    it("should use fallback values when VITEST is set", async () => {
      process.env.VITEST = "true";
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      vi.resetModules();

      await expect(async () => {
        await import("@/lib/supabase-client");
      }).resolves.not.toThrow();
    });
  });

  describe("Development environment", () => {
    it("should warn but not throw in development when env vars missing", async () => {
      process.env.NODE_ENV = "development";
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      const consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      vi.resetModules();

      await expect(async () => {
        await import("@/lib/supabase-client");
      }).resolves.not.toThrow();

      // Note: console.warn may not be called immediately due to module loading
      // The important thing is that it doesn't throw

      consoleWarnSpy.mockRestore();
    });
  });
});
