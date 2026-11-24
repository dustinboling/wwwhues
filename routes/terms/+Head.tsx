import type { JSX } from 'react'
import { RouteHead } from '../../content/head'
import { TERMS_DESCRIPTION, TERMS_TITLE } from '../../content/terms'
import { OG_IMAGE_KEY } from '../../content/home'

export default function Head(): JSX.Element {
  return (
    <RouteHead
      path="/terms"
      twitterTitle={TERMS_TITLE}
      twitterDescription={TERMS_DESCRIPTION}
      ogImageKey={OG_IMAGE_KEY}
      ogImageAlt="Dahlia beds at Hues Floral Park in Junction City, Oregon"
    />
  )
}
