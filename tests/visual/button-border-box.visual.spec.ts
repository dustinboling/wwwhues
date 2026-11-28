import { expect, test, type Page } from '@playwright/test'

// Button border-box proof (Dustin 2026-11-27, /volunteer at 390px): the
// full-width call buttons computed content-box, so width:100% resolved
// to the card's content width and padding+border painted past it — the
// primary to x=387 against its card's 370, the secondary past the
// 390px viewport edge. This pins the FIX with computed style plus
// geometry, not pixels, in the plan-pill pattern: every visible call
// button computes border-box, and its right edge lands on or inside
// its card's right content edge.

async function stabilize(page: Page): Promise<void> {
  await page.evaluate(() => document.fonts.ready.then(() => undefined))
  await page.waitForLoadState('networkidle').catch(() => undefined)
}

test.beforeEach(async ({ page }) => {
  // Layout comes from aspect-ratio slots; media bytes never arrive.
  await page.route('https://media.hues.flowers/**', (route) => route.abort())
})

interface CallButtonFit {
  name: string
  boxSizing: string
  buttonRight: number
  contentRight: number
}

async function callButtonFits(page: Page): Promise<CallButtonFit[]> {
  const buttons = page.locator('.vol-m .vol-submit')
  const count = await buttons.count()
  const fits: CallButtonFit[] = []
  for (let i = 0; i < count; i += 1) {
    const button = buttons.nth(i)
    if (!(await button.isVisible())) continue
    fits.push(
      await button.evaluate((el): CallButtonFit => {
        const card = el.closest('.hues-packet-card')
        if (card === null) throw new Error('call button has no packet card ancestor')
        const buttonBox = el.getBoundingClientRect()
        const cardBox = card.getBoundingClientRect()
        const cardStyle = getComputedStyle(card)
        return {
          name: el.className,
          boxSizing: getComputedStyle(el).boxSizing,
          buttonRight: buttonBox.right,
          contentRight:
            cardBox.right -
            Number.parseFloat(cardStyle.paddingRight) -
            Number.parseFloat(cardStyle.borderRightWidth),
        }
      }),
    )
  }
  return fits
}

test.describe('button border-box', () => {
  test('phone volunteer call buttons fit their cards', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'phone cards only')
    await page.goto('/volunteer')
    await stabilize(page)
    // The questions card always renders its call button; the empty-state
    // call button renders whenever the board holds no future slots (the
    // B6 future-only filter), so at least one call button is visible in
    // every snapshot state.
    const fits = await callButtonFits(page)
    expect(fits.length, 'at least one call button is visible').toBeGreaterThanOrEqual(1)
    for (const fit of fits) {
      expect(fit.boxSizing, `${fit.name} computes border-box`).toBe('border-box')
      expect(
        fit.buttonRight - fit.contentRight,
        `${fit.name} right edge (${fit.buttonRight}) is on or inside its card content edge (${fit.contentRight})`,
      ).toBeLessThanOrEqual(1)
    }
  })
})
