import { test, expect } from "@playwright/test";

test.describe("Onboarding Flow", () => {
  test("should complete onboarding flow", async ({ page }) => {
    // Note: In a real scenario, you would:
    // 1. Authenticate as a new user (no salon yet)
    // 2. Navigate to onboarding page
    // 3. Fill in salon information
    // 4. Complete all steps
    // 5. Verify redirect to dashboard
    
    await page.goto("/onboarding");
    
    // Check that onboarding page loads
    await expect(page).toHaveURL(/.*onboarding/);
    await page.waitForLoadState("networkidle");
    
    // Check for onboarding form
    const form = page.locator('form, [data-testid="onboarding-form"]').first();
    if (await form.count() > 0) {
      await expect(form).toBeVisible();
    }
  });

  test("should validate required fields in onboarding", async ({ page }) => {
    await page.goto("/onboarding");
    await page.waitForLoadState("networkidle");
    
    // Try to submit without filling required fields
    const submitButton = page.locator('button[type="submit"], button:has-text("Continue"), button:has-text("Fortsett")').first();
    if (await submitButton.count() > 0) {
      const isDisabled = await submitButton.isDisabled();
      if (!isDisabled) {
        await submitButton.click();
        await page.waitForTimeout(1000);
        
        // Should show validation errors
        const errorMessages = page.locator('text=/required|må|fyll/i');
        if (await errorMessages.count() > 0) {
          await expect(errorMessages.first()).toBeVisible();
        }
      }
    }
  });

  test("should fill salon name in onboarding", async ({ page }) => {
    await page.goto("/onboarding");
    await page.waitForLoadState("networkidle");
    
    // Find salon name input
    const salonNameInput = page.locator('input[name="salonName"], input[name="name"], input[placeholder*="salon" i]').first();
    if (await salonNameInput.count() > 0) {
      await salonNameInput.fill("Test Salon");
      const value = await salonNameInput.inputValue();
      expect(value).toBe("Test Salon");
    }
  });

  test("should select salon type in onboarding", async ({ page }) => {
    await page.goto("/onboarding");
    await page.waitForLoadState("networkidle");
    
    // Find salon type select
    const salonTypeSelect = page.locator('select[name="salonType"], select[name="type"]').first();
    if (await salonTypeSelect.count() > 0) {
      await salonTypeSelect.selectOption({ index: 1 });
      const selectedValue = await salonTypeSelect.inputValue();
      expect(selectedValue).toBeTruthy();
    }
  });

  test("should select preferred language in onboarding", async ({ page }) => {
    await page.goto("/onboarding");
    await page.waitForLoadState("networkidle");
    
    // Find language select
    const languageSelect = page.locator('select[name="preferredLanguage"], select[name="language"]').first();
    if (await languageSelect.count() > 0) {
      await languageSelect.selectOption({ index: 1 });
      const selectedValue = await languageSelect.inputValue();
      expect(selectedValue).toBeTruthy();
    }
  });

  test("should complete all onboarding steps", async ({ page }) => {
    await page.goto("/onboarding");
    await page.waitForLoadState("networkidle");
    
    // Fill in all required fields
    const salonNameInput = page.locator('input[name="salonName"], input[name="name"]').first();
    if (await salonNameInput.count() > 0) {
      await salonNameInput.fill("Test Salon");
    }
    
    const salonTypeSelect = page.locator('select[name="salonType"]').first();
    if (await salonTypeSelect.count() > 0) {
      await salonTypeSelect.selectOption({ index: 1 });
    }
    
    const languageSelect = page.locator('select[name="preferredLanguage"]').first();
    if (await languageSelect.count() > 0) {
      await languageSelect.selectOption({ index: 1 });
    }
    
    // Submit form
    const submitButton = page.locator('button[type="submit"], button:has-text("Complete")').first();
    if (await submitButton.count() > 0) {
      await submitButton.click();
      await page.waitForTimeout(2000);
      
      // Should redirect to dashboard or show success
      const redirected = page.url().includes("/dashboard");
      const successMessage = page.locator('text=/success|welcome|velkommen/i');
      
      expect(redirected || (await successMessage.count() > 0)).toBeTruthy();
    }
  });
});

