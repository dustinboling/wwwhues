import type { JSX } from 'react'
import { RouteHead } from '../../content/head'
import {
  ABOUT_DESCRIPTION,
  ABOUT_OG_IMAGE_ALT,
  ABOUT_OG_IMAGE_KEY,
  ABOUT_TITLE,
  ABOUT_TWITTER_DESCRIPTION,
} from '../../content/about'

export default function Head(): JSX.Element {
  return (
    <RouteHead
      path="/about"
      twitterTitle={ABOUT_TITLE}
      twitterDescription={ABOUT_TWITTER_DESCRIPTION}
      ogImageKey={ABOUT_OG_IMAGE_KEY}
      ogImageAlt={ABOUT_OG_IMAGE_ALT}
    />
  )
}
