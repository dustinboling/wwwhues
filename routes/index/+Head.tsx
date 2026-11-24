import type { JSX } from 'react'
import { heroPreloadLink, transformUrl } from '@hues/ui'
import {
  BUSINESS_JSONLD,
  HOME_KEYWORDS,
  HOME_TITLE,
  SITE_DESCRIPTION,
  SITE_URL,
  THEME_COLOR,
} from '../../content/site'
import { HERO, OG_IMAGE_KEY } from '../../content/home'
import frauncesLatin from '@hues/fonts/files/fraunces-roman-latin.woff2?url'
import newsreaderLatin from '@hues/fonts/files/newsreader-roman-latin.woff2?url'

// Home <head> additions (Bea §1.5: canonical, OG/Twitter, JSON-LD, font +
// hero preloads, theme-color). <title>, meta description, og:title,
// og:description, and the viewport tag come from +title/+description and
// vike-react itself — never duplicated here.
export default function Head(): JSX.Element {
  const heroPreload = heroPreloadLink({ src: HERO.artKey, slot: 'hero', kind: 'plate' })
  const ogImage = transformUrl({ key: OG_IMAGE_KEY, width: 1024 })
  return (
    <>
      <link rel="canonical" href={`${SITE_URL}/`} />
      <meta name="robots" content="index, follow" />
      <meta name="keywords" content={HOME_KEYWORDS.join(', ')} />
      <meta name="theme-color" content={THEME_COLOR} />
      <link rel="preconnect" href="https://media.hues.flowers" />
      <link rel="preload" href={frauncesLatin} as="font" type="font/woff2" crossOrigin="anonymous" />
      <link rel="preload" href={newsreaderLatin} as="font" type="font/woff2" crossOrigin="anonymous" />
      <link
        rel={heroPreload.rel}
        as={heroPreload.as}
        imageSrcSet={heroPreload.imageSrcSet}
        imageSizes={heroPreload.imageSizes}
      />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="Hues Floral Park" />
      <meta property="og:locale" content="en_US" />
      <meta property="og:url" content={`${SITE_URL}/`} />
      <meta property="og:image" content={ogImage} />
      <meta
        property="og:image:alt"
        content="Dahlia beds at Hues Floral Park in Junction City, Oregon"
      />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={HOME_TITLE} />
      <meta name="twitter:description" content={SITE_DESCRIPTION} />
      <meta name="twitter:image" content={ogImage} />
      <link rel="alternate" type="application/rss+xml" href="/feed.xml" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(BUSINESS_JSONLD) }} />
    </>
  )
}
