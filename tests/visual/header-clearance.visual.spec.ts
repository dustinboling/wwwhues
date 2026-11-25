import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

// P4 phone clearance proof: on every phone route, the first heading in
// the main column starts below the fixed TopBar (the Privacy H1 case).
// Measured geometrically per route: the heading's border-box top must
// clear the bar's border-box bottom (1px tolerance for subpixel
// rounding). Routes come from the parity phone pairs plus /offline,
// which is out of the parity set but in the phone shell.

// Playwright loads specs as CJS (no import.meta); the runner cwd is the
// repo root, which also holds the Playwright config.
const pairsJson = JSON.parse(
  readFileSync(join(process.cwd(), 'scripts', 'parity', 'pairs.json'), 'utf8'),
) as { phone: { pairs: Array<{ staging: string }> } }
const PATHS = [...new Set([...pairsJson.phone.pairs.map((pair) => pair.staging), '/offline'])]

test.beforeEach(async ({ page }) => {
  // Layout comes from aspect-ratio slots; media bytes never arrive.
  await page.route('https://media.hues.flowers/**', (route) => route.abort())
})

test.describe('phone header clearance', () => {
  for (const path of PATHS) {
    test(`first heading clears the bar on ${path}`, async ({ page }, testInfo) => {
      test.skip(testInfo.project.name !== 'mobile', 'phone clearance only')
      await page.goto(path)
      await page.evaluate(() => document.fonts.ready.then(() => undefined))
      await page.waitForLoadState('networkidle').catch(() => undefined)
      const result = await page.evaluate(() => {
        const bar = document.querySelector('.hues-topbar')
        const main = document.querySelector('main.hues-shell__main') ?? document.querySelector('main')
        if (bar === null || main === null) return null
        const barBottom = bar.getBoundingClientRect().bottom
        const first = [...main.querySelectorAll('h1, h2, h3, h4, h5, h6')].find((heading) => {
          const box = heading.getBoundingClientRect()
          return box.width > 0 && box.height > 0
        })
        if (first === undefined) return null
        return { barBottom, headingTop: first.getBoundingClientRect().top, tag: first.tagName }
      })
      if (result === null) throw new Error(`${path}: no visible heading in the main column`)
      expect(
        result.headingTop,
        `${path}: first ${result.tag} top (${result.headingTop}) clears the bar bottom (${result.barBottom})`,
      ).toBeGreaterThanOrEqual(result.barBottom - 1)
    })
  }
})
