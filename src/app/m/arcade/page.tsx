import { type Metadata } from 'next'

import PlayHub from './PlayHub'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  alternates: { canonical: '/m/arcade' },
  title: 'Hues Arcade',
  description:
    'Hues Arcade — little games to play among the flowers.',
  openGraph: {
    title: 'Hues Arcade — Hues Floral Park',
    description:
      'Little games to play among the flowers — Hue and Cocoa presiding.',
    url: 'https://hues.flowers/m/arcade',
    siteName: 'Hues Floral Park',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: '/m-og/og-arcade.jpg',
        width: 1200,
        height: 630,
        alt: 'Hue and Cocoa at their arcade flower stall — a watercolor',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hues Arcade — Hues Floral Park',
    description:
      'Little games to play among the flowers — Hue and Cocoa presiding.',
    images: ['/m-og/og-arcade.jpg'],
  },
}

// Connection warming (2026-11-13): all six games live on their own
// subdomains, so every hub → game tap crosses origins and would
// otherwise pay a cold DNS + TLS + load. The dns-prefetch /
// preconnect hints below (rendered the same way /m/layout.tsx
// renders its font preconnects — React hoists <link> to <head>)
// warm DNS + TLS for all six origins on hub load, featherweight.
// No game document is fetched eagerly: the static speculation
// rule is prefetch-only at "conservative" eagerness (the browser
// only acts on it once a tap looks likely, e.g. pointerdown), and
// the per-card prerender on hover/touch lives in PlayHub.
const GAME_ORIGINS = [
  'https://hueshop.hues.flowers',
  'https://dahliamatch.hues.flowers',
  'https://dahliamahjong.hues.flowers',
  'https://sortingtable.hues.flowers',
  'https://seasonsort.hues.flowers',
  'https://thisorthat.hues.flowers',
] as const

const PREFETCH_RULES = JSON.stringify({
  prefetch: [{ urls: [...GAME_ORIGINS], eagerness: 'conservative' }],
})

export default function MobilePlay() {
  // Games only since 2026-10-31 — the hub is static links now, so
  // this page no longer fetches the play state (Gather and Give
  // fetch it on their own pages).
  return (
    <>
      {GAME_ORIGINS.map((origin) => (
        <link key={`dns-${origin}`} rel="dns-prefetch" href={origin} />
      ))}
      {GAME_ORIGINS.map((origin) => (
        <link key={`pre-${origin}`} rel="preconnect" href={origin} />
      ))}
      <script
        type="speculationrules"
        dangerouslySetInnerHTML={{ __html: PREFETCH_RULES }}
      />
      <PlayHub />
    </>
  )
}
