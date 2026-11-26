import { expect, test, type Page } from '@playwright/test'

// P8 dahlias composition: the phone renders the /m/dahlias order —
// tall photo hero, stats, the collection with production tiles and
// letter nav, the arcade game card — keeping the staging search +
// photo filters above the grid, while desktop keeps its Slice B
// composition. DOM assertions only (no screenshots): the active
// variant is pinned visible and in order by geometry, the inactive
// one pinned hidden.

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

test.describe('dahlias composition', () => {
  test('phone renders the /m order with the desktop variant hidden', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'phone composition only')
    await page.goto('/dahlias')
    await stabilize(page)
    const phone = page.locator('.dahl-m')
    await expect(phone).toBeVisible()
    await expect(page.locator('.dahl-d')).toBeHidden()

    // Tall photo hero: eyebrow, h1, counted lede (Q2).
    const hero = phone.locator('.hues-phone-hero--tall')
    await expect(hero).toBeVisible()
    await expect(hero.locator('.hues-phone-hero__eyebrow')).toContainText('Dusty’s dahlias')
    await expect(hero.getByRole('heading', { level: 1 })).toContainText('The heart of Hues')
    await expect(hero.locator('.hues-phone-hero__intro')).toContainText('111 dahlia varieties')

    // Stats, intro, collection head with the counted line.
    await expect(phone.locator('.dahl-m__stat')).toHaveCount(3)
    await expect(phone.locator('.dahl-m__big').first()).toContainText('111')
    await expect(phone.locator('.dahl-m__intro')).toContainText('tight little pompoms')
    await expect(phone.locator('#m-collection')).toContainText('The collection, A–Z')
    await expect(phone.locator('.dahl-m__count')).toContainText('All 111 varieties in the beds')

    // The filter surface stays above the grid at both widths.
    const filters = phone.locator('.dahl-m__filters form[role="search"]')
    await expect(filters).toBeVisible()
    await expect(filters.locator('input[type="search"]')).toHaveCount(1)
    await expect(filters.getByRole('radio', { name: 'With photos' })).toHaveCount(1)

    // Letter nav with the phone-prefixed anchors.
    const letters = phone.locator('.dahl-m__letters')
    await expect(letters).toBeVisible()
    await expect(letters.locator('.dahl-m__chip').first()).toHaveAttribute(
      'href',
      '#m-letter-A',
    )

    // All 111 cultivars as production tiles: photo tiles carry the
    // name once with no link; the 76 compact no-photo plates carry
    // the pompon, the name, and the "See photos" link.
    await expect(phone.locator('.dahl-m__tile')).toHaveCount(111)
    await expect(phone.locator('.dahl-m__nophoto')).toHaveCount(76)
    const breakOut = phone.locator('.dahl-m__tile', { hasText: 'Break Out' }).first()
    await expect(
      breakOut.getByRole('img', { name: 'Break Out dahlia in bloom at Hues Floral Park' }),
    ).toBeVisible()
    await expect(breakOut.locator('.dahl-m__name')).toContainText('Break Out')
    await expect(breakOut.getByRole('link')).toHaveCount(0)
    const cafe = phone.locator('.dahl-m__tile', { hasText: 'Cafe au Lait' }).first()
    await expect(cafe.locator('.dahl-m__noname')).toContainText('Cafe au Lait')
    await expect(cafe.locator('.dahl-m__pompon')).toHaveCount(1)
    await expect(cafe.getByRole('link', { name: 'See photos of Cafe au Lait on Google' })).toHaveCount(1)

    // Game card + sign-off.
    await expect(phone.locator('.dahl-m__gametitle')).toContainText(
      'This or That? — help pick next year’s dahlias',
    )
    await expect(phone.locator('.dahl-m__game .hues-button')).toContainText('Play This or That?')
    await expect(phone.locator('.dahl-m__signoff')).toContainText(
      'Hues Floral Park, A little world apart.',
    )

    // Geometric order: hero → stats → collection → game.
    expect(await topOf(page, '.dahl-m .hues-phone-hero')).toBeLessThan(
      await topOf(page, '.dahl-m .dahl-m__stats'),
    )
    expect(await topOf(page, '.dahl-m .dahl-m__stats')).toBeLessThan(
      await topOf(page, '.dahl-m .dahl-m__collection'),
    )
    expect(await topOf(page, '.dahl-m .dahl-m__collection')).toBeLessThan(
      await topOf(page, '.dahl-m .dahl-m__gamewrap'),
    )
  })

  test('phone filters narrow the production grid in place', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'phone composition only')
    await page.goto('/dahlias')
    await stabilize(page)
    const phone = page.locator('.dahl-m')
    const search = phone.locator('.dahl-m__filters input[type="search"]')
    await search.fill('runner')
    await expect(phone.locator('.dahl-m__tile')).toHaveCount(3)
    await expect(phone.locator('.dahl-m__tile').first()).toContainText('Pink Runner')
    await expect(page).toHaveURL(/q=runner/)
    await phone.locator('.dahl-m__filters').getByRole('button', { name: 'Clear filters' }).click()
    await expect(phone.locator('.dahl-m__tile')).toHaveCount(111)
  })

  test('desktop keeps its composition with the phone variant hidden', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'desktop composition only')
    await page.goto('/dahlias')
    await stabilize(page)
    await expect(page.locator('.dahl-m')).toBeHidden()
    const desktop = page.locator('.dahl-d')
    await expect(desktop).toBeVisible()
    // One h1 per breakpoint (P9b): the phone hero carries the page h1
    // and the desktop title keeps production's h1 at the same words —
    // the inactive variant is display:none.
    await expect(desktop.locator('h1.c-title')).toContainText('The heart of Hues')
    await expect(desktop.locator('.dahlias-stats__stat')).toHaveCount(3)
    await expect(desktop.locator('form[role="search"]')).toBeVisible()
    await expect(desktop.locator('.dahlias-card')).toHaveCount(111)
    await expect(desktop.locator('.dahlias-letters__chip').first()).toHaveAttribute(
      'href',
      '#letter-A',
    )
    await expect(desktop.locator('.dahlias-game')).toContainText('This or That?')
  })
})
