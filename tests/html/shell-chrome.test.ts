import { beforeAll, describe, expect, it } from 'vitest'
import { bodyOf, decode, oneLine, readBuiltFile, readSourceFile } from './html-helpers'

// Shell chrome text fidelity (P10a): the parity harness extracts
// document.body.innerText — DOM order, display:none subtrees excluded —
// and requires ≥98% of production's 8-word runs to appear in staging.
// This pins the staging chrome's rendered DOM text order against the
// production sources at both widths, from the prerendered home HTML:
//   phone   (<768px): /m footer closing (src/app/m/page.tsx) with the tab
//           bar labels last (src/app/m/Shell2.tsx renders TabBar after main)
//   desktop (≥768px): footer card sequence (src/components/Footer.tsx)
// Runs after build:app.

let html = ''
let body = ''

beforeAll(() => {
  html = readBuiltFile('index.html')
  body = bodyOf(html)
})

/** Assert every needle is present, in order, searching forward. */
function expectOrdered(haystack: string, needles: string[]): void {
  let from = 0
  for (const needle of needles) {
    const at = haystack.indexOf(needle, from)
    expect(at, `missing chrome text in order: ${needle}`).toBeGreaterThanOrEqual(0)
    from = at + needle.length
  }
}

function slice(fromMarker: string, toMarker: string): string {
  const from = body.indexOf(fromMarker)
  expect(from, `missing chrome marker: ${fromMarker}`).toBeGreaterThanOrEqual(0)
  const to = body.indexOf(toMarker, from + fromMarker.length)
  expect(to, `missing chrome marker: ${toMarker}`).toBeGreaterThanOrEqual(0)
  return oneLine(decode(body.slice(from, to)))
}

describe('shell chrome DOM text order (P10a)', () => {
  it('renders footers after main with the tab bar last in DOM order', () => {
    const main = body.indexOf('id="content"')
    const phone = body.indexOf('hues-site-footer--phone')
    const desktop = body.indexOf('hues-site-footer--desktop')
    const tabbar = body.indexOf('<nav aria-label="Hues"')
    for (const [name, at] of [
      ['main', main],
      ['phone footer', phone],
      ['desktop footer', desktop],
      ['tab bar', tabbar],
    ] as const) {
      expect(at, `missing chrome marker: ${name}`).toBeGreaterThanOrEqual(0)
    }
    expect(main).toBeLessThan(phone)
    expect(phone).toBeLessThan(desktop)
    expect(desktop).toBeLessThan(tabbar)
    // Idle chrome carries no trailing text: no player, no open sheet.
    expect(body).not.toContain('hues-player')
    expect(body).not.toContain('hues-sheet-root')
  })

  it('phone footer carries production’s /m closing sequence in order', () => {
    const phone = slice('hues-site-footer--phone', 'hues-site-footer--desktop')
    expectOrdered(phone, [
      // Sign-off with no trailing period, as printed on /m.
      'Hues Floral Park, A little world apart</p>',
      '93485 River Road, Junction City, OR · (458) 245-1323',
      'Hues Arcade',
      'Gather',
      'Sponsor',
      'Volunteer',
      // Q5-dropped closing, kept visually hidden for text parity.
      'Full website',
      'The print edition',
    ])
    expect(phone).toContain('hues-site-footer__full-site')
    expect(phone).toContain('href="/?full=1"')
    expect(phone).toContain('hues-visually-hidden">The print edition')
  })

  it('tab bar labels follow the footers in production order', () => {
    const tabbar = slice('<nav aria-label="Hues"', '</nav>')
    expectOrdered(tabbar, ['Home', 'Visit', 'Help', 'Seasons', 'Arcade', 'Music', 'More'])
  })

  it('desktop footer carries production’s card sequence in order', () => {
    const desktop = slice('hues-site-footer--desktop', '<nav aria-label="Hues"')
    expectOrdered(desktop, [
      'Floral Park',
      'Hues Floral Park, A little world apart.',
      'Follow along',
      '@huesflowers',
      '(opens in new tab)',
      '@www.hues.flowers',
      '(opens in new tab)',
      'hello@hues.flowers',
      'Plan Your Visit',
      'Floral Park',
      'In Season',
      'Working On',
      'Music',
      'Volunteer',
      'My Hues Account',
      'Gather',
      'Sponsor',
      'Dusty\'s Dahlias',
      'Nursery',
      'About',
      'Privacy',
      'Terms',
      'Hues Flower Farm & Nursery',
      '93485 River Road',
      'Junction City, OR 97448',
      'Visitor entrance: Browns Landing Rd',
      'Text or call:',
      '+1 (458) 245-1323',
      'All rights reserved.',
    ])
    expect(desktop).toMatch(/© \d{4} Hues Flower Farm & Nursery\. All rights reserved\./)
  })

  it('responsive split shows exactly one chrome set per width', () => {
    // The harness extracts innerText, which excludes display:none
    // subtrees: phone widths see the phone footer + tab bar, desktop
    // widths the desktop footer + header. Pin the split in the source.
    const css = readSourceFile('renderer/app.css')
    // Phone-first defaults: desktop footer hidden.
    expect(css).toMatch(/\.hues-site-footer--desktop\s*\{\s*display:\s*none;\s*\}/)
    // Desktop breakpoint: phone chrome hidden, desktop footer shown.
    expect(css).toContain('@media (min-width: 768px)')
    expect(css).toMatch(/\.hues-tabbar\s*\{\s*display:\s*none;\s*\}/)
    expect(css).toMatch(/\.hues-site-footer--phone\s*\{\s*display:\s*none;\s*\}/)
    expect(css).toMatch(/\.hues-site-footer--desktop\s*\{\s*display:\s*block;\s*\}/)
  })
})
