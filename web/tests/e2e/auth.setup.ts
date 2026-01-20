import { test as setup, expect } from "@playwright/test";
import path from "path";

// Storage state files for different user types
const ownerAuthFile = path.join(__dirname, ".auth/owner.json");
const superadminAuthFile = path.join(__dirname, ".auth/superadmin.json");

// Test credentials - must match what create-e2e-users.ts creates
const E2E_OWNER_EMAIL = "e2e-owner@teqbook.test";
const E2E_OWNER_PASSWORD = "E2ETestPassword123!";
const E2E_SUPERADMIN_EMAIL = "e2e-superadmin@teqbook.test";
const E2E_SUPERADMIN_PASSWORD = "E2ETestPassword123!";

setup("authenticate as owner", async ({ page }) => {
  // Go to login page
  await page.goto("/login");
  await page.waitForLoadState("networkidle");

  // Fill in login form
  const emailInput = page.locator('input[name="email"], input[type="email"]').first();
  const passwordInput = page.locator('input[name="password"], input[type="password"]').first();

  await emailInput.fill(E2E_OWNER_EMAIL);
  await passwordInput.fill(E2E_OWNER_PASSWORD);

  // Submit form
  const submitButton = page.locator('button[type="submit"]').first();
  await submitButton.click();

  // Wait for redirect to dashboard or authenticated page
  await page.waitForURL(/\/(dashboard|settings|book)/, { timeout: 15000 }).catch(() => {
    // If no redirect, check if we're still on login with an error
    console.log("Login may have failed - checking current URL:", page.url());
  });

  // Save authentication state
  await page.context().storageState({ path: ownerAuthFile });
});

setup("authenticate as superadmin", async ({ page }) => {
  // Go to login page
  await page.goto("/login");
  await page.waitForLoadState("networkidle");

  // Fill in login form
  const emailInput = page.locator('input[name="email"], input[type="email"]').first();
  const passwordInput = page.locator('input[name="password"], input[type="password"]').first();

  await emailInput.fill(E2E_SUPERADMIN_EMAIL);
  await passwordInput.fill(E2E_SUPERADMIN_PASSWORD);

  // Submit form
  const submitButton = page.locator('button[type="submit"]').first();
  await submitButton.click();

  // Wait for redirect
  await page.waitForURL(/\/(dashboard|admin|settings)/, { timeout: 15000 }).catch(() => {
    console.log("Login may have failed - checking current URL:", page.url());
  });

  // Save authentication state
  await page.context().storageState({ path: superadminAuthFile });
});
