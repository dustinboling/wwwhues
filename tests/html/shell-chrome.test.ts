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

describe('More sheet items with glosses (phone)', () => {
  // Production's More sheet (src/app/m/TabBar.tsx MORE_LINKS) gives five
  // rows a one-line gloss; the port dropped them (Dustin 2026-11-27).
  // The sheet is client-rendered — open state starts closed, so the
  // prerender carries no hues-sheet-root (see the idle-chrome assertion
  // above) — so pin the rows, their order, the verbatim glosses, and the
  // gloss wiring in the source. The sheet opens only from the tab bar's
  // More disclosure, which is phone-only (display:none at ≥768px, pinned
  // above), so these rows are the phone-width menu.
  const ROWS: Array<{ href: string; label: string; note: string | null }> = [
    { href: '/account', label: 'My Hues Account', note: null },
    { href: '/dahlias', label: 'Dahlias', note: 'The collection, A to Z' },
    { href: '/gather', label: 'Gather', note: 'Project days and RSVPs' },
    { href: '/about', label: 'Our Story', note: 'How the park came to be' },
    { href: '/sponsor', label: 'Sponsor', note: 'A bed, a tree, a bench — your name in the park' },
    { href: '/volunteer', label: 'Volunteer', note: 'Lend a hand in the beds' },
  ]

  function moreRowsBlock(): string {
    const site = readSourceFile('content/site.ts')
    const start = site.indexOf('export const MORE_SHEET_ROWS')
    expect(start, 'missing MORE_SHEET_ROWS in content/site.ts').toBeGreaterThanOrEqual(0)
    const open = site.indexOf('[', start)
    // The array literal closes on its own line; the type annotation's
    // `[]` sits before the opener, so search from the opener.
    const end = site.indexOf('\n]', open)
    expect(end, 'unterminated MORE_SHEET_ROWS').toBeGreaterThanOrEqual(0)
    return site.slice(open, end)
  }

  it('lists the six rows in production order with the same destinations', () => {
    const block = moreRowsBlock()
    expectOrdered(
      block,
      ROWS.map((row) => row.href),
    )
    expectOrdered(
      block,
      ROWS.map((row) => row.label),
    )
  })

  it('carries production’s five glosses verbatim, account gloss-free', () => {
    const block = moreRowsBlock()
    // Each label directly followed by its gloss, in sheet order: items
    // WITH their glosses, not labels alone.
    const needles: string[] = []
    for (const row of ROWS) {
      needles.push(row.label)
      if (row.note !== null) needles.push(row.note)
    }
    expectOrdered(block, needles)
    // My Hues Account stays gloss-free and first, as production.
    const accountEntry = block.slice(block.indexOf('My Hues Account'), block.indexOf('Dahlias'))
    expect(accountEntry).not.toContain('note')
    // Verbatim against production's own source (em dashes included).
    const production = readSourceFile('src/app/m/TabBar.tsx')
    for (const row of ROWS.filter((row) => row.note !== null)) {
      expect(production, `production gloss drifted: ${row.label}`).toContain(row.note as string)
    }
  })

  it('wires each gloss into the sheet row’s right-aligned note', () => {
    const shell = readSourceFile('renderer/shell.tsx')
    expect(shell).toContain('note={item.note}')
    // SheetRow renders label + right-aligned note, production's layout.
    const rows = readSourceFile('packages/ui/src/actions/RowLinks.tsx')
    expect(rows).toContain('rowClass="hues-sheet-row"')
    expect(rows).toContain('${rowClass}__label')
    expect(rows).toContain('${rowClass}__note')
    const css = readSourceFile('packages/ui/src/styles/actions.css')
    const noteRule = css.match(/\.hues-sheet-row__note\s*\{[^}]*\}/)?.[0]
    expect(noteRule, 'missing hues-sheet-row__note rule').toBeDefined()
    expect(noteRule).toContain('text-align: right')
  })

  it('opens only from the phone tab bar and closes via a × button', () => {
    const shell = readSourceFile('renderer/shell.tsx')
    expect(shell).toContain('onMoreTab={() => setMoreOpen(true)}')
    expect(shell).toContain('<Sheet open={moreOpen}')
    // Production's sheet shows a × close button; staging's Sheet close
    // is the round × icon button with the same accessible name.
    const sheet = readSourceFile('packages/ui/src/shell/Sheet.tsx')
    expect(sheet).toContain('aria-label="Close"')
    expect(sheet).toContain('icon="close"')
    const icons = readSourceFile('packages/ui/src/media/Icon.tsx')
    expect(icons).toContain("close: 'm7 7 10 10M17 7 7 17'")
  })
})

describe('admin phone chrome (P10d)', () => {
  // Production's admin pages have no /m edition and show no phone tab
  // bar: /volunteer/admin wears the desktop header + footer without the
  // tab bar, /play/admin is a bare shell (Layout isBareShell). The admin
  // pages are client-rendered (ssr:false), so pin the route mapping and
  // the CSS rules in the source; lead-side parity compares the render.
  it('maps the admin routes to their production chrome modes', () => {
    const shell = readSourceFile('renderer/shell.tsx')
    expect(shell).toContain(
      "if (pathname === '/volunteer/admin') return 'hues-shell--chrome-desktop hues-shell--chrome-admin'",
    )
    expect(shell).toContain("if (pathname === '/arcade/admin') return 'hues-shell--chrome-bare'")
  })

  it('hides the tab bar and the bar title on admin routes below 768px', () => {
    const css = readSourceFile('renderer/app.css')
    for (const mode of ['chrome-admin', 'chrome-bare']) {
      expect(css).toContain(`.hues-shell--${mode} .hues-tabbar`)
      expect(css).toContain(`.hues-shell--${mode} .hues-admin-shell__wordmark`)
      expect(css).toContain(`.hues-shell--${mode} .hues-admin-shell__bar .hues-admin-shell__title`)
    }
    // Bare chrome hides the whole shell frame at phone width.
    for (const frame of ['hues-topbar', 'hues-site-header', 'hues-site-footer--phone', 'hues-site-footer--desktop']) {
      expect(css).toContain(`.hues-shell--chrome-bare .${frame}`)
    }
  })

  it('shows exactly one admin h1 per width, between eyebrow and intro on phone', () => {
    const css = readSourceFile('renderer/app.css')
    // Phone body title hidden by default (desktop keeps the bar h1)…
    expect(css).toMatch(/\.c-admin__title\s*\{\s*display:\s*none;\s*\}/)
    // …and shown below 768px on both admin routes.
    expect(css).toContain('.hues-shell--chrome-admin .c-admin__title')
    expect(css).toContain('.hues-shell--chrome-bare .c-admin__title')
    // The bar title hide keeps the account slot: sign-out must stay
    // reachable on phones (the arcade dashboard has no other sign-out).
    expect(css).not.toContain('.hues-admin-shell__account')
    // DOM order in both pages: eyebrow, phone h1, intro.
    for (const route of ['routes/volunteer/admin/+Page.tsx', 'routes/arcade/admin/+Page.tsx']) {
      const page = readSourceFile(route)
      const eyebrow = page.indexOf('c-eyebrow')
      const title = page.indexOf('c-admin__title')
      const intro = page.indexOf('_INTRO}')
      expect(eyebrow, `${route}: missing eyebrow`).toBeGreaterThanOrEqual(0)
      expect(title, `${route}: missing phone h1`).toBeGreaterThanOrEqual(0)
      expect(intro, `${route}: missing intro`).toBeGreaterThanOrEqual(0)
      expect(eyebrow).toBeLessThan(title)
      expect(title).toBeLessThan(intro)
    }
  })

  it('keeps the shared (required) marker off the admin forms', () => {
    // Production's admin forms carry no required markers; the marker
    // text would break the parity text runs at every label.
    const css = readSourceFile('renderer/app.css')
    expect(css).toContain('.hues-shell--chrome-admin .hues-field__required')
    expect(css).toContain('.hues-shell--chrome-bare .hues-field__required')
  })
})
