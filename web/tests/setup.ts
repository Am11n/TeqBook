// Test setup file
// This file runs before each test file

import { vi } from "vitest";
import { config } from "dotenv";
import { resolve } from "path";
import "@testing-library/jest-dom";

// Load environment variables from .env.local (preferred) or .env
// .env.local takes precedence if both exist
const envResult = config({ path: resolve(process.cwd(), ".env") });
const envLocalResult = config({ path: resolve(process.cwd(), ".env.local") });

// Debug: Log if env files were loaded (only in test mode)
if (process.env.NODE_ENV === "test" || process.env.VITEST) {
  if (envResult.error && envLocalResult.error) {
    console.warn("[Test Setup] No .env or .env.local file found. Integration tests may be skipped.");
  } else {
    const loadedFrom = envLocalResult.error ? ".env" : ".env.local";
    console.log(`[Test Setup] Environment variables loaded from ${loadedFrom}`);
  }
}

// Set environment variables for tests (with fallbacks for unit tests)
process.env.NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://test.supabase.co";
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "test-anon-key";
process.env.SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

// Debug: Check if required variables are set (for integration tests)
if (process.env.NODE_ENV === "test" || process.env.VITEST) {
  const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== "https://test.supabase.co";
  const hasAnonKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== "test-anon-key";
  const hasServiceKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (hasUrl || hasAnonKey || hasServiceKey) {
    console.log(`[Test Setup] Supabase config: URL=${hasUrl ? "✓" : "✗"}, AnonKey=${hasAnonKey ? "✓" : "✗"}, ServiceKey=${hasServiceKey ? "✓" : "✗"}`);
  }
}

// Mock Next.js router
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

// Mock Supabase client
vi.mock("@/lib/supabase-client", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => ({
            range: vi.fn(() => Promise.resolve({ data: [], error: null, count: 0 })),
          })),
          maybeSingle: vi.fn(() => Promise.resolve({ data: null, error: null })),
          single: vi.fn(() => Promise.resolve({ data: null, error: null })),
        })),
        maybeSingle: vi.fn(() => Promise.resolve({ data: null, error: null })),
        single: vi.fn(() => Promise.resolve({ data: null, error: null })),
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          maybeSingle: vi.fn(() => Promise.resolve({ data: null, error: null })),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ error: null })),
        select: vi.fn(() => ({
          maybeSingle: vi.fn(() => Promise.resolve({ data: null, error: null })),
        })),
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ error: null })),
      })),
    })),
    rpc: vi.fn(() => Promise.resolve({ data: null, error: null })),
    auth: {
      getUser: vi.fn(() => Promise.resolve({ data: { user: null }, error: null })),
      signInWithPassword: vi.fn(() => Promise.resolve({ data: { user: null }, error: null })),
      signUp: vi.fn(() => Promise.resolve({ data: { user: null }, error: null })),
      signOut: vi.fn(() => Promise.resolve({ error: null })),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: null }, unsubscribe: vi.fn() })),
    },
  },
}));

