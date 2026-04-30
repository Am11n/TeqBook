import { test, expect } from "@playwright/test";

test.describe("Public Booking Flow", () => {
  test("@critical public API health returns JSON (backend regression guard)", async ({ request }) => {
    const res = await request.get("/api/health");
    const ct = res.headers()["content-type"] ?? "";
    expect(ct).toMatch(/application\/json/i);
    expect(res.ok()).toBeTruthy();
    const body = (await res.json()) as { ok?: boolean; app?: string };
    expect(body.ok).toBe(true);
    expect(body.app).toBe("public");
  });

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

  test("@critical creates booking and reaches confirmation (backend side-effect)", async ({ page }) => {
    await page.goto("/book/test-salon");
    await expect(page).toHaveURL(/.*book\/test-salon/);

    const serviceOptions = page.locator("#service-section button[role='radio']");
    await expect(serviceOptions.first()).toBeVisible({ timeout: 15_000 });
    await serviceOptions.first().click();

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateString = tomorrow.toISOString().split("T")[0];
    await page.locator("#date").fill(dateString);

    const slotOptions = page.locator("#book-mode-panel button[role='radio']");
    await expect(slotOptions.first()).toBeVisible({ timeout: 20_000 });
    await slotOptions.first().click();

    await page.locator("#customer_name").fill("E2E Customer");
    await page.locator("#customer_email").fill("e2e-booking@example.com");
    await page.locator("#public-booking-details-form button[type='submit']").click();

    await expect(page).toHaveURL(/\/book\/test-salon\/confirmation\?bookingId=/, { timeout: 25_000 });
    await expect(page.locator("body")).toContainText(/verify your email|booking confirmed/i);
  });
});

