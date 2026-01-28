import { test as setup } from "@playwright/test";
import path from "path";

const ownerAuthFile = path.join(__dirname, ".auth", "owner.json");

const E2E_OWNER_EMAIL = "e2e-owner@teqbook.test";
const E2E_OWNER_PASSWORD = "E2ETestPassword123!";

setup("authenticate as owner", async ({ page }) => {
  await page.goto("/login");
  await page.waitForLoadState("networkidle");

  const emailInput = page.locator('input[name="email"], input[type="email"]').first();
  const passwordInput = page.locator('input[name="password"], input[type="password"]').first();
  await emailInput.fill(E2E_OWNER_EMAIL);
  await passwordInput.fill(E2E_OWNER_PASSWORD);

  const submitButton = page.locator('button[type="submit"]').first();
  await submitButton.click();

  await page.waitForURL(/\/(dashboard|onboarding|settings)/, { timeout: 15000 }).catch(() => {
    console.log("Owner login - current URL:", page.url());
  });

  await page.context().storageState({ path: ownerAuthFile });
});
