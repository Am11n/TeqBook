import { test, expect } from "@playwright/test";

test.describe("Settings Form Layout", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to settings page
    // Note: This test assumes user is logged in
    // In a real scenario, you would set up authentication first
    await page.goto("/settings/general");
  });

  test("should have consistent form layout and spacing", async ({ page }) => {
    // Wait for form to load
    const form = page.getByTestId("settings-form");
    await expect(form).toBeVisible();

    // Check that form uses space-y-6 for field spacing
    const formClasses = await form.getAttribute("class");
    expect(formClasses).toContain("space-y-6");

    // Check that all fields use Field component structure
    const salonNameField = page.getByTestId("field-salon-name");
    await expect(salonNameField).toBeVisible();

    const salonTypeField = page.getByTestId("field-salon-type");
    await expect(salonTypeField).toBeVisible();

    // Verify labels are above inputs (not inline)
    const salonNameLabel = salonNameField.locator("label");
    await expect(salonNameLabel).toBeVisible();

    // Check that label and input are in a flex-col layout (stacked)
    const fieldClasses = await salonNameField.getAttribute("class");
    expect(fieldClasses).toContain("flex-col");
    expect(fieldClasses).toContain("gap-2");
  });

  test("should have correct spacing tokens", async ({ page }) => {
    const form = page.getByTestId("settings-form");
    await expect(form).toBeVisible();

    // Check form container spacing
    const formClasses = await form.getAttribute("class");
    expect(formClasses).toContain("space-y-6"); // Field → Field spacing: 24px

    // Check field internal spacing
    const salonNameField = page.getByTestId("field-salon-name");
    const fieldClasses = await salonNameField.getAttribute("class");
    expect(fieldClasses).toContain("gap-2"); // Label → Input spacing: 8px
  });

  test("should display help text with correct spacing", async ({ page }) => {
    // Check that help text exists and has correct spacing
    const form = page.getByTestId("settings-form");
    const whatsappLabel = form.locator('label[for="whatsappNumber"]');
    await expect(whatsappLabel).toBeVisible();
    
    // Find help text near the whatsapp field
    const helpText = form.locator('p.text-xs.text-muted-foreground').filter({ hasText: /country code/i });
    
    await expect(helpText).toBeVisible();
    
    // Check that help text has pt-1 spacing
    const helpTextClasses = await helpText.getAttribute("class");
    expect(helpTextClasses).toContain("pt-1"); // Input → Help text spacing: 4px
  });

  test("should take screenshot for visual regression testing", async ({ page }) => {
    const form = page.getByTestId("settings-form");
    await expect(form).toBeVisible();

    // Take screenshot of the form
    // This will fail if layout/spacing changes
    await expect(form).toHaveScreenshot("settings-form-layout.png", {
      maxDiffPixels: 100, // Allow small differences
    });
  });
});

