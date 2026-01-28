import { test, expect } from "@playwright/test";

test.describe("Landing Page", () => {
  test("should load landing page", async ({ page }) => {
    await page.goto("/");
    
    // Check that the page loads
    await expect(page).toHaveTitle(/TeqBook/i);
  });

  test("should navigate to login", async ({ page }) => {
    await page.goto("/");
    
    // Find and click login link/button
    const loginLink = page.getByRole("link", { name: /login|sign in/i });
    if (await loginLink.isVisible()) {
      await loginLink.click();
      await expect(page).toHaveURL(/.*login/);
    }
  });
});

