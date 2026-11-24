import type { JSX } from 'react'
import { RouteHead } from '../../content/head'
import {
  FLORAL_PARK_HEAD,
  FLORAL_PARK_OG_IMAGE_ALT,
  FLORAL_PARK_OG_IMAGE_KEY,
  FLORAL_PARK_TITLE,
  FLORAL_PARK_TWITTER_DESCRIPTION,
} from '../../content/floral-park'

export default function Head(): JSX.Element {
  return (
    <RouteHead
      path="/floral-park"
      twitterTitle={FLORAL_PARK_TITLE}
      twitterDescription={FLORAL_PARK_TWITTER_DESCRIPTION}
      ogImageKey={FLORAL_PARK_OG_IMAGE_KEY}
      ogImageAlt={FLORAL_PARK_OG_IMAGE_ALT}
      hero={{ src: FLORAL_PARK_HEAD.artKey, slot: 'hero', kind: 'plate' }}
    />
  )
}
