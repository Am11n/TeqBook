import { defineConfig, devices } from "@playwright/test";
import path from "path";

// Storage state files for authenticated sessions
const ownerAuthFile = path.join(__dirname, "tests/e2e/.auth/owner.json");
const superadminAuthFile = path.join(__dirname, "tests/e2e/.auth/superadmin.json");

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: "./tests/e2e",
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: "html",
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: "http://localhost:3000",
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",
    /* Use headed mode to avoid headless shell issues on M1 Macs */
    headless: false,
  },

  /* Configure projects for major browsers */
  projects: [
    // Setup project - authenticates users and saves state
    {
      name: "setup",
      testMatch: /auth\.setup\.ts/,
    },

    // Tests that don't require authentication (public pages)
    {
      name: "public",
      testMatch: /landing\.spec\.ts|public-booking\.spec\.ts/,
      use: { 
        ...devices["Desktop Chrome"],
        channel: "chromium",
      },
    },

    // Tests that require owner authentication (settings, billing, booking)
    {
      name: "authenticated",
      testMatch: /settings-.*\.spec\.ts|billing-flow\.spec\.ts|booking-flow\.spec\.ts|onboarding\.spec\.ts/,
      use: {
        ...devices["Desktop Chrome"],
        storageState: ownerAuthFile,
      },
      dependencies: ["setup"],
    },

    // Tests that require superadmin authentication
    {
      name: "admin",
      testMatch: /admin-.*\.spec\.ts/,
      use: {
        ...devices["Desktop Chrome"],
        storageState: superadminAuthFile,
      },
      dependencies: ["setup"],
    },

    // Default chromium project for any tests not matched above
    {
      name: "chromium",
      testIgnore: /auth\.setup\.ts|landing\.spec\.ts|public-booking\.spec\.ts|settings-.*\.spec\.ts|billing-flow\.spec\.ts|booking-flow\.spec\.ts|onboarding\.spec\.ts|admin-.*\.spec\.ts/,
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
    env: {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || "https://test.supabase.co",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "test-anon-key",
    },
  },
});

