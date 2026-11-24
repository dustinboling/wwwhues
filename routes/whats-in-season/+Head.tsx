import type { JSX } from 'react'
import { RouteHead } from '../../content/head'
import {
  SEASONS_OG_IMAGE_ALT,
  SEASONS_OG_IMAGE_KEY,
  SEASONS_TWITTER_DESCRIPTION,
  SEASONS_TWITTER_TITLE,
} from '../../content/seasons'

// Season hub <head>: the shared route head. The hub carries no
// lead-visual preload — its season panels are decorative card art.
export default function Head(): JSX.Element {
  return (
    <RouteHead
      path="/whats-in-season"
      twitterTitle={SEASONS_TWITTER_TITLE}
      twitterDescription={SEASONS_TWITTER_DESCRIPTION}
      ogImageKey={SEASONS_OG_IMAGE_KEY}
      ogImageAlt={SEASONS_OG_IMAGE_ALT}
    />
  )
}
