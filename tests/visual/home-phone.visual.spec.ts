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

interface Box {
  top: number
  bottom: number
  width: number
  height: number
}

async function boxOf(page: Page, selector: string): Promise<Box> {
  const box = await page.locator(selector).first().boundingBox()
  expect(box, `${selector} has a box`).not.toBeNull()
  return {
    top: box?.y ?? -1,
    bottom: (box?.y ?? -1) + (box?.height ?? -1),
    width: box?.width ?? -1,
    height: box?.height ?? -1,
  }
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

  test('phone opening pins production geometry', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'phone composition only')
    await page.goto('/')
    await stabilize(page)
    // Dustin 2026-11-27: staging stacked the shell's 65px clearance on
    // top of the ported 96px masthead clearance, landing the lockup 65px
    // low (tagline 284, figure 371). Production positions at 390×844
    // unscrolled: tagline 219, figure 306, painting 334×223, caption
    // bottom 568 — pinned ±2px.
    const tagline = await boxOf(page, '.home-masthead__tagline')
    expect(Math.abs(tagline.top - 219), `tagline top (${tagline.top}) lands at 219`).toBeLessThanOrEqual(2)
    const figure = await boxOf(page, '.home-procession')
    expect(Math.abs(figure.top - 306), `figure top (${figure.top}) lands at 306`).toBeLessThanOrEqual(2)
    const painting = await boxOf(page, '.home-procession .hues-image')
    expect(
      Math.abs(painting.width - 334),
      `painting width (${painting.width}) lands at 334`,
    ).toBeLessThanOrEqual(2)
    expect(
      Math.abs(painting.height - 223),
      `painting height (${painting.height}) lands at 223`,
    ).toBeLessThanOrEqual(2)
    const caption = await boxOf(page, '.home-procession__caption')
    expect(
      Math.abs(caption.bottom - 568),
      `caption bottom (${caption.bottom}) lands at 568`,
    ).toBeLessThanOrEqual(2)
  })

  test('desktop composition is unchanged', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'desktop composition only')
    await page.goto('/')
    await stabilize(page)
    // The phone clearance fix is scoped below 768px: desktop keeps the
    // H1 hero block with the framed plate and the overlapping status
    // packet, and the .home column carries no phone offset.
    await expect(page.locator('.home-hero')).toBeVisible()
    await expect(page.locator('.home-masthead')).toBeHidden()
    await expect(page.locator('.home-procession')).toBeHidden()
    const offsets = await page
      .locator('.home')
      .first()
      .evaluate((el) => ({
        marginTop: getComputedStyle(el).marginTop,
        paddingLeft: getComputedStyle(el).paddingLeft,
      }))
    expect(offsets.marginTop, 'desktop .home carries no phone offset').toBe('0px')
    expect(offsets.paddingLeft, 'desktop .home gutter stays 32px').toBe('32px')
    const plate = await boxOf(page, '.home-hero__plate')
    const status = await boxOf(page, '.home-status')
    expect(
      status.top,
      `status top (${status.top}) overlaps the plate bottom (${plate.bottom})`,
    ).toBeLessThan(plate.bottom)
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

test.describe('home photo bands', () => {
  async function slotHeight(page: Page, band: string): Promise<number> {
    const box = await page.locator(`.hues-photo-band--${band} .hues-photo-band__slot`).first().boundingBox()
    expect(box).not.toBeNull()
    return box?.height ?? -1
  }

  test('desktop bands render at production fixed heights', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'desktop band heights only')
    await page.goto('/')
    await stabilize(page)
    // Production src/app/page.tsx: h-[380px] sm:h-[430px] dusk,
    // h-[260px] sm:h-[300px] Meet Dusty — staging desktop (1280px) sits
    // inside the sm window, so the slots render 430px and 300px, never
    // the natural image height (~1,500px / ~2,000px).
    await expect(page.locator('.hues-photo-band--dusk .hues-photo-band__slot')).toBeVisible()
    await expect(
      page.locator('.hues-photo-band--meet-dusty .hues-photo-band__slot'),
    ).toBeVisible()
    expect(await slotHeight(page, 'dusk')).toBe(430)
    expect(await slotHeight(page, 'meet-dusty')).toBe(300)
  })

  test('phone bands render at production fixed heights', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'phone band heights only')
    await page.goto('/')
    await stabilize(page)
    // Production src/app/m/page.tsx: h-[430px] dusk (full-bleed),
    // h-[230px] Meet Dusty.
    await expect(page.locator('.hues-photo-band--dusk .hues-photo-band__slot')).toBeVisible()
    await expect(
      page.locator('.hues-photo-band--meet-dusty .hues-photo-band__slot'),
    ).toBeVisible()
    expect(await slotHeight(page, 'dusk')).toBe(430)
    expect(await slotHeight(page, 'meet-dusty')).toBe(230)
  })
})
