// ONE filename map: R2 media key → repo original. Shared by the parity
// harness (P2, scripts/parity/) and the media check (P1,
// scripts/check-media.mjs): both sides of every parity pair resolve media
// requests through this module, and P1 fails the build when a key listed
// in dist/ has no original here.
//
// NOTE (P1 overlap): this module is the shared shape P1's check-media was
// specified to introduce. P2 creates it first because the harness needs
// it; P1 should import it rather than invent a second map.

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const REPO = join(HERE, '..')

export const MEDIA_BASE_URL = 'https://media.hues.flowers'

/** Keys whose original was renamed on upload (key → repo-relative file). */
export const MEDIA_OVERRIDES = {
  // Shell art (the live /m filenames — see tests/visual/shell.visual.spec.ts).
  'hues/shell/tab-plate.webp': 'public/m-art/tabbar/tabbar-v19-plate.webp',
  'hues/shell/seasons-disc.webp': 'public/m-art/tabbar/tabbar-v18-disc.webp',
  'hues/shell/tab-home.webp': 'public/m-art/tabbar/tabbar-v18-med-home.webp',
  'hues/shell/tab-visit.webp': 'public/m-art/tabbar/tabbar-v18-med-visit.webp',
  'hues/shell/tab-help.webp': 'public/m-art/tabbar/tabbar-v18-med-grow.webp',
  'hues/shell/tab-arcade.webp': 'public/m-art/tabbar/tabbar-v18-med-arcade.webp',
  'hues/shell/tab-music.webp': 'public/m-art/tabbar/tabbar-v18-med-music.webp',
  'hues/shell/tab-more.webp': 'public/m-art/tabbar/tabbar-v18-med-more.webp',
  // Home (production paths from src/app/page.tsx).
  'hues/home/hero-golden-hour.webp': 'public/desktop-art/home-hero-golden-hour-20261112.webp',
  'hues/home/procession.webp': 'public/m-art/procession-full.webp',
  'hues/home/dusk-string-lights-dahlias.webp': 'src/images/hues-floral-park-evening-girls.jpeg',
  // Park (production paths from src/app/floral-park/page.tsx).
  'hues/park/circle-seating-2025.webp': 'src/images/photos/park/park-circle-seating-2025.jpeg',
  'hues/park/dahlia-beds-lawn.jpg': 'src/images/photos/park/P1000179-park-dahlias-lawn.jpg',
  'hues/park/dahlia-beds-sunflower-field.jpg': 'src/images/photos/park/P1000184-park-dahlias-lawn.jpg',
  'hues/park/visitors-evening-dahlia-beds.jpeg': 'src/images/hues-floral-park-evening-girls.jpeg',
  // People (production path from src/app/about/page.tsx).
  'hues/people/dusty-portrait.webp': 'src/images/dusty.jpeg',
  // OG images (meta only — never rendered as <img>).
  'hues/og/arcade.jpg': 'public/m-og/og-arcade.jpg',
  'hues/og/dahlias.jpg': 'public/m-og/og-dahlias.jpg',
  'hues/og/gather.jpg': 'public/m-og/og-gather.jpg',
  'hues/og/give.jpg': 'public/m-og/og-give.jpg',
  'hues/og/home.webp': 'public/m-og/og-home.jpg',
  'hues/og/season.jpg': 'public/m-og/og-season.jpg',
  'hues/og/story.jpg': 'public/m-og/og-story.jpg',
  // Home strip close-ups are the cultivars' own photos under flat keys.
  'hues/dahlias/break-out-closeup.jpg': 'src/images/photos/dahlias/break-out/P1000295-Break-Out.jpg',
  'hues/dahlias/golden-scepter-closeup.jpg':
    'src/images/photos/dahlias/golden-scepter/P1000413-Golden-Scepter.jpg',
  'hues/dahlias/labyrinth-closeup.jpg': 'src/images/photos/dahlias/labyrinth/P1000288-Labyrinth.jpg',
  'hues/dahlias/penhill-autumn-shade-closeup.jpg':
    'src/images/photos/dahlias/penhill-autumn-shade/P1000419-Penhill-Autumn-Shade.jpg',
  'hues/dahlias/strawberry-ice-closeup.jpg':
    'src/images/photos/dahlias/strawberry-ice/P1000470-strawberry-ice-closeup.jpg',
  'hues/dahlias/thomas-edison-closeup.jpg':
    'src/images/photos/dahlias/thomas-edison/P1000273-Thomas-Edison.jpg',
}

/**
 * Prefix rules (key prefix → repo dir): the key's remainder names the
 * file. Overrides win; a prefix hit whose file is absent is unmapped
 * (a wrong guess is worse than an honest 404).
 */
export const MEDIA_PREFIX_RULES = [
  ['hues/arcade-games/', 'public/arcade-games/'],
  ['hues/dahlias/', 'src/images/photos/dahlias/'],
  ['hues/desktop-art/', 'public/desktop-art/'],
  ['hues/m-art/', 'public/m-art/'],
  ['hues/play/', 'public/play/'],
  ['hues/seasons/cards/', 'public/m-art/cards/'],
  ['hues/seasons/flowers/', 'public/m-art/flowers/'],
]

/**
 * Map a media key to its repo-relative original, or null when the key
 * has no mapped original on disk. Pure mapping — no guessing.
 */
export function resolveMediaKey(key, repoRoot = REPO) {
  const direct = MEDIA_OVERRIDES[key]
  if (direct !== undefined && existsSync(join(repoRoot, direct))) return direct
  if (direct !== undefined) return null
  for (const [prefix, dir] of MEDIA_PREFIX_RULES) {
    if (key.startsWith(prefix)) {
      const rel = `${dir}${key.slice(prefix.length)}`
      return existsSync(join(repoRoot, rel)) ? rel : null
    }
  }
  return null
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

/** True when the key maps to an original present in the repo. */
export function hasMediaOriginal(key, repoRoot = REPO) {
  return resolveMediaKey(key, repoRoot) !== null
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
