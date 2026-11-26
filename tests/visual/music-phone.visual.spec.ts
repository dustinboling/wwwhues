import { expect, test, type Page } from '@playwright/test'

// P8 music composition: the phone gains production's hero band
// treatment (the /m heading, soft intro, dusk painting inside the
// band) while desktop keeps its packet hero; the Sound packet, both
// set lists, Stay Tuned, and the sign-off render once and are shared
// at both widths. DOM assertions only (no screenshots): the active
// hero is pinned visible, the inactive one pinned hidden.

async function stabilize(page: Page): Promise<void> {
  await page.evaluate(() => document.fonts.ready.then(() => undefined))
  await page.waitForLoadState('networkidle').catch(() => undefined)
}

test.beforeEach(async ({ page }) => {
  // Layout comes from aspect-ratio slots; media bytes never arrive.
  await page.route('https://media.hues.flowers/**', (route) => route.abort())
})

test.describe('music composition', () => {
  test('phone renders the hero band over the shared song lists', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'phone composition only')
    await page.goto('/music')
    await stabilize(page)

    const hero = page.locator('.music-hero-m .hues-phone-hero')
    await expect(hero).toBeVisible()
    await expect(page.locator('.music-hero-d')).toBeHidden()
    await expect(hero.locator('.hues-phone-hero__eyebrow')).toContainText('Listen')
    await expect(hero.getByRole('heading', { level: 1 })).toContainText(
      'The music that plays in the park.',
    )
    await expect(hero.locator('.hues-phone-hero__intro')).toContainText(
      'music drifting over the beds under the string lights',
    )
    await expect(
      hero.getByRole('img', { name: 'Watercolor of the dahlia beds at dusk' }),
    ).toBeVisible()

    // The shared body: Sound packet, both complete sets, Stay Tuned.
    await expect(page.locator('.music-sound')).toBeVisible()
    await expect(page.locator('.music-sound')).toContainText('The Sound of Hues')
    const sets = page.locator('.music-set')
    await expect(sets).toHaveCount(2)
    await expect(sets.first().locator('.music-set__title')).toContainText('With Vocals')
    await expect(sets.first().locator('.music-row')).toHaveCount(19)
    await expect(sets.nth(1).locator('.music-set__title')).toContainText('Instrumentals')
    await expect(sets.nth(1).locator('.music-row')).toHaveCount(19)
    await expect(page.locator('#stay-tuned')).toContainText('Stay Tuned!')
  })

  test('desktop keeps its packet hero over the same song lists', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'desktop composition only')
    await page.goto('/music')
    await stabilize(page)
    await expect(page.locator('.music-hero-m')).toBeHidden()
    const hero = page.locator('.music-hero-d')
    await expect(hero).toBeVisible()
    // One h1 per breakpoint (P9b): the phone hero carries the page h1
    // and the desktop title keeps production's h1 in its own words —
    // the inactive hero is display:none.
    await expect(hero.locator('h1.c-title')).toContainText('The Music of Hues')
    await expect(hero.locator('.c-tagline')).toContainText('The music that plays in the park.')
    await expect(page.locator('.music-set')).toHaveCount(2)
    await expect(page.locator('.music-row')).toHaveCount(38)
  })
})
