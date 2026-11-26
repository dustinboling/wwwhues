import { expect, test, type Page } from '@playwright/test'

// P7b sponsor composition: phone renders the /m/sponsor order (packet
// hero with the pompon, snapshot note, opportunity packets, sign-off)
// while desktop keeps its Slice B/D composition. DOM assertions only
// (no screenshots): the active variant is pinned visible and in order
// by geometry, the inactive one pinned hidden. Only static page chrome
// is asserted — items and paver sizes arrive from the live snapshot.

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

test.describe('sponsor composition', () => {
  test('phone renders the /m order with the desktop variant hidden', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'phone composition only')
    await page.goto('/sponsor')
    await stabilize(page)
    const phone = page.locator('.spon-m')
    await expect(phone).toBeVisible()
    await expect(page.locator('.spon-d')).toBeHidden()

    // Hero packet: eyebrow, h1, intro, art plate, pompon spot art.
    const hero = phone.locator('.spon-hero')
    await expect(hero).toBeVisible()
    await expect(hero.locator('.spon-eyebrow')).toContainText('Sponsor')
    await expect(hero.getByRole('heading', { level: 1 })).toContainText('Sponsor a piece of the park')
    await expect(hero.locator('.spon-intro')).toContainText('your gift goes straight into the ground')
    await expect(
      hero.getByRole('img', { name: 'Watercolor of the dahlia beds at Hues' }),
    ).toBeVisible()
    await expect(hero.locator('.hues-spot-art')).toHaveCount(1)

    // Snapshot honesty note, then the opportunity packets in
    // production order: sponsorships, pavers, coming-soon.
    await expect(phone.locator('.c-snapshot')).toContainText('Sponsorship snapshot from')
    const list = phone.locator('.spon-list')
    await expect(list).toBeVisible()
    const paver = list.locator('.spon-item', { hasText: 'Pathway Pavers' })
    await expect(paver.locator('.spon-itemtitle')).toContainText('Pathway Pavers')
    await expect(paver.locator('.spon-itembody')).toContainText('one stone at a time')
    await expect(paver.locator('.spon-pavertop .hues-spot-art')).toHaveCount(1)

    // Geometric order: hero → snapshot → list → sign-off.
    expect(await topOf(page, '.spon-m .spon-hero')).toBeLessThan(await topOf(page, '.spon-m .c-snapshot'))
    expect(await topOf(page, '.spon-m .c-snapshot')).toBeLessThan(await topOf(page, '.spon-m .spon-list'))
    expect(await topOf(page, '.spon-m .spon-list')).toBeLessThan(await topOf(page, '.spon-m .spon-signoff'))

    // Sign-off, as printed on the /m page.
    await expect(phone.locator('.spon-signoff')).toContainText('Hues Floral Park, A little world apart.')
  })

  test('desktop keeps its composition with the phone variant hidden', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'desktop composition only')
    await page.goto('/sponsor')
    await stabilize(page)
    await expect(page.locator('.spon-m')).toBeHidden()
    const desktop = page.locator('.spon-d')
    await expect(desktop).toBeVisible()
    // The desktop title renders the same words one level down: the
    // phone hero carries the page h1 and the prerender contract is
    // one h1 per page.
    await expect(desktop.locator('h2.c-title')).toContainText('Sponsor a piece of the park')
    await expect(desktop.locator('.c-snapshot')).toContainText('Sponsorship snapshot from')
    await expect(desktop.locator('.c-signoff')).toContainText('Hues Floral Park, A little world apart.')
  })
})
