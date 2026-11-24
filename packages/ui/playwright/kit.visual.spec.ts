import { expect, test } from '@playwright/test';

/**
 * Kit screenshot baselines: TabBar, header, MiniPlayer, and field-kit
 * states at 390x844 mobile / 1280x900 desktop. Locator shots pin the
 * components; full-page shots pin their shell placement.
 */
test.describe('kit baselines', () => {
  test('tab bar', async ({ page }) => {
    await page.goto('/harness/tabbar');
    await expect(page.locator('.hues-tabbar')).toHaveScreenshot('tabbar.png');
  });

  test('header', async ({ page }) => {
    await page.goto('/harness/header');
    await expect(page.locator('.hues-site-header')).toHaveScreenshot('header.png');
  });

  test('mini player', async ({ page }) => {
    await page.goto('/harness/miniplayer');
    await expect(page.locator('.hues-player')).toHaveScreenshot('miniplayer.png');
  });

  test('field kit at rest', async ({ page }) => {
    await page.goto('/harness/fields');
    await expect(page.locator('.hues-shell__main')).toHaveScreenshot('fields-rest.png');
  });

  test('field kit focus ring', async ({ page }) => {
    await page.goto('/harness/fields');
    await page.locator('#f-name').focus();
    await expect(page.locator('.hues-shell__main')).toHaveScreenshot('fields-focus.png');
  });
});
