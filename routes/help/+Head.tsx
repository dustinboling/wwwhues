import type { JSX } from 'react'
import { RouteHead } from '../../content/head'
import {
  HELP_HERO,
  HELP_OG_IMAGE_ALT,
  HELP_OG_IMAGE_KEY,
  HELP_TWITTER_DESCRIPTION,
  HELP_TWITTER_TITLE,
} from '../../content/help'

// Help <head>: the root entity graph only — the live hub carries no
// page-specific JSON-LD, so none is added here.
export default function Head(): JSX.Element {
  return (
    <RouteHead
      path="/help"
      twitterTitle={HELP_TWITTER_TITLE}
      twitterDescription={HELP_TWITTER_DESCRIPTION}
      ogImageKey={HELP_OG_IMAGE_KEY}
      ogImageAlt={HELP_OG_IMAGE_ALT}
      hero={{ src: HELP_HERO.artKey, slot: 'hero', kind: 'photo' }}
    />
  )
}
