import type { JSX } from 'react'
import { RouteHead } from '../../content/head'
import {
  MUSIC_HERO,
  MUSIC_OG_IMAGE_ALT,
  MUSIC_OG_IMAGE_KEY,
  MUSIC_TWITTER_DESCRIPTION,
  MUSIC_TWITTER_TITLE,
} from '../../content/music'

// Music <head>: the shared route head. Beyond the root entity graph,
// the page carries no JSON-LD — the current Music pages ship none,
// and the structured-data inventory names no music type.
export default function Head(): JSX.Element {
  return (
    <RouteHead
      path="/music"
      twitterTitle={MUSIC_TWITTER_TITLE}
      twitterDescription={MUSIC_TWITTER_DESCRIPTION}
      ogImageKey={MUSIC_OG_IMAGE_KEY}
      ogImageAlt={MUSIC_OG_IMAGE_ALT}
      hero={{ src: MUSIC_HERO.artKey, slot: 'hero', kind: 'photo' }}
    />
  )
}
