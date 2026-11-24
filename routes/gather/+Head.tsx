import type { JSX } from 'react'
import { RouteHead } from '../../content/head'
import {
  GATHER_HERO,
  GATHER_OG_IMAGE_ALT,
  GATHER_OG_IMAGE_KEY,
  GATHER_TWITTER_DESCRIPTION,
  GATHER_TWITTER_TITLE,
  buildGatherEventJsonLd,
  upcomingEvents,
} from '../../content/gather'
import type { PlaySnapshot } from '../../content/play'
import playSnapshotJson from '../../content/snapshots/play.json'

// Gather <head>: Event JSON-LD generated from the same snapshot data the
// page renders — and only for upcoming dates (no past endDate, Data #1.7).
export default function Head(): JSX.Element {
  const snapshot = playSnapshotJson as unknown as PlaySnapshot
  const eventJsonLd = buildGatherEventJsonLd(upcomingEvents(snapshot.data.events))
  return (
    <RouteHead
      path="/gather"
      twitterTitle={GATHER_TWITTER_TITLE}
      twitterDescription={GATHER_TWITTER_DESCRIPTION}
      ogImageKey={GATHER_OG_IMAGE_KEY}
      ogImageAlt={GATHER_OG_IMAGE_ALT}
      hero={{ src: GATHER_HERO.artKey, slot: 'hero', kind: 'photo' }}
      jsonLd={eventJsonLd === null ? [] : [eventJsonLd]}
    />
  )
}
