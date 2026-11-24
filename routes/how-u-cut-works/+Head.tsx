import type { JSX } from 'react'
import { RouteHead } from '../../content/head'
import {
  UCUT_HEAD,
  UCUT_OG_IMAGE_ALT,
  UCUT_OG_IMAGE_KEY,
  UCUT_TITLE,
  UCUT_TWITTER_DESCRIPTION,
} from '../../content/ucut'

export default function Head(): JSX.Element {
  return (
    <RouteHead
      path="/how-u-cut-works"
      twitterTitle={UCUT_TITLE}
      twitterDescription={UCUT_TWITTER_DESCRIPTION}
      ogImageKey={UCUT_OG_IMAGE_KEY}
      ogImageAlt={UCUT_OG_IMAGE_ALT}
      hero={{ src: UCUT_HEAD.artKey, slot: 'hero', kind: 'photo' }}
    />
  )
}
