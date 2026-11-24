// Legacy URL map for hues.flowers (architecture-plan §5, Bea §2.3).
//
// Single source compiled into Hono routes at the top of +server.ts (a later
// slice, with the /api proxy): scheme/host canonicalization first, then
// these entries, all one hop and unconditional (no UA sniffing, no
// hues-full cookie check). Query strings are dropped except ?full=1, which
// is swallowed into the canonical target.
//
// A trailing /* on `from` matches that prefix; when `to` also ends in /*
// the matched suffix carries over (preview tokens), otherwise the target
// is exact (query dropped). See resolveRedirect().

export interface RedirectEntry {
  /** Exact path, or a prefix match when ending in /*. */
  from: string
  /** Final canonical: on-host path for 301s, game-subdomain URL for 302s. */
  to: string
  status: 301 | 302
}

// 301s: Bea §2.3 as adjusted by the N1 (/season/:slug) and N2 (/arcade)
// rulings, plus the next.config.mjs template leftovers upgraded 302 → 301
// per §5 (the move is permanent). 302s: cross-app game entries, kept per
// §2.1/N3-default at today's next.config destinations, collapsed to one hop.
export const REDIRECTS: ReadonlyArray<RedirectEntry> = [
  // /m tree → unified routes (Bea §2.3).
  { from: '/m', to: '/', status: 301 },
  { from: '/m/visit', to: '/visit', status: 301 },
  { from: '/m/dahlias', to: '/dahlias', status: 301 },
  { from: '/m/music', to: '/music', status: 301 },
  { from: '/m/story', to: '/about', status: 301 },
  { from: '/m/season', to: '/whats-in-season', status: 301 },
  { from: '/m/season/spring', to: '/season/spring', status: 301 },
  { from: '/m/season/summer', to: '/season/summer', status: 301 },
  { from: '/m/season/fall', to: '/season/fall', status: 301 },
  { from: '/m/how-u-cut-works', to: '/how-u-cut-works', status: 301 },
  { from: '/m/volunteer', to: '/volunteer', status: 301 },
  { from: '/m/gather', to: '/gather', status: 301 },
  { from: '/m/sponsor', to: '/sponsor', status: 301 },
  { from: '/m/help', to: '/help', status: 301 },
  { from: '/m/arcade', to: '/arcade', status: 301 },
  { from: '/m/play', to: '/arcade', status: 301 },
  { from: '/m/account', to: '/account', status: 301 },
  // Direct at the final canonical — never chained through /give.
  { from: '/m/give', to: '/sponsor', status: 301 },
  { from: '/give', to: '/sponsor', status: 301 },
  // /m2 → final canonicals directly, never through /m (Bea §2.3).
  { from: '/m2', to: '/', status: 301 },
  { from: '/m2/season', to: '/whats-in-season', status: 301 },
  { from: '/m2/dahlias', to: '/dahlias', status: 301 },
  { from: '/m2/visit', to: '/visit', status: 301 },
  { from: '/m2/story', to: '/about', status: 301 },
  // Retired WordPress shop URLs → the dahlia collection (keep exactly).
  { from: '/product', to: '/dahlias', status: 301 },
  { from: '/product/*', to: '/dahlias', status: 301 },
  // N2: /play is retired; the hub is /arcade (admin moves with it).
  { from: '/play', to: '/arcade', status: 301 },
  { from: '/play/admin', to: '/arcade/admin', status: 301 },
  // Starter-template leftovers (next.config.mjs, upgraded to 301 per §5).
  { from: '/articles', to: '/', status: 301 },
  { from: '/articles/*', to: '/', status: 301 },
  { from: '/projects', to: '/working-on', status: 301 },
  { from: '/speaking', to: '/about', status: 301 },
  { from: '/uses', to: '/about', status: 301 },
  { from: '/thank-you', to: '/', status: 301 },
  // Cross-app game entries (302, kept per §2.1): today's next.config
  // destinations, each in one hop. /m/arcade/match + /m/arcade/mahjong go
  // to the subdomain directly, never via /m/arcade/dahlia-* (Bea §2.3
  // flag, §2.1); the same collapse applies to the /m/this-or-that pair.
  { from: '/m/this-or-that', to: 'https://thisorthat.hues.flowers', status: 302 },
  { from: '/m/this-or-that/my-list', to: 'https://thisorthat.hues.flowers/my-list', status: 302 },
  { from: '/this-or-that', to: 'https://thisorthat.hues.flowers', status: 302 },
  { from: '/this-or-that/my-list', to: 'https://thisorthat.hues.flowers/my-list', status: 302 },
  { from: '/this-or-that/admin', to: 'https://thisorthat.hues.flowers/admin', status: 302 },
  { from: '/this-or-that/preview/*', to: 'https://thisorthat.hues.flowers/preview/*', status: 302 },
  { from: '/m/arcade/match', to: 'https://dahliamatch.hues.flowers', status: 302 },
  { from: '/m/arcade/dahlia-match', to: 'https://dahliamatch.hues.flowers', status: 302 },
  { from: '/m/arcade/mahjong', to: 'https://dahliamahjong.hues.flowers', status: 302 },
  { from: '/m/arcade/dahlia-mahjong', to: 'https://dahliamahjong.hues.flowers', status: 302 },
  { from: '/m/arcade/sorting-table', to: 'https://sortingtable.hues.flowers', status: 302 },
  { from: '/m/arcade/season-sort', to: 'https://seasonsort.hues.flowers', status: 302 },
  { from: '/m/arcade/hues-hop', to: 'https://hueshop.hues.flowers', status: 302 },
  { from: '/preview/hues-hop', to: 'https://hueshop.hues.flowers', status: 302 },
  { from: '/preview/hues-hop.html', to: 'https://hueshop.hues.flowers', status: 302 },
]

export interface ResolvedRedirect {
  to: string
  status: 301 | 302
}

/** Resolve a request pathname against the table (exact first, then the longest /* prefix). */
export function resolveRedirect(pathname: string): ResolvedRedirect | null {
  for (const entry of REDIRECTS) {
    if (!entry.from.endsWith('/*') && entry.from === pathname) {
      return { to: entry.to, status: entry.status }
    }
  }
  let best: RedirectEntry | null = null
  for (const entry of REDIRECTS) {
    if (!entry.from.endsWith('/*')) continue
    const prefix = entry.from.slice(0, -1)
    if (pathname.startsWith(prefix) && (best === null || entry.from.length > best.from.length)) {
      best = entry
    }
  }
  if (best === null) return null
  if (best.to.endsWith('/*')) {
    return { to: best.to.slice(0, -1) + pathname.slice(best.from.length - 1), status: best.status }
  }
  return { to: best.to, status: best.status }
}
