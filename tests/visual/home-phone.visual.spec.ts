import { expect, test, type Page } from '@playwright/test'

// Slice H home opening: phone follows the live /m page (masthead →
// Procession figure → season status), desktop keeps the H1 hero block.
// DOM assertions only (no screenshots): the active opening is pinned
// visible and in order by geometry, the inactive one pinned hidden.

async function stabilize(page: Page): Promise<void> {
  await page.evaluate(() => document.fonts.ready.then(() => undefined))
  await page.waitForLoadState('networkidle').catch(() => undefined)
}

test.beforeEach(async ({ page }) => {
  // Layout comes from aspect-ratio slots; media bytes never arrive.
  await page.route('https://media.hues.flowers/**', (route) => route.abort())
})

async function topOf(page: Page, selector: string): Promise<number> {
  const box = await page.locator(selector).first().boundingBox()
  expect(box).not.toBeNull()
  return box?.y ?? -1
}

test.describe('home opening', () => {
  test('phone renders the /m opening in order', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'phone composition only')
    await page.goto('/')
    await stabilize(page)
    const masthead = page.locator('.home-masthead')
    const procession = page.locator('.home-procession')
    const status = page.locator('.home-status')
    await expect(masthead).toBeVisible()
    await expect(procession).toBeVisible()
    await expect(status).toBeVisible()
    expect(await topOf(page, '.home-masthead')).toBeLessThan(await topOf(page, '.home-procession'))
    expect(await topOf(page, '.home-procession')).toBeLessThan(await topOf(page, '.home-status'))
    // The desktop H1 hero block stays out of the phone presentation.
    await expect(page.locator('.home-hero')).toBeHidden()
    // Masthead content, as printed on the /m page.
    await expect(masthead.getByRole('heading', { level: 1 })).toContainText('Floral Park')
    await expect(page.locator('.home-masthead__tagline')).toContainText('a little world apart')
    await expect(page.locator('.home-procession__caption')).toContainText(
      'The Procession · Hues Floral Park',
    )
  })

  test('desktop keeps the H1 hero and no masthead', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'desktop composition only')
    await page.goto('/')
    await stabilize(page)
    await expect(page.locator('.home-masthead')).toBeHidden()
    await expect(page.locator('.home-procession')).toBeHidden()
    const hero = page.locator('.home-hero')
    await expect(hero).toBeVisible()
    await expect(hero.getByRole('heading', { level: 1 })).toContainText(
      'A U-Pick Flower Farm Near Eugene, Oregon',
    )
  })

  test('phone header carries the script logo and the paper plan pill', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'phone header only')
    await page.goto('/')
    await stabilize(page)
    // Script "hues" artwork, drawn in ink — not the serif wordmark.
    await expect(page.locator('.hues-topbar__logo svg')).toBeVisible()
    await expect(page.locator('.hues-topbar .hues-wordmark')).toHaveCount(0)
    // Paper-white text on the deep-green pill, matching live /m.
    const planColor = await page
      .locator('.hues-topbar__plan')
      .evaluate((el) => getComputedStyle(el).color)
    expect(planColor).toBe('rgb(247, 241, 222)')
  })

  test('desktop header carries the script lockup', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'desktop header only')
    await page.goto('/')
    await stabilize(page)
    // Script "hues" artwork with the FLORAL PARK overline and the italic
    // tagline — the interim serif wordmark is gone.
    await expect(page.locator('.hues-site-header__logo svg')).toBeVisible()
    await expect(page.locator('.hues-site-header .hues-wordmark')).toHaveCount(0)
    await expect(page.locator('.hues-site-header__lockup-overline')).toContainText(
      'Floral Park',
    )
    await expect(page.locator('.hues-site-header__lockup-tagline')).toContainText(
      'a little world apart',
    )
  })
})
