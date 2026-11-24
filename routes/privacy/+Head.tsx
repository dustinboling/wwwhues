import type { JSX } from 'react'
import { RouteHead } from '../../content/head'
import { PRIVACY_DESCRIPTION, PRIVACY_TITLE } from '../../content/privacy'
import { OG_IMAGE_KEY } from '../../content/home'

export default function Head(): JSX.Element {
  return (
    <RouteHead
      path="/privacy"
      twitterTitle={PRIVACY_TITLE}
      twitterDescription={PRIVACY_DESCRIPTION}
      ogImageKey={OG_IMAGE_KEY}
      ogImageAlt="Dahlia beds at Hues Floral Park in Junction City, Oregon"
    />
  )
}
