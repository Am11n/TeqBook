import { test, expect } from "@playwright/test";

test.describe("Landing Page", () => {
  test("@critical should load landing page", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/TeqBook/i);
  });

  test("@critical should navigate to login", async ({ page }) => {
    await page.goto("/login");
    await expect(page).toHaveURL(/.*login/);

    const emailField = page.locator('input[name="email"], input[type="email"]').first();
    await expect(emailField).toBeVisible();
  });
});

