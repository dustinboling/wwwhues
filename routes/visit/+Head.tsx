import type { JSX } from 'react'
import { RouteHead } from '../../content/head'
import {
  VISIT_FAQS,
  VISIT_HERO,
  VISIT_OG_IMAGE_ALT,
  VISIT_OG_IMAGE_KEY,
  VISIT_TWITTER_DESCRIPTION,
  VISIT_TWITTER_TITLE,
  buildFaqJsonLd,
} from '../../content/visit'

// Visit <head>: the shared route head plus FAQPage JSON-LD built from the
// same faqs source the page renders (Data #1.7 single-source rule).
export default function Head(): JSX.Element {
  return (
    <RouteHead
      path="/visit"
      twitterTitle={VISIT_TWITTER_TITLE}
      twitterDescription={VISIT_TWITTER_DESCRIPTION}
      ogImageKey={VISIT_OG_IMAGE_KEY}
      ogImageAlt={VISIT_OG_IMAGE_ALT}
      hero={{ src: VISIT_HERO.artKey, slot: 'hero', kind: 'photo' }}
      jsonLd={[buildFaqJsonLd(VISIT_FAQS)]}
    />
  )
}
