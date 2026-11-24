import type { JSX } from 'react'
import { usePageContext } from 'vike-react/usePageContext'
import { RouteHead } from '../../../content/head'
import {
  SEASONS_OG_IMAGE_ALT,
  SEASONS_OG_IMAGE_KEY,
  seasonBySlug,
  seasonDetailMeta,
} from '../../../content/seasons'

// Season detail <head>: per-slug canonical and twitter copy from the
// single seasons source, plus the first group's card art as the lead
// visual. Unknown slugs (client-side only) fall back to the hub.
export default function Head(): JSX.Element {
  const { routeParams } = usePageContext()
  const season = seasonBySlug(routeParams.slug ?? '')
  if (season === undefined) {
    return (
      <RouteHead
        path="/whats-in-season"
        twitterTitle="What’s in Season — Hues Floral Park"
        twitterDescription="The year in blooms at Hues Floral Park."
        ogImageKey={SEASONS_OG_IMAGE_KEY}
        ogImageAlt={SEASONS_OG_IMAGE_ALT}
      />
    )
  }
  const meta = seasonDetailMeta(season)
  const lead = season.groups[0]
  return (
    <RouteHead
      path={`/season/${season.slug}`}
      twitterTitle={meta.twitterTitle}
      twitterDescription={meta.twitterDescription}
      ogImageKey={SEASONS_OG_IMAGE_KEY}
      ogImageAlt={meta.ogImageAlt}
      hero={
        lead === undefined
          ? undefined
          : { src: lead.artKey, slot: 'plate', kind: 'plate' }
      }
    />
  )
}
