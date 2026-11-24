import type { JSX, ReactNode } from 'react'
import { heroPreloadLink, transformUrl } from '@hues/ui'
import type { MediaSlot } from '@hues/ui'
import { BUSINESS_JSONLD, SITE_URL, THEME_COLOR } from './site'
import frauncesLatin from '@hues/fonts/files/fraunces-roman-latin.woff2?url'
import newsreaderLatin from '@hues/fonts/files/newsreader-roman-latin.woff2?url'

export interface RouteHeadHero {
  src: string
  slot?: MediaSlot
  kind?: 'photo' | 'plate'
}

interface RouteHeadProps {
  /** Canonical path, e.g. '/visit'. */
  path: string
  twitterTitle: string
  twitterDescription: string
  ogImageKey: string
  ogImageAlt: string
  /** The route's lead visual: its only image preload (Perf #11). */
  hero?: RouteHeadHero
  /** Page-specific JSON-LD blocks; the root @graph is always included. */
  jsonLd?: unknown[]
  children?: ReactNode
}

// Shared <head> for the Slice B content routes (Bea §1.5: canonical,
// OG/Twitter, JSON-LD, font + hero preloads, theme-color). <title>, meta
// description, og:title, and og:description come from +title/+description
// via vike-react — never duplicated here. Note the deliberate
// normalization: og:title/og:description follow the page title and
// description, where the current site carries shorter OG variants on some
// routes; the twitter tags below keep the source's twitter copy.
export function RouteHead({
  path,
  twitterTitle,
  twitterDescription,
  ogImageKey,
  ogImageAlt,
  hero,
  jsonLd = [],
  children,
}: RouteHeadProps): JSX.Element {
  const canonical = path === '/' ? `${SITE_URL}/` : `${SITE_URL}${path}`
  const ogImage = transformUrl({ key: ogImageKey, width: 1024 })
  const heroPreload =
    hero === undefined
      ? null
      : heroPreloadLink({ src: hero.src, slot: hero.slot ?? 'hero', kind: hero.kind })
  return (
    <>
      <link rel="canonical" href={canonical} />
      <meta name="robots" content="index, follow" />
      <meta name="theme-color" content={THEME_COLOR} />
      <link rel="apple-touch-icon" href="/m-icons/apple-touch-icon.png" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="Hues" />
      <link rel="preconnect" href="https://media.hues.flowers" />
      <link rel="preload" href={frauncesLatin} as="font" type="font/woff2" crossOrigin="anonymous" />
      <link rel="preload" href={newsreaderLatin} as="font" type="font/woff2" crossOrigin="anonymous" />
      {heroPreload !== null && (
        <link
          rel={heroPreload.rel}
          as={heroPreload.as}
          imageSrcSet={heroPreload.imageSrcSet}
          imageSizes={heroPreload.imageSizes}
        />
      )}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="Hues Floral Park" />
      <meta property="og:locale" content="en_US" />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:alt" content={ogImageAlt} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={twitterTitle} />
      <meta name="twitter:description" content={twitterDescription} />
      <meta name="twitter:image" content={ogImage} />
      <link rel="alternate" type="application/rss+xml" href="/feed.xml" />
      <link rel="manifest" href="/manifest.webmanifest" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(BUSINESS_JSONLD) }}
      />
      {jsonLd.map((block, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(block) }}
        />
      ))}
      {children}
    </>
  )
}
