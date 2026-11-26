import { expect, test, type Page } from '@playwright/test'

// P8 seasons compositions: the hub and the season details render the
// /m order on the phone (hero bands, /m status + glance + working-on
// on the hub; group cards with edge-to-edge paintings on the
// details) while desktop keeps its Slice B composition. DOM
// assertions only (no screenshots): the active variant is pinned
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

test.describe('season hub composition', () => {
  test('phone renders the /m order with the desktop variant hidden', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'phone composition only')
    await page.goto('/whats-in-season')
    await stabilize(page)
    const phone = page.locator('.seash-m')
    await expect(phone).toBeVisible()
    await expect(page.locator('.seash-d')).toBeHidden()

    // Frost-frame hero band: eyebrow, h1, panorama plate.
    const hero = phone.locator('.hues-phone-hero')
    await expect(hero).toBeVisible()
    await expect(hero.locator('.hues-phone-hero__eyebrow')).toContainText('What’s in season')
    await expect(hero.getByRole('heading', { level: 1 })).toContainText(
      'A little magic blooms in every season.',
    )
    await expect(
      hero.getByRole('img', { name: 'Watercolor panorama of the Hues year' }),
    ).toBeVisible()

    // The /m status card with the staging snapshot note.
    await expect(phone.locator('.seash-m__statustitle')).toContainText(
      'The 2026 bloom season has ended',
    )
    await expect(phone.locator('.seash-m__statuscard')).toContainText('Season status ·')
    await expect(phone.locator('.seash-m__statuscard .c-snapshot')).toContainText(
      'Status snapshot from',
    )

    // The rainbow over the glance, and the three chapter cards.
    await expect(phone.locator('.seash-m__rainbow')).toHaveCount(1)
    await expect(phone.locator('#seash-glance')).toContainText('The season at a glance')
    const chapters = phone.locator('.seash-m__chapter')
    await expect(chapters).toHaveCount(3)
    await expect(chapters.first().locator('.seash-m__when')).toContainText('March – May')
    await expect(chapters.first().locator('.seash-m__chaptertitle')).toContainText('Spring')
    await expect(chapters.first().locator('.seash-m__point')).toHaveCount(3)
    await expect(chapters.first().locator('.seash-m__cta')).toContainText('Meet the flowers ›')
    await expect(phone.locator('.seash-m__chapterlink').first()).toHaveAttribute(
      'href',
      '/season/spring',
    )

    // Working-on in the /m words, six cards.
    await expect(phone.locator('.seash-m__eyebrow')).toContainText('Working on')
    await expect(phone.locator('#seash-work')).toContainText('What it’s all for')
    await expect(phone.locator('.seash-m__workcard')).toHaveCount(6)
    await expect(phone.locator('.seash-m__workcard').first()).toContainText('Bulbs going in')

    // Geometric order: hero → status → glance → working-on.
    expect(await topOf(page, '.seash-m .hues-phone-hero')).toBeLessThan(
      await topOf(page, '.seash-m .seash-m__status'),
    )
    expect(await topOf(page, '.seash-m .seash-m__status')).toBeLessThan(
      await topOf(page, '.seash-m .seash-m__glance'),
    )
    expect(await topOf(page, '.seash-m .seash-m__glance')).toBeLessThan(
      await topOf(page, '.seash-m .seash-m__work'),
    )
  })

  test('desktop keeps its composition with the phone variant hidden', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'desktop composition only')
    await page.goto('/whats-in-season')
    await stabilize(page)
    await expect(page.locator('.seash-m')).toBeHidden()
    const desktop = page.locator('.seash-d')
    await expect(desktop).toBeVisible()
    // The desktop title renders the same words one level down: the
    // phone hero carries the page h1 and the prerender contract is
    // one h1 per page.
    await expect(desktop.locator('h2.c-title')).toContainText('What’s in Season')
    await expect(desktop.locator('.c-status__title')).toContainText(
      'The park is open — the picking is done',
    )
    await expect(desktop.locator('.seasons-panel')).toHaveCount(3)
    await expect(desktop.locator('.seasons-work')).toHaveCount(6)
    await expect(desktop.locator('.seasons-plan')).toContainText('Plan Your Visit')
  })
})

test.describe('season detail composition', () => {
  test('phone renders the /m order with the desktop variant hidden', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'phone composition only')
    await page.goto('/season/spring')
    await stabilize(page)
    const phone = page.locator('.seas-m')
    await expect(phone).toBeVisible()
    await expect(page.locator('.seas-d')).toBeHidden()

    // Hero band: eyebrow, h1, lede.
    const hero = phone.locator('.hues-phone-hero')
    await expect(hero).toBeVisible()
    await expect(hero.locator('.hues-phone-hero__eyebrow')).toContainText(
      'What’s in season · March – May',
    )
    await expect(hero.getByRole('heading', { level: 1 })).toContainText('Spring at Hues')
    await expect(hero.locator('.hues-phone-hero__intro')).toContainText(
      'Spring arrives at Hues in waves',
    )

    // Three group cards with when chips; all 19 spring flowers as
    // stacked phone cards with edge-to-edge paintings.
    await expect(phone.locator('.seas-m__card')).toHaveCount(3)
    await expect(phone.locator('.seas-m__card').first().locator('.seas-m__when')).toContainText(
      'March',
    )
    await expect(phone.locator('.seas-m__grouptitle').first()).toContainText('The First Flowers')
    const flowers = phone.locator('.seas-m__flower')
    await expect(flowers).toHaveCount(19)
    await expect(flowers.first().locator('.seas-m__flowername')).toContainText('Daffodils')
    await expect(flowers.first().locator('.seas-m__tag')).toContainText('Look & linger')
    await expect(
      flowers.first().getByRole('img', { name: 'Watercolor plate of daffodils' }),
    ).toBeVisible()

    // Closing nav + the /m sign-off (no trailing period).
    await expect(phone.locator('.seas-m__footer')).toContainText('‹ The season at a glance')
    await expect(phone.locator('.seas-m__footer')).toContainText('Next: Summer ›')
    await expect(phone.locator('.seas-m__signoff')).toContainText(
      'Hues Floral Park, A little world apart',
    )

    // Geometric order: hero → first group → closing.
    expect(await topOf(page, '.seas-m .hues-phone-hero')).toBeLessThan(
      await topOf(page, '.seas-m .seas-m__group'),
    )
    expect(await topOf(page, '.seas-m .seas-m__group')).toBeLessThan(
      await topOf(page, '.seas-m .seas-m__footer'),
    )
  })

  test('fall phone carries the dahlias catalog card', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'phone composition only')
    await page.goto('/season/fall')
    await stabilize(page)
    const phone = page.locator('.seas-m')
    await expect(phone).toBeVisible()
    const catalog = phone.locator('.seas-m__catalog')
    await expect(catalog).toBeVisible()
    await expect(catalog).toContainText('Every dahlia variety, A to Z ›')
    await expect(catalog).toHaveAttribute('href', '/dahlias')
    await expect(phone.locator('.seas-m__flower')).toHaveCount(14)
  })

  test('desktop keeps its composition with the phone variant hidden', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'desktop composition only')
    await page.goto('/season/spring')
    await stabilize(page)
    await expect(page.locator('.seas-m')).toBeHidden()
    const desktop = page.locator('.seas-d')
    await expect(desktop).toBeVisible()
    await expect(desktop.locator('h1.c-title')).toContainText('Spring at Hues')
    await expect(desktop.locator('.c-plate')).toHaveCount(3)
    await expect(desktop.locator('.seasons-flower')).toHaveCount(19)
    await expect(desktop.locator('.seasons-footer')).toContainText('Next: Summer ›')
  })
})
