import { test as setup } from "@playwright/test";
import path from "path";

const superadminAuthFile = path.join(__dirname, ".auth", "superadmin.json");

const E2E_SUPERADMIN_EMAIL = "e2e-superadmin@teqbook.test";
const E2E_SUPERADMIN_PASSWORD = "E2ETestPassword123!";

setup("authenticate as superadmin", async ({ page }) => {
  await page.goto("/login");
  await page.waitForLoadState("networkidle");

  const emailInput = page.locator('input[name="email"], input[type="email"]').first();
  const passwordInput = page.locator('input[name="password"], input[type="password"]').first();
  await emailInput.fill(E2E_SUPERADMIN_EMAIL);
  await passwordInput.fill(E2E_SUPERADMIN_PASSWORD);

  const submitButton = page.locator('button[type="submit"]').first();
  await submitButton.click();

  await page.waitForURL(/\/admin/, { timeout: 15000 }).catch(() => {
    console.log("Superadmin login - current URL:", page.url());
  });

  await page.context().storageState({ path: superadminAuthFile });
});
