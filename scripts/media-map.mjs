// ONE filename map: R2 media key → repo original. Single source of
// truth for media provenance, shared by scripts/check-media.mjs (P1:
// fails the build when a referenced key has no original) and the
// parity harness (P2, scripts/parity/: resolves media requests
// through this module for both sides of every pair).
//
// Unified 2026-11-25 (Hue) from the P1 and P2 versions, which were
// written in parallel runs and conflicted on merge. One mapping
// table (P1's, the superset — it carries the production citations
// and hues/og/music.jpg), both API surfaces:
//   - resolveMediaOriginal(key): pure mapping, no disk check (P1).
//   - resolveMediaKey(key, repoRoot): same table, existence-checked
//     (P2) — a mapped path missing on disk resolves to null.
// The one table disagreement is settled for P1's entry:
// hues/home/procession.webp → public/m-art/painting-1080.webp, the
// /m home hero painting (src/app/m/page.tsx). procession-full.webp
// is a different asset (watercolor spot art), reachable via the
// hues/m-art/ convention.
//
// Extensions may differ between key and original (a .webp key cut
// from a .jpeg photo); the map records the source file, not a
// byte-identical copy.

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const REPO = join(HERE, '..')

export const MEDIA_ORIGIN = 'https://media.hues.flowers'
export const MEDIA_BASE_URL = MEDIA_ORIGIN

/**
 * Explicit key → repo-relative original mappings. One entry per key
 * whose original is NOT the same relative path under a conventional
 * dir.
 *
 * - hues/home/procession.webp: the m-home hero painting
 *   (src/app/m/page.tsx: /m-art/painting-1080.webp, same alt text).
 * - hues/home/hero-golden-hour.webp: the desktop home hero
 *   (src/app/page.tsx: /desktop-art/home-hero-golden-hour-20261112.webp).
 * - hues/home/dusk-string-lights-dahlias.webp: the dusk band photo,
 *   which production renders from
 *   @/images/hues-floral-park-evening-girls.jpeg (src/app/page.tsx +
 *   src/app/m/page.tsx heroImg, same alt text).
 * - hues/park/*: production floral-park imports
 *   (src/app/floral-park/page.tsx: bedsImage → lawn, vistaImage →
 *   sunflower-field, seatingImage → circle-seating, parkImage →
 *   visitors-evening, same alt text) plus the story beds band
 *   (src/app/m/story/page.tsx bedsImg, same alt text).
 * - hues/people/dusty-portrait.webp: production about portrait
 *   (src/app/about/page.tsx: @/images/dusty.jpeg).
 * - hues/og/*: production per-route OG images (one page module
 *   each); music.jpg follows its photographic alt text to the
 *   evening photo — production's own /music/sound-of-hues-og.jpg
 *   is absent from the repo.
 * - hues/dahlias/*-closeup.jpg: the home strip's six photos, which
 *   production renders from the same six cultivar files
 *   (src/app/page.tsx dLabyrinth/dBreakOut/dPenhill/dGolden/
 *   dStrawberry/dThomas).
 * - hues/shell/*: the tab-bar artwork fixtures
 *   (mirrors SHELL_FIXTURES in tests/visual/shell.visual.spec.ts) plus
 *   the phone footer procession art (src/app/m/page.tsx footer).
 */
export const MEDIA_OVERRIDES = {
  'hues/home/procession.webp': 'public/m-art/painting-1080.webp',
  'hues/home/hero-golden-hour.webp': 'public/desktop-art/home-hero-golden-hour-20261112.webp',
  'hues/home/dusk-string-lights-dahlias.webp': 'src/images/hues-floral-park-evening-girls.jpeg',
  'hues/park/dahlia-beds-lawn.jpg': 'src/images/photos/park/P1000179-park-dahlias-lawn.jpg',
  'hues/park/dahlia-beds-sunflower-field.jpg': 'src/images/photos/park/P1000184-park-dahlias-lawn.jpg',
  'hues/park/circle-seating-2025.webp': 'src/images/photos/park/park-circle-seating-2025.jpeg',
  'hues/park/visitors-evening-dahlia-beds.jpeg': 'src/images/hues-floral-park-evening-girls.jpeg',
  'hues/park/flower-beds-day.jpg': 'src/images/hues-floral-park.jpeg',
  'hues/people/dusty-portrait.webp': 'src/images/dusty.jpeg',
  'hues/og/arcade.jpg': 'public/m-og/og-arcade.jpg',
  'hues/og/dahlias.jpg': 'public/m-og/og-dahlias.jpg',
  'hues/og/gather.jpg': 'public/m-og/og-gather.jpg',
  'hues/og/give.jpg': 'public/m-og/og-give.jpg',
  'hues/og/home.webp': 'public/m-og/og-home.jpg',
  'hues/og/music.jpg': 'src/images/hues-floral-park-evening-girls.jpeg',
  'hues/og/season.jpg': 'public/m-og/og-season.jpg',
  'hues/og/story.jpg': 'public/m-og/og-story.jpg',
  'hues/dahlias/labyrinth-closeup.jpg': 'src/images/photos/dahlias/labyrinth/P1000288-Labyrinth.jpg',
  'hues/dahlias/break-out-closeup.jpg': 'src/images/photos/dahlias/break-out/P1000295-Break-Out.jpg',
  'hues/dahlias/strawberry-ice-closeup.jpg':
    'src/images/photos/dahlias/strawberry-ice/P1000470-strawberry-ice-closeup.jpg',
  'hues/dahlias/thomas-edison-closeup.jpg':
    'src/images/photos/dahlias/thomas-edison/P1000273-Thomas-Edison.jpg',
  'hues/dahlias/golden-scepter-closeup.jpg':
    'src/images/photos/dahlias/golden-scepter/P1000413-Golden-Scepter.jpg',
  'hues/dahlias/penhill-autumn-shade-closeup.jpg':
    'src/images/photos/dahlias/penhill-autumn-shade/P1000419-Penhill-Autumn-Shade.jpg',
  'hues/shell/tab-plate.webp': 'public/m-art/tabbar/tabbar-v19-plate.webp',
  'hues/shell/seasons-disc.webp': 'public/m-art/tabbar/tabbar-v18-disc.webp',
  'hues/shell/tab-home.webp': 'public/m-art/tabbar/tabbar-v18-med-home.webp',
  'hues/shell/tab-visit.webp': 'public/m-art/tabbar/tabbar-v18-med-visit.webp',
  'hues/shell/tab-help.webp': 'public/m-art/tabbar/tabbar-v18-med-grow.webp',
  'hues/shell/tab-arcade.webp': 'public/m-art/tabbar/tabbar-v18-med-arcade.webp',
  'hues/shell/tab-music.webp': 'public/m-art/tabbar/tabbar-v18-med-music.webp',
  'hues/shell/tab-more.webp': 'public/m-art/tabbar/tabbar-v18-med-more.webp',
  'hues/shell/procession.webp': 'public/m-art/procession-full.webp',
}

/**
 * Conventional prefixes: the key keeps its relative path under a
 * repo dir. Each entry is [key prefix, repo dir]; matched in order.
 */
export const MEDIA_PREFIX_RULES = [
  ['hues/m-art/', 'public/m-art/'],
  ['hues/seasons/flowers/', 'public/m-art/flowers/'],
  ['hues/seasons/cards/', 'public/m-art/cards/'],
  ['hues/dahlias/', 'src/images/photos/dahlias/'],
  ['hues/arcade-games/', 'public/arcade-games/'],
  ['hues/desktop-art/', 'public/desktop-art/'],
  ['hues/play/', 'public/play/'],
]

/**
 * Resolve a media key to its repo-relative original, or null when
 * the key has no mapped original. Pure mapping — the caller stats
 * the file: a mapped path missing on disk is also a failure
 * ("no original"). (P1 surface, used by check-media.mjs.)
 */
export function resolveMediaOriginal(key) {
  const direct = MEDIA_OVERRIDES[key]
  if (direct !== undefined) return direct
  for (const [prefix, dir] of MEDIA_PREFIX_RULES) {
    if (key.startsWith(prefix) && key.length > prefix.length && !key.includes('..')) {
      return `${dir}${key.slice(prefix.length)}`
    }
  }
  return null
}

/**
 * Same table, existence-checked: a mapped original that is absent
 * on disk resolves to null (a wrong guess is worse than an honest
 * 404). (P2 surface, used by the parity harness.)
 */
export function resolveMediaKey(key, repoRoot = REPO) {
  const rel = resolveMediaOriginal(key)
  if (rel === null) return null
  return existsSync(join(repoRoot, rel)) ? rel : null
}

/** True when the key maps to an original present in the repo. */
export function hasMediaOriginal(key, repoRoot = REPO) {
  return resolveMediaKey(key, repoRoot) !== null
}

/**
 * Extract the R2 key from a media URL: transform URLs
 * (/cdn-cgi/image/<params>/<key>), bare key URLs, and music tracks.
 * Returns null for non-media URLs.
 */
export function mediaKeyFromUrl(url) {
  let parsed
  try {
    parsed = new URL(url)
  } catch {
    return null
  }
  if (parsed.hostname !== 'media.hues.flowers') return null
  const path = parsed.pathname.replace(/^\/+/, '')
  if (path.startsWith('cdn-cgi/image/')) {
    const rest = path.slice('cdn-cgi/image/'.length)
    const slash = rest.indexOf('/')
    if (slash === -1) return null
    return decodeURIComponent(rest.slice(slash + 1))
  }
  return decodeURIComponent(path)
}

const KEY_TOKEN = /hues\/[A-Za-z0-9][A-Za-z0-9._/+-]*/g

function walkFiles(dir, out) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) {
      walkFiles(full, out)
    } else if (/\.(html|js|mjs|css|json|xml|txt|webmanifest)$/.test(entry)) {
      out.push(full)
    }
  }
  return out
}

/**
 * Every media key the built staging site references: full transform
 * URLs decoded to keys, plus bare hues/ tokens under a known prefix
 * (runtime transformUrl calls embed the key, not the URL). Skips
 * lookalikes from other hues/* namespaces (eslint rules, packages).
 */
export function collectMediaKeys(clientDir = join(REPO, 'dist', 'client')) {
  const keys = new Set()
  for (const file of walkFiles(clientDir, [])) {
    const text = readFileSync(file, 'utf8')
    for (const match of text.matchAll(/https:\/\/media\.hues\.flowers\/[^\s"'<>]+/g)) {
      const key = mediaKeyFromUrl(match[0].replace(/[),;]+$/, ''))
      if (key !== null && key.startsWith('hues/')) keys.add(key)
    }
    for (const match of text.matchAll(KEY_TOKEN)) {
      const key = match[0]
      if (MEDIA_OVERRIDES[key] !== undefined) {
        keys.add(key)
      } else if (MEDIA_PREFIX_RULES.some(([prefix]) => key.startsWith(prefix))) {
        keys.add(key)
      }
    }
  }
  return [...keys].sort()
}
