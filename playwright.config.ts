import { defineConfig, devices } from "@playwright/test";
import path from "path";

const rootDir = __dirname;
const testDir = path.join(rootDir, "tests", "e2e");
const ownerAuthFile = path.join(testDir, ".auth", "owner.json");
const superadminAuthFile = path.join(testDir, ".auth", "superadmin.json");

// CI: three Next.js dev servers start in parallel; allow 5 min
const webServerTimeout = process.env.CI ? 300000 : 120000;

/**
 * Monorepo E2E: public (3001), dashboard (3002), admin (3003).
 * Each app has its own webServer; projects use the matching baseURL.
 */
export default defineConfig({
  testDir,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    trace: "on-first-retry",
    headless: process.env.CI ? true : false,
  },

  projects: [
    // Setup: authenticate owner on dashboard (3002) and superadmin on admin (3003)
    {
      name: "setup-owner",
      testMatch: /auth\.owner\.setup\.ts/,
      use: {
        baseURL: "http://localhost:3002",
        ...devices["Desktop Chrome"],
      },
    },
    {
      name: "setup-superadmin",
      testMatch: /auth\.superadmin\.setup\.ts/,
      use: {
        baseURL: "http://localhost:3003",
        ...devices["Desktop Chrome"],
      },
    },

    // Public app (3001): landing, public booking – no auth
    {
      name: "public",
      testMatch: /landing\.spec\.ts|public-booking\.spec\.ts/,
      use: {
        baseURL: "http://localhost:3001",
        ...devices["Desktop Chrome"],
      },
    },

    // Dashboard (3002): settings, billing, booking flow, onboarding – owner auth
    {
      name: "authenticated",
      testMatch: /settings-.*\.spec\.ts|billing-flow\.spec\.ts|booking-flow\.spec\.ts|onboarding\.spec\.ts/,
      use: {
        baseURL: "http://localhost:3002",
        ...devices["Desktop Chrome"],
        storageState: ownerAuthFile,
      },
      dependencies: ["setup-owner"],
    },

    // Admin (3003): admin operations – superadmin auth
    {
      name: "admin",
      testMatch: /admin-.*\.spec\.ts/,
      use: {
        baseURL: "http://localhost:3003",
        ...devices["Desktop Chrome"],
        storageState: superadminAuthFile,
      },
      dependencies: ["setup-superadmin"],
    },
  ],

  webServer: [
    {
      command: "pnpm --filter @teqbook/public run dev",
      url: "http://localhost:3001",
      reuseExistingServer: !process.env.CI,
      timeout: webServerTimeout,
      env: {
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || "https://test.supabase.co",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "test-anon-key",
      },
    },
    {
      command: "pnpm --filter @teqbook/dashboard run dev",
      url: "http://localhost:3002",
      reuseExistingServer: !process.env.CI,
      timeout: webServerTimeout,
      env: {
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || "https://test.supabase.co",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "test-anon-key",
      },
    },
    {
      command: "pnpm --filter @teqbook/admin run dev",
      url: "http://localhost:3003",
      reuseExistingServer: !process.env.CI,
      timeout: webServerTimeout,
      env: {
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || "https://test.supabase.co",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "test-anon-key",
      },
    },
  ],
});
