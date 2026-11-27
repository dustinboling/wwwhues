import { expect, test, type Page } from '@playwright/test'

// Shell/home Plan-pill shape proof: the phone TopBar's Plan button is an
// anchor (Link emits .hues-link), and the link rules bundle after the
// control rules — at equal specificity they stole the pill and left a
// 4px rounded rectangle on staging (Dustin 2026-11-27: border-radius 4px
// on .hues-topbar__plan at 390px). This pins the SHAPE with computed
// style, not pixels, in the account-shape pattern: the radii must reach
// at least half the height (a true capsule). It also pins the tighter
// phone padding (8px 16px), which the top-bar dress keeps against the
// desktop-pill shape compound by higher specificity.

async function stabilize(page: Page): Promise<void> {
  await page.evaluate(() => document.fonts.ready.then(() => undefined))
  await page.waitForLoadState('networkidle').catch(() => undefined)
}

test.beforeEach(async ({ page }) => {
  // Layout comes from aspect-ratio slots; media bytes never arrive.
  await page.route('https://media.hues.flowers/**', (route) => route.abort())
})

interface PlanShape {
  height: number
  radii: number[]
  padding: number[]
}

async function planShape(page: Page): Promise<PlanShape> {
  const plan = page.locator('.hues-topbar .hues-topbar__plan')
  await expect(plan).toBeVisible()
  return plan.evaluate((el): PlanShape => {
    const box = el.getBoundingClientRect()
    const style = getComputedStyle(el)
    // Computed radii may serialize as "9999px" or the elliptical pair
    // "9999px 9999px"; the horizontal radius leads in both forms.
    const radius = (value: string): number => Number.parseFloat(value)
    return {
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

test.describe('plan pill shape', () => {
  test('phone top-bar Plan button is a true pill', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'phone header only')
    await page.goto('/')
    await stabilize(page)
    const shape = await planShape(page)
    // Every corner reaches at least half the height: a capsule, not the
    // .hues-link 4px rounded rectangle.
    const smallest = Math.min(...shape.radii)
    expect(
      smallest,
      `smallest corner radius (${smallest}) reaches half the height (${shape.height / 2})`,
    ).toBeGreaterThanOrEqual(shape.height / 2)
    // The tighter phone dress survives the shape compound: 8px vertical,
    // 16px horizontal — not the desktop pill's 10px 20px.
    expect(shape.padding[0], 'padding-top is 8px').toBe(8)
    expect(shape.padding[2], 'padding-bottom is 8px').toBe(8)
    expect(shape.padding[1], 'padding-right is 16px').toBe(16)
    expect(shape.padding[3], 'padding-left is 16px').toBe(16)
  })
})
