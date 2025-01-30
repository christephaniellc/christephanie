import { expect, test } from '@playwright/test';

test.describe('test hotkeys', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  describe('using hotkey "Alt+T" switches theme', async ({ page }) => {
    await page.keyboard.press('Alt+T');

    await expect(page.getByTestId('theme-light')).toBeVisible();
  });

  describe('using hotkey "Alt+S" opens sidebar', async ({ page }) => {
    await page.keyboard.press('Alt+S');

    await expect(page.getByTestId('sidebar')).toBeVisible();
  });

  describe('using hotkey "Alt+K" opens hotkeys dialog', async ({ page }) => {
    await page.keyboard.press('Alt+K');

    await expect(page.getByTestId('hotkeys-dialog')).toBeVisible();
  });
});
