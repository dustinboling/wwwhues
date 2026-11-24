// Non-HTML route generators (plan §2.1): sitemap, robots, feed, llms.txt,
// and the web manifest. Pure functions of the content sources, so the
// unit tests pin their contracts without a build, and the Vike pages in
// routes/ only set pageContext.content from them.

import { Feed } from 'feed'
import { CANONICAL_ROUTES } from './routes'
import { SITE_URL } from './site'

/** Sitemap: canonical indexables only, honest lastmod, no priority/changefreq (Data #1.3). */
export function buildSitemapXml(): string {
  const urls = CANONICAL_ROUTES.map((route) => {
    const lastmod =
      route.lastmod === undefined ? '' : `\n    <lastmod>${route.lastmod}</lastmod>`
    return `  <url>\n    <loc>${SITE_URL}${route.path === '/' ? '/' : route.path}</loc>${lastmod}\n  </url>`
  }).join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
}

// Working tools, not pages for visitors or crawlers — the current
// site's list (src/app/robots.ts), with the admin path moved per the N2
// ruling (/play/admin → /arcade/admin; /play/admin itself is a 301 now).
const ROBOT_DISALLOWS = [
  '/volunteer/admin',
  '/this-or-that/admin',
  '/arcade/admin',
  '/api/',
]

// The AI *search* crawlers are named and welcomed explicitly (2026-11-10,
// SEO/GEO pass): the bots that read the site to answer questions in
// ChatGPT, Claude, Perplexity and friends. Training crawlers are governed
// by the zone's managed content signals, not here.
const AI_SEARCH_BOTS = [
  'OAI-SearchBot',
  'ChatGPT-User',
  'Claude-SearchBot',
  'Claude-User',
  'PerplexityBot',
  'Perplexity-User',
  'Applebot',
  'Bingbot',
]

// Sort, page-size, and session parameters stay out of the crawl
// (Data #1.5 defaults). Slice C's dahlias parameter policy table adopts
// these spellings or amends this list with them.
const PARAM_DISALLOWS = ['/*?*sort=', '/*?*page-size=', '/*?*session=']

/**
 * robots.txt: semantics byte-identical to the current site's, plus the
 * specced disallows (N2 admin move + Data #1.5 parameter rules).
 */
export function buildRobotsTxt(): string {
  const disallows = [...ROBOT_DISALLOWS, ...PARAM_DISALLOWS]
    .map((path) => `Disallow: ${path}`)
    .join('\n')
  const star = `User-Agent: *\nAllow: /\n${disallows}`
  const bots = `${AI_SEARCH_BOTS.map((bot) => `User-Agent: ${bot}`).join('\n')}\nAllow: /\n${disallows}`
  return `${star}\n\n${bots}\n\nSitemap: ${SITE_URL}/sitemap.xml\n`
}

/** Feed: a port of src/app/feed.xml/route.ts — same channel, no items, as today. */
export function buildFeedXml(): string {
  const feed = new Feed({
    title: 'Hues Flower Farm & Nursery',
    description:
      'News and notes from Hues Floral Park, a u-pick flower farm and garden park in Junction City, Oregon.',
    author: {
      name: 'Dusty Hues',
      email: 'dustin@dustinboling.com',
    },
    id: SITE_URL,
    link: SITE_URL,
    image: `${SITE_URL}/og-image.jpg`,
    favicon: `${SITE_URL}/favicon.ico`,
    copyright: `All rights reserved ${new Date().getFullYear()}`,
    feedLinks: {
      rss2: `${SITE_URL}/feed.xml`,
    },
  })
  return feed.rss2()
}

const LLMS_SUMMARY =
  'Hues Floral Park (Hues Flower Farm & Nursery) is a u-pick flower farm and immersive garden park in Junction City, Oregon, near Eugene. Visitors wander curated cottage beds, listen to music drifting over the flowers, and cut their own bouquets — dahlias are the specialty, with peak bloom in September.'

// Key facts, carried verbatim from the current llms.txt. Each fact's
// owner content module is named; where the owner page is built, the
// wording matches it — where it is not (music counts, bloom calendar),
// the line stays as published until its slice single-sources it.
const LLMS_FACTS = [
  'Location: 93485 River Road, Junction City, OR 97448. The visitor entrance is on Browns Landing Rd, just off River Road — about twenty minutes from Eugene, five from Junction City.',
  'Phone: (458) 245-1323',
  'Park hours: open every day, all year, 9:30 AM to sunset.',
  'Picking season: U-pick flowers run from spring to the first hard frost (the 2026 picking season ended October 24, 2026). The park itself stays open all winter — only the picking closes.',
  'U-cut flowers: free to enter and wander. Choose a bouquet size on arrival and pay before you cut. Hues provides the clippers and bucket; personal clippers and buckets are not allowed in the park.',
  'Bloom calendar: spring brings daffodils, lupine, columbine, iris and alliums, with peonies and the Mother\'s Day beds in May; summer brings the cottage beds; dahlias begin in August and peak in September, blooming until the first frost.',
  'Park animals: visitors can feed the ducks and chickens (food for them is available for purchase at the park), and visit Hue and Cocoa, the park’s two Angora bunnies. The ducks roam the park and its ponds, the chickens keep to their run, and koi live in the pond.',
  'Policies: no pets (they scare the park animals), no smoking inside the park, and no loud phone conversations. Photography sessions are welcome with a U-cut ticket. Day visits only — no RVs, camping, or overnight stays. Children are welcome.',
  'Music: the park\'s own easy-listening songs, The Sound of Hues — 38 songs, 19 with vocals and 19 instrumentals — play in the park and stream on the website.',
  'The nursery sells cut flower starts for home gardens (coming soon).',
  'Volunteers and project days: garden tasks and group project events run through the year; sign-up is on the website, no account needed.',
  'Founded and run by Dusty Boling, a former Disneyland Jungle Cruise skipper turned flower farmer.',
]

const LLMS_ELSEWHERE = [
  'Instagram: https://www.instagram.com/huesflowers',
  'Facebook: https://www.facebook.com/HuesFlowerFarm',
  'TikTok: https://www.tiktok.com/@www.hues.flowers',
]

/**
 * llms.txt, generated from the same route source as the sitemap
 * (Data #1.9) — the Pages section enumerates every canonical route but
 * the root, so a route can never exist without being listed here.
 */
export function buildLlmsTxt(): string {
  const pages = CANONICAL_ROUTES.filter((route) => route.path !== '/')
    .map((route) => `- [${route.label}](${SITE_URL}${route.path}): ${route.summary}`)
    .join('\n')
  const facts = LLMS_FACTS.map((fact) => `- ${fact}`).join('\n')
  const elsewhere = LLMS_ELSEWHERE.map((line) => `- ${line}`).join('\n')
  return `# Hues Floral Park\n\n> ${LLMS_SUMMARY}\n\n## Key facts\n\n${facts}\n\n## Pages\n\n${pages}\n\n## Elsewhere\n\n${elsewhere}\n`
}

/** Web manifest: a port of src/app/manifest.ts. Icon files land with the PWA slice. */
export function buildManifestJson(): string {
  return (
    JSON.stringify(
      {
        name: 'Hues Floral Park',
        short_name: 'Hues',
        description:
          'Hues Floral Park — a U-pick flower farm and garden park in Junction City, Oregon. A little world apart.',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        // eslint-disable-next-line hues/no-raw-hex -- manifest.ts port: byte-identical colors.
        background_color: '#f7f1de',
        // eslint-disable-next-line hues/no-raw-hex -- port of manifest.ts (see above).
        theme_color: '#23362b',
        icons: [
          {
            src: '/m-icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/m-icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/m-icons/icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      null,
      2,
    ) + '\n'
  )
}
