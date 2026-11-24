import type { JSX } from 'react'
import { RouteHead } from '../../content/head'
import {
  WORKING_ON_ART_KEY,
  WORKING_ON_OG_IMAGE_ALT,
  WORKING_ON_OG_IMAGE_KEY,
  WORKING_ON_TWITTER_DESCRIPTION,
  WORKING_ON_TWITTER_TITLE,
} from '../../content/working-on'

export default function Head(): JSX.Element {
  return (
    <RouteHead
      path="/working-on"
      twitterTitle={WORKING_ON_TWITTER_TITLE}
      twitterDescription={WORKING_ON_TWITTER_DESCRIPTION}
      ogImageKey={WORKING_ON_OG_IMAGE_KEY}
      ogImageAlt={WORKING_ON_OG_IMAGE_ALT}
      hero={{ src: WORKING_ON_ART_KEY, slot: 'card', kind: 'photo' }}
    />
  )
}
