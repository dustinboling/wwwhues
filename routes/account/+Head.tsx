import type { JSX } from 'react'
import { RouteHead } from '../../content/head'
import {
  ACCOUNT_OG_IMAGE_ALT,
  ACCOUNT_OG_IMAGE_KEY,
  ACCOUNT_TWITTER_TITLE,
  ACCOUNT_DESCRIPTION,
} from '../../content/account'

// Account <head>: the shared route head (canonical, OG/Twitter,
// JSON-LD, manifest link). Indexable, as today — no robots override.
export default function Head(): JSX.Element {
  return (
    <RouteHead
      path="/account"
      twitterTitle={ACCOUNT_TWITTER_TITLE}
      twitterDescription={ACCOUNT_DESCRIPTION}
      ogImageKey={ACCOUNT_OG_IMAGE_KEY}
      ogImageAlt={ACCOUNT_OG_IMAGE_ALT}
    />
  )
}
