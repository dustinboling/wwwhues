// Canonical route inventory for the hues.flowers SPA — the single source
// the sitemap AND llms.txt generate from (Data #1.9: generated, never
// hand-maintained). Only routes this build serves are listed: later slices
// append their routes here (/help, /account, SPA surfaces) and both
// artefacts grow with them.
//
// lastmod follows Data #1.3: a date appears here only where the source
// states a trustworthy per-URL change date (the policy pages' "Last
// updated" lines). Everywhere else it is omitted — build-time stamping
// is prohibited. priority/changefreq are never emitted (Google ignores
// both).

export interface RouteEntry {
  path: string
  /** Link label for llms.txt. */
  label: string
  /** One-line summary for llms.txt. */
  summary: string
  /** Trustworthy change date (YYYY-MM-DD) or undefined when none exists. */
  lastmod?: string
}

export const CANONICAL_ROUTES: RouteEntry[] = [
  { path: '/', label: 'Hues Floral Park', summary: 'a u-pick flower farm and garden park in Junction City, Oregon.' },
  {
    path: '/visit',
    label: 'Plan your visit',
    summary: 'hours, admission, directions, and answers to common questions.',
  },
  {
    path: '/floral-park',
    label: 'Hues Floral Park',
    summary: 'the story of the park — a flower farm designed for wandering, music, and wonder.',
  },
  {
    path: '/how-u-cut-works',
    label: 'How U-cut works',
    summary: 'how picking your own bouquet works, with a cutting guide.',
  },
  {
    path: '/working-on',
    label: 'What we’re working on',
    summary: 'the quiet-season work behind next spring.',
  },
  {
    path: '/volunteer',
    label: 'Volunteer',
    summary: 'garden tasks and times to lend a hand.',
  },
  {
    path: '/nursery',
    label: 'The Flower Nursery',
    summary: 'cut flower starts for home gardens (coming soon).',
  },
  {
    path: '/about',
    label: 'About',
    summary: 'Dusty’s story and how the park came to be.',
  },
  {
    path: '/gather',
    label: 'Gather',
    summary: 'project events — one day, one project, good company.',
  },
  {
    path: '/sponsor',
    label: 'Sponsor',
    summary: 'small ways to help the park grow.',
  },
  {
    path: '/privacy',
    label: 'Privacy Policy',
    summary: 'how the park collects, uses, and protects your information.',
    lastmod: '2026-11-12',
  },
  {
    path: '/terms',
    label: 'Terms of Service',
    summary: 'the terms for using the website.',
    lastmod: '2026-11-12',
  },
  {
    path: '/arcade',
    label: 'Hues Arcade',
    summary: 'little games to play among the flowers.',
  },
  {
    path: '/whats-in-season',
    label: 'What’s in season',
    summary: 'the year in blooms — spring, summer, and fall at the park.',
  },
  {
    path: '/season/spring',
    label: 'Spring at Hues',
    summary: 'daffodils, the Mother’s Day beds, and the May borders.',
  },
  {
    path: '/season/summer',
    label: 'Summer at Hues',
    summary: 'the cottage beds, and the first dahlias of August.',
  },
  {
    path: '/season/fall',
    label: 'Fall at Hues',
    summary: 'dahlias at their September peak, until the first hard frost.',
  },
  {
    path: '/dahlias',
    label: 'Dusty’s dahlias',
    summary: 'the full cultivar collection, A to Z.',
  },
  {
    path: '/music',
    label: 'The Music of Hues',
    summary: 'the Sound of Hues — 38 songs, with vocals and instrumentals.',
  },
]
