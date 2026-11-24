import type { JSX } from 'react'
import { RouteHead } from '../../content/head'
import {
  DAHLIAS,
  DAHLIAS_HERO,
  DAHLIAS_OG_IMAGE_ALT,
  DAHLIAS_OG_IMAGE_KEY,
  DAHLIAS_TWITTER_DESCRIPTION,
  DAHLIAS_TWITTER_TITLE,
  buildDahliasItemListJsonLd,
} from '../../content/dahlias'

// Dahlias <head>: the shared route head plus the collection ItemList
// JSON-LD built from the same cultivars source the page renders.
export default function Head(): JSX.Element {
  return (
    <RouteHead
      path="/dahlias"
      twitterTitle={DAHLIAS_TWITTER_TITLE}
      twitterDescription={DAHLIAS_TWITTER_DESCRIPTION}
      ogImageKey={DAHLIAS_OG_IMAGE_KEY}
      ogImageAlt={DAHLIAS_OG_IMAGE_ALT}
      hero={{ src: DAHLIAS_HERO.artKey, slot: 'hero', kind: 'photo' }}
      jsonLd={[buildDahliasItemListJsonLd(DAHLIAS)]}
    />
  )
}
