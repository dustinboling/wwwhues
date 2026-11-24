import type { JSX } from 'react'
import { RouteHead } from '../../content/head'
import {
  NURSERY_OG_IMAGE_ALT,
  NURSERY_OG_IMAGE_KEY,
  NURSERY_TITLE,
  NURSERY_TWITTER_DESCRIPTION,
} from '../../content/nursery'

export default function Head(): JSX.Element {
  return (
    <RouteHead
      path="/nursery"
      twitterTitle={NURSERY_TITLE}
      twitterDescription={NURSERY_TWITTER_DESCRIPTION}
      ogImageKey={NURSERY_OG_IMAGE_KEY}
      ogImageAlt={NURSERY_OG_IMAGE_ALT}
    />
  )
}
