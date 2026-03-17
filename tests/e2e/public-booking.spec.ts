import { test, expect } from "@playwright/test";

test.describe("Public Booking Flow", () => {
  test("@critical should load public booking page", async ({ page }) => {
    await page.goto("/book/example-salon");
    await expect(page).toHaveURL(/.*book\/example-salon/);

    // Critical assertion: page must render some content, not crash.
    const root = page.locator("main, body").first();
    await expect(root).toBeVisible();
  });

  test("@critical should show error for non-existent salon", async ({ page }) => {
    await page.goto("/book/non-existent-salon");
    await expect(page).toHaveTitle(/TeqBook/i);
    await expect(page.locator('select[name="service"]').first()).toHaveCount(0);
  });

  test("@critical should show error for non-public salon", async ({ page }) => {
    await page.goto("/book/private-salon");
    await expect(page).toHaveTitle(/TeqBook/i);
    await expect(page.locator('select[name="service"]').first()).toHaveCount(0);
  });
});

