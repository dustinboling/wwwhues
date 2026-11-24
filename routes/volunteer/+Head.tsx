import type { JSX } from 'react'
import { RouteHead } from '../../content/head'
import {
  VOLUNTEER_ART_KEY,
  VOLUNTEER_OG_IMAGE_ALT,
  VOLUNTEER_OG_IMAGE_KEY,
  VOLUNTEER_TWITTER_DESCRIPTION,
  VOLUNTEER_TWITTER_TITLE,
} from '../../content/volunteer'

export default function Head(): JSX.Element {
  return (
    <RouteHead
      path="/volunteer"
      twitterTitle={VOLUNTEER_TWITTER_TITLE}
      twitterDescription={VOLUNTEER_TWITTER_DESCRIPTION}
      ogImageKey={VOLUNTEER_OG_IMAGE_KEY}
      ogImageAlt={VOLUNTEER_OG_IMAGE_ALT}
      hero={{ src: VOLUNTEER_ART_KEY, slot: 'card', kind: 'photo' }}
    />
  )
}
