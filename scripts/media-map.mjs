// Filename map: every R2 media key (hues/...) the SPA references → the
// repo file it was uploaded from. Single source of truth for media
// provenance: scripts/check-media.mjs fails the build when a referenced
// key has no original here (P1), and the P2 parity harness resolves media
// requests through this same module.
//
// Conventions carry most keys (same relative path under a repo dir); the
// EXPLICIT table pins the editorial crops and renames, each with the
// production source that identifies the original. Extensions may differ
// between key and original (a .webp key cut from a .jpeg photo); the map
// records the source file, not a byte-identical copy.

export const MEDIA_ORIGIN = 'https://media.hues.flowers'

/**
 * Explicit key → repo-relative original mappings. One entry per key whose
 * original is NOT the same relative path under a conventional dir.
 *
 * - hues/home/procession.webp: the m-home hero painting
 *   (src/app/m/page.tsx: /m-art/painting-1080.webp, same alt text).
 * - hues/home/hero-golden-hour.webp: the desktop home hero
 *   (src/app/page.tsx: /desktop-art/home-hero-golden-hour-20261112.webp).
 * - hues/home/dusk-string-lights-dahlias.webp: the dusk band photo, which
 *   production renders from @/images/hues-floral-park-evening-girls.jpeg
 *   (src/app/page.tsx + src/app/m/page.tsx heroImg, same alt text).
 * - hues/park/*: production floral-park imports
 *   (src/app/floral-park/page.tsx: bedsImage → lawn, vistaImage →
 *   sunflower-field, seatingImage → circle-seating, parkImage →
 *   visitors-evening, same alt text).
 * - hues/people/dusty-portrait.webp: production about portrait
 *   (src/app/about/page.tsx: @/images/dusty.jpeg).
 * - hues/og/*: production per-route OG images (one page module each);
 *   music.jpg follows its photographic alt text to the evening photo —
 *   production's own /music/sound-of-hues-og.jpg is absent from the repo.
 * - hues/dahlias/*-closeup.jpg: the home strip's six photos, which
 *   production renders from the same six cultivar files
 *   (src/app/page.tsx dLabyrinth/dBreakOut/dPenhill/dGolden/dStrawberry/
 *   dThomas).
 * - hues/shell/*: the tab-bar artwork fixtures
 *   (mirrors SHELL_FIXTURES in tests/visual/shell.visual.spec.ts).
 */
const EXPLICIT = new Map([
  ['hues/home/procession.webp', 'public/m-art/painting-1080.webp'],
  ['hues/home/hero-golden-hour.webp', 'public/desktop-art/home-hero-golden-hour-20261112.webp'],
  ['hues/home/dusk-string-lights-dahlias.webp', 'src/images/hues-floral-park-evening-girls.jpeg'],
  ['hues/park/dahlia-beds-lawn.jpg', 'src/images/photos/park/P1000179-park-dahlias-lawn.jpg'],
  ['hues/park/dahlia-beds-sunflower-field.jpg', 'src/images/photos/park/P1000184-park-dahlias-lawn.jpg'],
  ['hues/park/circle-seating-2025.webp', 'src/images/photos/park/park-circle-seating-2025.jpeg'],
  ['hues/park/visitors-evening-dahlia-beds.jpeg', 'src/images/hues-floral-park-evening-girls.jpeg'],
  ['hues/people/dusty-portrait.webp', 'src/images/dusty.jpeg'],
  ['hues/og/arcade.jpg', 'public/m-og/og-arcade.jpg'],
  ['hues/og/dahlias.jpg', 'public/m-og/og-dahlias.jpg'],
  ['hues/og/gather.jpg', 'public/m-og/og-gather.jpg'],
  ['hues/og/give.jpg', 'public/m-og/og-give.jpg'],
  ['hues/og/home.webp', 'public/m-og/og-home.jpg'],
  ['hues/og/music.jpg', 'src/images/hues-floral-park-evening-girls.jpeg'],
  ['hues/og/season.jpg', 'public/m-og/og-season.jpg'],
  ['hues/og/story.jpg', 'public/m-og/og-story.jpg'],
  ['hues/dahlias/labyrinth-closeup.jpg', 'src/images/photos/dahlias/labyrinth/P1000288-Labyrinth.jpg'],
  ['hues/dahlias/break-out-closeup.jpg', 'src/images/photos/dahlias/break-out/P1000295-Break-Out.jpg'],
  [
    'hues/dahlias/strawberry-ice-closeup.jpg',
    'src/images/photos/dahlias/strawberry-ice/P1000470-strawberry-ice-closeup.jpg',
  ],
  [
    'hues/dahlias/thomas-edison-closeup.jpg',
    'src/images/photos/dahlias/thomas-edison/P1000273-Thomas-Edison.jpg',
  ],
  [
    'hues/dahlias/golden-scepter-closeup.jpg',
    'src/images/photos/dahlias/golden-scepter/P1000413-Golden-Scepter.jpg',
  ],
  [
    'hues/dahlias/penhill-autumn-shade-closeup.jpg',
    'src/images/photos/dahlias/penhill-autumn-shade/P1000419-Penhill-Autumn-Shade.jpg',
  ],
  ['hues/shell/tab-plate.webp', 'public/m-art/tabbar/tabbar-v19-plate.webp'],
  ['hues/shell/seasons-disc.webp', 'public/m-art/tabbar/tabbar-v18-disc.webp'],
  ['hues/shell/tab-home.webp', 'public/m-art/tabbar/tabbar-v18-med-home.webp'],
  ['hues/shell/tab-visit.webp', 'public/m-art/tabbar/tabbar-v18-med-visit.webp'],
  ['hues/shell/tab-help.webp', 'public/m-art/tabbar/tabbar-v18-med-grow.webp'],
  ['hues/shell/tab-arcade.webp', 'public/m-art/tabbar/tabbar-v18-med-arcade.webp'],
  ['hues/shell/tab-music.webp', 'public/m-art/tabbar/tabbar-v18-med-music.webp'],
  ['hues/shell/tab-more.webp', 'public/m-art/tabbar/tabbar-v18-med-more.webp'],
])

/**
 * Conventional prefixes: the key keeps its relative path under a repo dir.
 * Each entry is [key prefix, repo dir]; matched in order.
 */
const CONVENTIONS = [
  ['hues/m-art/', 'public/m-art/'],
  ['hues/seasons/flowers/', 'public/m-art/flowers/'],
  ['hues/seasons/cards/', 'public/m-art/cards/'],
  ['hues/dahlias/', 'src/images/photos/dahlias/'],
  ['hues/arcade-games/', 'public/arcade-games/'],
  ['hues/desktop-art/', 'public/desktop-art/'],
  ['hues/play/', 'public/play/'],
]

/**
 * Resolve a media key to its repo-relative original, or null when the key
 * has no mapped original. The caller stats the file: a mapped path that
 * is missing on disk is also a failure ("no original").
 */
export function resolveMediaOriginal(key) {
  const explicit = EXPLICIT.get(key)
  if (explicit !== undefined) return explicit
  for (const [prefix, dir] of CONVENTIONS) {
    if (key.startsWith(prefix) && key.length > prefix.length && !key.includes('..')) {
      return `${dir}${key.slice(prefix.length)}`
    }
  }
  return null
}
