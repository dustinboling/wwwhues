import { describe, expect, it } from 'vitest'
import { REDIRECTS, resolveRedirect } from '../../server/redirects'

// Canonical on-host routes per the plan (§2.1 route table + Bea §2.1/§2.2
// as adjusted by N1/N2). Later slices build these; the redirect test
// asserts destinations against this list until the routes exist.
const CANONICAL_EXACT = new Set([
  '/',
  '/visit',
  '/floral-park',
  '/whats-in-season',
  '/season/spring',
  '/season/summer',
  '/season/fall',
  '/how-u-cut-works',
  '/music',
  '/working-on',
  '/volunteer',
  '/volunteer/admin',
  '/dahlias',
  '/nursery',
  '/about',
  '/gather',
  '/sponsor',
  '/privacy',
  '/terms',
  '/arcade',
  '/arcade/admin',
  '/account',
  '/help',
])

// Every legacy source the table must carry (Bea §2.3 + N1/N2 + template
// leftovers + cross-app game entries). This list guards completeness: a
// dropped row fails here, not on day-0 crawl.
const EXPECTED_FROMS = [
  '/m',
  '/m/visit',
  '/m/dahlias',
  '/m/music',
  '/m/story',
  '/m/season',
  '/m/season/spring',
  '/m/season/summer',
  '/m/season/fall',
  '/m/how-u-cut-works',
  '/m/volunteer',
  '/m/gather',
  '/m/sponsor',
  '/m/help',
  '/m/arcade',
  '/m/play',
  '/m/account',
  '/m/give',
  '/give',
  '/m2',
  '/m2/season',
  '/m2/dahlias',
  '/m2/visit',
  '/m2/story',
  '/product',
  '/product/*',
  '/play',
  '/play/admin',
  '/articles',
  '/articles/*',
  '/projects',
  '/speaking',
  '/uses',
  '/thank-you',
  '/m/this-or-that',
  '/m/this-or-that/my-list',
  '/this-or-that',
  '/this-or-that/my-list',
  '/this-or-that/admin',
  '/this-or-that/preview/*',
  '/m/arcade/match',
  '/m/arcade/dahlia-match',
  '/m/arcade/mahjong',
  '/m/arcade/dahlia-mahjong',
  '/m/arcade/sorting-table',
  '/m/arcade/season-sort',
  '/m/arcade/hues-hop',
  '/preview/hues-hop',
  '/preview/hues-hop.html',
]

function coveredByGlob(from: string, target: string): boolean {
  if (!from.endsWith('/*')) return from === target
  return target.startsWith(from.slice(0, -1))
}

describe('redirect table (§5 chain-proof)', () => {
  it('carries the full legacy map', () => {
    expect(REDIRECTS.map((entry) => entry.from).sort()).toEqual([...EXPECTED_FROMS].sort())
  })

  it('uses 301 for moves and 302 only for cross-app game entries', () => {
    const moved = REDIRECTS.filter((entry) => entry.status === 301)
    const crossApp = REDIRECTS.filter((entry) => entry.status === 302)
    expect(REDIRECTS.length).toBe(EXPECTED_FROMS.length)
    expect(moved.length).toBe(34)
    expect(crossApp.length).toBe(15)
    for (const entry of REDIRECTS) {
      if (entry.status === 301) {
        expect(entry.to.startsWith('/')).toBe(true)
      } else {
        expect(entry.to.startsWith('https://')).toBe(true)
      }
    }
  })

  it('has unique, well-formed sources', () => {
    const froms = REDIRECTS.map((entry) => entry.from)
    expect(new Set(froms).size).toBe(froms.length)
    for (const from of froms) {
      expect(from.startsWith('/')).toBe(true)
      expect(from).not.toContain('?')
      expect(from).not.toContain('#')
      const stars = from.split('*').length - 1
      expect(stars <= 1).toBe(true)
      if (stars === 1) expect(from.endsWith('/*')).toBe(true)
    }
  })

  it('sends every 301 to a canonical route', () => {
    for (const entry of REDIRECTS.filter((e) => e.status === 301)) {
      expect(CANONICAL_EXACT.has(entry.to)).toBe(true)
    }
  })

  it('sends every 302 to a game subdomain (never on-host, never the old tree)', () => {
    for (const entry of REDIRECTS.filter((e) => e.status === 302)) {
      expect(entry.to).toMatch(/^https:\/\/[a-z]+\.hues\.flowers(\/.*)?$/)
      expect(entry.to).not.toContain('/m/')
      expect(entry.to).not.toContain('/m2')
    }
  })

  it('has no chains: no destination is itself a source', () => {
    const froms = REDIRECTS.map((entry) => entry.from)
    for (const entry of REDIRECTS) {
      const target = entry.to.endsWith('/*') ? null : entry.to
      if (target === null) continue
      for (const from of froms) {
        expect(coveredByGlob(from, target)).toBe(false)
      }
    }
  })

  it('has no loops: no entry resolves to itself', () => {
    for (const entry of REDIRECTS) {
      expect(entry.to).not.toBe(entry.from)
    }
  })

  it('lands N1/N2 destinations', () => {
    expect(resolveRedirect('/m/season/spring')).toEqual({ to: '/season/spring', status: 301 })
    expect(resolveRedirect('/m/season/summer')).toEqual({ to: '/season/summer', status: 301 })
    expect(resolveRedirect('/m/season/fall')).toEqual({ to: '/season/fall', status: 301 })
    expect(resolveRedirect('/play')).toEqual({ to: '/arcade', status: 301 })
    expect(resolveRedirect('/play/admin')).toEqual({ to: '/arcade/admin', status: 301 })
    expect(resolveRedirect('/m/arcade')).toEqual({ to: '/arcade', status: 301 })
    expect(resolveRedirect('/m/play')).toEqual({ to: '/arcade', status: 301 })
  })

  it('collapses the historical chains to one hop', () => {
    // Bea §2.3 flag + middleware LEGACY: match/mahjong went through
    // /m/arcade/dahlia-*; /m2/* went through /m/*. All direct now.
    expect(resolveRedirect('/m/arcade/match')).toEqual({
      to: 'https://dahliamatch.hues.flowers',
      status: 302,
    })
    expect(resolveRedirect('/m/arcade/mahjong')).toEqual({
      to: 'https://dahliamahjong.hues.flowers',
      status: 302,
    })
    for (const from of ['/m2', '/m2/season', '/m2/dahlias', '/m2/visit', '/m2/story']) {
      const resolved = resolveRedirect(from)
      expect(resolved).not.toBeNull()
      expect(resolved?.to.startsWith('/m/') ?? false).toBe(false)
      expect(resolved?.to).not.toBe('/m')
    }
    expect(resolveRedirect('/m/give')).toEqual({ to: '/sponsor', status: 301 })
  })

  it('matches globs, carries preview tokens, and misses cleanly', () => {
    expect(resolveRedirect('/product')).toEqual({ to: '/dahlias', status: 301 })
    expect(resolveRedirect('/product/old-shop-url')).toEqual({ to: '/dahlias', status: 301 })
    expect(resolveRedirect('/articles/some-slug')).toEqual({ to: '/', status: 301 })
    expect(resolveRedirect('/this-or-that/preview/abc123')).toEqual({
      to: 'https://thisorthat.hues.flowers/preview/abc123',
      status: 302,
    })
    expect(resolveRedirect('/')).toBeNull()
    expect(resolveRedirect('/visit')).toBeNull()
    expect(resolveRedirect('/m/arcade/unknown-game')).toBeNull()
  })
})
