import type { JSX } from 'react'
import { RouteHead } from '../../content/head'
import {
  SPONSOR_HERO,
  SPONSOR_OG_IMAGE_ALT,
  SPONSOR_OG_IMAGE_KEY,
  SPONSOR_TWITTER_DESCRIPTION,
  SPONSOR_TWITTER_TITLE,
} from '../../content/sponsor'

export default function Head(): JSX.Element {
  return (
    <RouteHead
      path="/sponsor"
      twitterTitle={SPONSOR_TWITTER_TITLE}
      twitterDescription={SPONSOR_TWITTER_DESCRIPTION}
      ogImageKey={SPONSOR_OG_IMAGE_KEY}
      ogImageAlt={SPONSOR_OG_IMAGE_ALT}
      hero={{ src: SPONSOR_HERO.artKey, slot: 'hero', kind: 'photo' }}
    />
  )
}
