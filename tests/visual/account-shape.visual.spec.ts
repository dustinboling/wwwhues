import { expect, test, type Page } from '@playwright/test'

// P4F account-round shape proof: the top bar's account control is an
// anchor (Link emits .hues-link), and the link rules bundle after the
// control rules — at equal specificity they stole the circle and left a
// padded rounded square on staging. This pins the SHAPE with computed
// style, not pixels, so the gate catches the regression: the radii must
// reach at least half the height (a true circle) and the box must be
// square at phone width. (A locator screenshot also covers the header,
// but antialiasing tolerance there cannot see a 4px radius.)

async function stabilize(page: Page): Promise<void> {
  await page.evaluate(() => document.fonts.ready.then(() => undefined))
  await page.waitForLoadState('networkidle').catch(() => undefined)
}

test.beforeEach(async ({ page }) => {
  // Layout comes from aspect-ratio slots; media bytes never arrive.
  await page.route('https://media.hues.flowers/**', (route) => route.abort())
})

interface AccountShape {
  width: number
  height: number
  radii: number[]
  padding: number[]
}

async function accountShape(page: Page): Promise<AccountShape> {
  const account = page.locator('.hues-topbar .hues-account-button')
  await expect(account).toBeVisible()
  return account.evaluate((el): AccountShape => {
    const box = el.getBoundingClientRect()
    const style = getComputedStyle(el)
    // Computed radii may serialize as "9999px" or the elliptical pair
    // "9999px 9999px"; the horizontal radius leads in both forms.
    const radius = (value: string): number => Number.parseFloat(value)
    return {
      width: box.width,
      height: box.height,
      radii: [
        radius(style.borderTopLeftRadius),
        radius(style.borderTopRightRadius),
        radius(style.borderBottomRightRadius),
        radius(style.borderBottomLeftRadius),
      ],
      padding: [
        Number.parseFloat(style.paddingTop),
        Number.parseFloat(style.paddingRight),
        Number.parseFloat(style.paddingBottom),
        Number.parseFloat(style.paddingLeft),
      ],
    }
  })
}

test.describe('account round shape', () => {
  test('phone top-bar account control is a true circle', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'phone header only')
    await page.goto('/')
    await stabilize(page)
    const shape = await accountShape(page)
    // Square box: the locked 40px round, restored — not resized.
    expect(
      Math.abs(shape.width - shape.height),
      `account box is square (width ${shape.width}, height ${shape.height})`,
    ).toBeLessThanOrEqual(1)
    // Every corner reaches at least half the height: a circle, not a
    // rounded square (the .hues-link 4px radius fails this at 40px).
    const smallest = Math.min(...shape.radii)
    expect(
      smallest,
      `smallest corner radius (${smallest}) reaches half the height (${shape.height / 2})`,
    ).toBeGreaterThanOrEqual(shape.height / 2)
    // No link padding inside the round.
    for (const [index, side] of shape.padding.entries()) {
      expect(side, `padding side ${index} is 0`).toBe(0)
    }
  })
})
