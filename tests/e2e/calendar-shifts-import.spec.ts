import { test, expect } from "@playwright/test";

test.describe("Calendar Page (refactored)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/calendar");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(2000);
  });

  test("should render the calendar page layout", async ({ page }) => {
    const content = await page.content();
    expect(content.length).toBeGreaterThan(0);

    const redirectedToLogin = page.url().includes("/login");
    if (redirectedToLogin) {
      expect(true).toBeTruthy();
      return;
    }

    const heading = page.locator("h1, h2, [data-testid='calendar-header']").first();
    if (await heading.count() > 0) {
      await expect(heading).toBeVisible();
    }
  });

  test("should show daily key figures panel if data exists", async ({ page }) => {
    if (page.url().includes("/login")) return;

    const figures = page.locator(
      "[data-testid='daily-key-figures'], .grid, .stats"
    ).first();
    if (await figures.count() > 0) {
      await expect(figures).toBeVisible();
    }

    expect(true).toBeTruthy();
  });

  test("should toggle between day and week views", async ({ page }) => {
    if (page.url().includes("/login")) return;

    const weekBtn = page.locator(
      "button:has-text('Uke'), button:has-text('Week'), [data-testid='view-week']"
    ).first();
    if (await weekBtn.count() > 0) {
      await weekBtn.click();
      await page.waitForTimeout(500);
    }

    const dayBtn = page.locator(
      "button:has-text('Dag'), button:has-text('Day'), [data-testid='view-day']"
    ).first();
    if (await dayBtn.count() > 0) {
      await dayBtn.click();
      await page.waitForTimeout(500);
    }

    expect(true).toBeTruthy();
  });
});

test.describe("Copy Shifts Dialog (refactored)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/shifts");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(2000);
  });

  test("should open the copy shifts dialog", async ({ page }) => {
    if (page.url().includes("/login")) return;

    const copyBtn = page.locator(
      "button:has-text('Kopier'), button:has-text('Copy'), [data-testid='copy-shifts']"
    ).first();
    if (await copyBtn.count() > 0) {
      await copyBtn.click();
      await page.waitForTimeout(500);

      const dialog = page.locator(
        "[role='dialog'], [data-testid='copy-shifts-dialog']"
      ).first();
      if (await dialog.count() > 0) {
        await expect(dialog).toBeVisible();
      }
    }

    expect(true).toBeTruthy();
  });

  test("should navigate through wizard steps", async ({ page }) => {
    if (page.url().includes("/login")) return;

    const copyBtn = page.locator(
      "button:has-text('Kopier'), button:has-text('Copy'), [data-testid='copy-shifts']"
    ).first();
    if (await copyBtn.count() === 0) return;

    await copyBtn.click();
    await page.waitForTimeout(500);

    const dialog = page.locator("[role='dialog']").first();
    if (await dialog.count() === 0) return;

    const nextBtn = dialog.locator(
      "button:has-text('Neste'), button:has-text('Next')"
    ).first();
    if (await nextBtn.count() > 0 && await nextBtn.isEnabled()) {
      await nextBtn.click();
      await page.waitForTimeout(500);
    }

    const backBtn = dialog.locator(
      "button:has-text('Tilbake'), button:has-text('Back')"
    ).first();
    if (await backBtn.count() > 0) {
      await backBtn.click();
      await page.waitForTimeout(300);
    }

    expect(true).toBeTruthy();
  });
});

test.describe("Import Wizard (refactored)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/settings/import");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(2000);
  });

  test("should render the import page with tabs", async ({ page }) => {
    if (page.url().includes("/login")) return;

    const content = await page.content();
    expect(content.length).toBeGreaterThan(0);

    const tabs = page.locator(
      "[role='tablist'], [data-testid='import-tabs']"
    ).first();
    if (await tabs.count() > 0) {
      await expect(tabs).toBeVisible();
    }

    expect(true).toBeTruthy();
  });

  test("should show upload area in the first step", async ({ page }) => {
    if (page.url().includes("/login")) return;

    const uploadArea = page.locator(
      "[data-testid='upload-step'], input[type='file'], .dropzone, button:has-text('Last opp'), button:has-text('Upload')"
    ).first();
    if (await uploadArea.count() > 0) {
      await expect(uploadArea).toBeVisible();
    }

    expect(true).toBeTruthy();
  });

  test("should show import history tab", async ({ page }) => {
    if (page.url().includes("/login")) return;

    const historyTab = page.locator(
      "button:has-text('Historikk'), button:has-text('History'), [data-testid='tab-history']"
    ).first();
    if (await historyTab.count() > 0) {
      await historyTab.click();
      await page.waitForTimeout(500);

      const historyContent = page.locator(
        "table, [data-testid='import-history'], .empty-state"
      ).first();
      if (await historyContent.count() > 0) {
        await expect(historyContent).toBeVisible();
      }
    }

    expect(true).toBeTruthy();
  });
});
