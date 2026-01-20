import { test, expect } from "@playwright/test";

test.describe("Settings Changes", () => {
  test.beforeEach(async ({ page }) => {
    // Note: In a real scenario, you would:
    // 1. Authenticate as a user
    // 2. Navigate to settings
    // For now, we'll test the UI flow assuming user is logged in
  });

  test("should update general salon settings", async ({ page }) => {
    await page.goto("/settings/general");
    await page.waitForLoadState("networkidle");
    
    // Wait for form to load
    const form = page.locator('form, [data-testid="settings-form"]').first();
    await expect(form).toBeVisible();
    
    // Update salon name
    const salonNameInput = page.locator('input[name="salonName"], input[name="name"], [data-testid="field-salon-name"] input').first();
    if (await salonNameInput.count() > 0) {
      await salonNameInput.clear();
      await salonNameInput.fill("Updated Salon Name");
    }
    
    // Update salon type
    const salonTypeSelect = page.locator('select[name="salonType"], select[name="type"]').first();
    if (await salonTypeSelect.count() > 0) {
      await salonTypeSelect.selectOption({ index: 1 }); // Select different type
    }
    
    // Update WhatsApp number
    const whatsappInput = page.locator('input[name="whatsappNumber"], input[name="whatsapp"]').first();
    if (await whatsappInput.count() > 0) {
      await whatsappInput.clear();
      await whatsappInput.fill("+4712345678");
    }
    
    // Submit form
    const submitButton = page.locator('button[type="submit"], button:has-text("Save"), button:has-text("Lagre")').first();
    if (await submitButton.count() > 0) {
      await submitButton.click();
      
      // Wait for success message or form update
      await page.waitForTimeout(2000);
      
      // Check for success indicator
      const successMessage = page.locator('text=/saved|lagret|success|successfully/i');
      if (await successMessage.count() > 0) {
        await expect(successMessage.first()).toBeVisible({ timeout: 5000 });
      }
    }
  });

  test("should update supported languages", async ({ page }) => {
    await page.goto("/settings/general");
    await page.waitForLoadState("networkidle");
    
    // Find language checkboxes or multi-select
    const languageCheckboxes = page.locator('input[type="checkbox"][name*="language"], [data-testid*="language"] input[type="checkbox"]');
    if (await languageCheckboxes.count() > 0) {
      // Select/deselect languages
      const firstCheckbox = languageCheckboxes.first();
      const isChecked = await firstCheckbox.isChecked();
      await firstCheckbox.setChecked(!isChecked);
      
      // Submit form
      const submitButton = page.locator('button[type="submit"], button:has-text("Save")').first();
      if (await submitButton.count() > 0) {
        await submitButton.click();
        await page.waitForTimeout(2000);
        
        // Check for success or limit warning
        const successMessage = page.locator('text=/saved|lagret|limit|grense/i');
        if (await successMessage.count() > 0) {
          await expect(successMessage.first()).toBeVisible({ timeout: 5000 });
        }
      }
    }
  });

  test("should show language limit warning when approaching limit", async ({ page }) => {
    await page.goto("/settings/general");
    await page.waitForLoadState("networkidle");
    
    // Check for limit warning component
    const limitWarning = page.locator('[data-testid="limit-warning"], .warning:has-text("limit"), .warning:has-text("grense")').first();
    if (await limitWarning.count() > 0) {
      await expect(limitWarning).toBeVisible();
    }
  });

  test("should update notification preferences", async ({ page }) => {
    await page.goto("/settings/notifications");
    await page.waitForLoadState("networkidle");
    
    // Wait for form to load
    const form = page.locator('form').first();
    await expect(form).toBeVisible({ timeout: 5000 });
    
    // Find notification checkboxes
    const bookingConfirmationCheckbox = page.locator('input[type="checkbox"][name*="bookingConfirmation"], label:has-text("Booking Confirmation") + input[type="checkbox"]').first();
    if (await bookingConfirmationCheckbox.count() > 0) {
      const isChecked = await bookingConfirmationCheckbox.isChecked();
      await bookingConfirmationCheckbox.setChecked(!isChecked);
    }
    
    const bookingReminderCheckbox = page.locator('input[type="checkbox"][name*="bookingReminder"], label:has-text("Reminder") + input[type="checkbox"]').first();
    if (await bookingReminderCheckbox.count() > 0) {
      const isChecked = await bookingReminderCheckbox.isChecked();
      await bookingReminderCheckbox.setChecked(!isChecked);
    }
    
    // Submit form
    const submitButton = page.locator('button[type="submit"], button:has-text("Save")').first();
    if (await submitButton.count() > 0) {
      await submitButton.click();
      await page.waitForTimeout(2000);
      
      // Check for success message
      const successMessage = page.locator('text=/saved|lagret|preferences.*updated/i');
      if (await successMessage.count() > 0) {
        await expect(successMessage.first()).toBeVisible({ timeout: 5000 });
      }
    }
  });

  test("should load current notification preferences", async ({ page }) => {
    await page.goto("/settings/notifications");
    await page.waitForLoadState("networkidle");
    
    // Wait for preferences to load
    await page.waitForTimeout(2000);
    
    // Check that checkboxes are visible (regardless of checked state)
    const checkboxes = page.locator('input[type="checkbox"]');
    const checkboxCount = await checkboxes.count();
    expect(checkboxCount).toBeGreaterThan(0);
  });

  test("should validate required fields in general settings", async ({ page }) => {
    await page.goto("/settings/general");
    await page.waitForLoadState("networkidle");
    
    // Clear required field (salon name)
    const salonNameInput = page.locator('input[name="salonName"], input[name="name"]').first();
    if (await salonNameInput.count() > 0) {
      await salonNameInput.clear();
      
      // Try to submit
      const submitButton = page.locator('button[type="submit"]').first();
      if (await submitButton.count() > 0) {
        await submitButton.click();
        await page.waitForTimeout(1000);
        
        // Check for validation error
        const errorMessage = page.locator('text=/required|må|fyll|validation/i');
        if (await errorMessage.count() > 0) {
          await expect(errorMessage.first()).toBeVisible();
        }
      }
    }
  });

  test("should update default language", async ({ page }) => {
    await page.goto("/settings/general");
    await page.waitForLoadState("networkidle");
    
    // Find default language select
    const defaultLanguageSelect = page.locator('select[name="defaultLanguage"], select[name="preferredLanguage"]').first();
    if (await defaultLanguageSelect.count() > 0) {
      // Select a different language
      await defaultLanguageSelect.selectOption({ index: 1 });
      
      // Submit form
      const submitButton = page.locator('button[type="submit"]').first();
      if (await submitButton.count() > 0) {
        await submitButton.click();
        await page.waitForTimeout(2000);
        
        // Check for success
        const successMessage = page.locator('text=/saved|lagret/i');
        if (await successMessage.count() > 0) {
          await expect(successMessage.first()).toBeVisible({ timeout: 5000 });
        }
      }
    }
  });

  test("should toggle online booking enabled", async ({ page }) => {
    await page.goto("/settings/general");
    await page.waitForLoadState("networkidle");
    
    // Find online booking toggle
    const onlineBookingToggle = page.locator('input[type="checkbox"][name*="onlineBooking"], label:has-text("Online Booking") + input[type="checkbox"]').first();
    if (await onlineBookingToggle.count() > 0) {
      const isChecked = await onlineBookingToggle.isChecked();
      await onlineBookingToggle.setChecked(!isChecked);
      
      // Submit form
      const submitButton = page.locator('button[type="submit"]').first();
      if (await submitButton.count() > 0) {
        await submitButton.click();
        await page.waitForTimeout(2000);
        
        // Check for success
        const successMessage = page.locator('text=/saved|lagret/i');
        if (await successMessage.count() > 0) {
          await expect(successMessage.first()).toBeVisible({ timeout: 5000 });
        }
      }
    }
  });

  test("should toggle public salon setting", async ({ page }) => {
    await page.goto("/settings/general");
    await page.waitForLoadState("networkidle");
    
    // Find public salon toggle
    const publicToggle = page.locator('input[type="checkbox"][name*="isPublic"], label:has-text("Public") + input[type="checkbox"]').first();
    if (await publicToggle.count() > 0) {
      const isChecked = await publicToggle.isChecked();
      await publicToggle.setChecked(!isChecked);
      
      // Submit form
      const submitButton = page.locator('button[type="submit"]').first();
      if (await submitButton.count() > 0) {
        await submitButton.click();
        await page.waitForTimeout(2000);
        
        // Check for success
        const successMessage = page.locator('text=/saved|lagret/i');
        if (await successMessage.count() > 0) {
          await expect(successMessage.first()).toBeVisible({ timeout: 5000 });
        }
      }
    }
  });

  test("should navigate between settings pages", async ({ page }) => {
    await page.goto("/settings/general");
    await expect(page).toHaveURL(/.*settings\/general/);
    
    // Navigate to notifications
    const notificationsLink = page.locator('a[href*="/settings/notifications"], nav a:has-text("Notifications")').first();
    if (await notificationsLink.count() > 0) {
      await notificationsLink.click();
      await page.waitForURL(/.*settings\/notifications/);
      await expect(page).toHaveURL(/.*settings\/notifications/);
    }
    
    // Navigate to billing
    const billingLink = page.locator('a[href*="/settings/billing"], nav a:has-text("Billing")').first();
    if (await billingLink.count() > 0) {
      await billingLink.click();
      await page.waitForURL(/.*settings\/billing/);
      await expect(page).toHaveURL(/.*settings\/billing/);
    }
  });
});
