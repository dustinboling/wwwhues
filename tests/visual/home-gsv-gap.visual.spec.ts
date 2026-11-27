import { expect, test, type Page } from '@playwright/test'

// Shell/home Gather/Sponsor gap proof: the phone home wraps each packet
// card in a route link, and the height:100% chain on link + card let the
// taller card's content paint past its link's bottom — Dustin 2026-11-27
// measured the Gather card painting ~34px over the Volunteer band at
// 390px. This pins the GEOMETRY with bounding boxes, not pixels: every
// card's painted box ends exactly at its link's bottom, the grid row
// sizes to the taller card, and the band keeps production's clean 12px
// gap. The Music card rides the same link-wraps-PacketCard composition,
// so it is pinned here too.

async function stabilize(page: Page): Promise<void> {
  await page.evaluate(() => document.fonts.ready.then(() => undefined))
  await page.waitForLoadState('networkidle').catch(() => undefined)
}

test.beforeEach(async ({ page }) => {
  // Layout comes from aspect-ratio slots; media bytes never arrive.
  await page.route('https://media.hues.flowers/**', (route) => route.abort())
})

interface Box {
  top: number
  bottom: number
  height: number
}

async function boxOf(page: Page, selector: string, index = 0): Promise<Box> {
  const box = await page.locator(selector).nth(index).boundingBox()
  expect(box, `${selector} has a box`).not.toBeNull()
  return { top: box?.y ?? -1, bottom: (box?.y ?? -1) + (box?.height ?? -1), height: box?.height ?? -1 }
}

test.describe('home packet gap', () => {
  test('phone Gather/Sponsor cards end at their links with a 12px band gap', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'phone composition only')
    await page.goto('/')
    await stabilize(page)
    const grid = page.locator('.home-gsv-m__grid')
    await expect(grid).toBeVisible()
    const linkCount = await grid.locator('.home-gpcardlink').count()
    expect(linkCount, 'two packet links in the phone grid').toBe(2)
    // Every card's painted box ends exactly at its link's bottom — no
    // card paints past its wrapper onto the band.
    const cardHeights: number[] = []
    for (let index = 0; index < linkCount; index += 1) {
      const link = await boxOf(page, '.home-gsv-m__grid .home-gpcardlink', index)
      const card = await boxOf(page, '.home-gsv-m__grid .home-gpcardlink .hues-packet-card', index)
      cardHeights.push(card.height)
      expect(
        Math.abs(link.bottom - card.bottom),
        `card ${index} bottom (${card.bottom}) meets its link bottom (${link.bottom})`,
      ).toBeLessThanOrEqual(1)
    }
    // The grid row sizes to the taller card, then a 12px gap, then the
    // Volunteer band — production's mt-3 rhythm.
    const gridBox = await boxOf(page, '.home-gsv-m__grid')
    expect(
      Math.abs(gridBox.height - Math.max(...cardHeights)),
      `grid height (${gridBox.height}) matches the taller card (${Math.max(...cardHeights)})`,
    ).toBeLessThanOrEqual(1)
    const band = await boxOf(page, '.home-volbar')
    const gap = band.top - gridBox.bottom
    expect(gap, `band gap is 12px (got ${gap})`).toBeGreaterThanOrEqual(11)
    expect(gap, `band gap is 12px (got ${gap})`).toBeLessThanOrEqual(13)
  })

  test('phone Music card ends at its link bottom', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'phone composition only')
    await page.goto('/')
    await stabilize(page)
    const link = page.locator('.home-music .home-gpcardlink')
    await expect(link).toBeVisible()
    const linkBox = await boxOf(page, '.home-music .home-gpcardlink')
    const cardBox = await boxOf(page, '.home-music .home-gpcardlink .hues-packet-card')
    expect(
      Math.abs(linkBox.bottom - cardBox.bottom),
      `music card bottom (${cardBox.bottom}) meets its link bottom (${linkBox.bottom})`,
    ).toBeLessThanOrEqual(1)
  })
})
