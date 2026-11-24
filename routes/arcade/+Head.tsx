import type { JSX } from 'react'
import { RouteHead } from '../../content/head'
import {
  ARCADE_GAME_ORIGINS,
  ARCADE_HERO,
  ARCADE_OG_IMAGE_ALT,
  ARCADE_OG_IMAGE_KEY,
  ARCADE_TWITTER_DESCRIPTION,
  ARCADE_TWITTER_TITLE,
} from '../../content/arcade'

// Arcade <head>: the shared route head plus the game-origin connection
// warming (dns-prefetch + preconnect for all six) and the conservative
// prefetch-only speculation rule — the browser only acts on it once a
// tap looks likely.
const PREFETCH_RULES = JSON.stringify({ prefetch: [{ urls: [...ARCADE_GAME_ORIGINS], eagerness: 'conservative' }] })

export default function Head(): JSX.Element {
  return (
    <RouteHead
      path="/arcade"
      twitterTitle={ARCADE_TWITTER_TITLE}
      twitterDescription={ARCADE_TWITTER_DESCRIPTION}
      ogImageKey={ARCADE_OG_IMAGE_KEY}
      ogImageAlt={ARCADE_OG_IMAGE_ALT}
      hero={{ src: ARCADE_HERO.artKey, slot: 'hero', kind: 'photo' }}
    >
      {ARCADE_GAME_ORIGINS.map((origin) => (
        <link key={`dns-${origin}`} rel="dns-prefetch" href={origin} />
      ))}
      {ARCADE_GAME_ORIGINS.map((origin) => (
        <link key={`pre-${origin}`} rel="preconnect" href={origin} />
      ))}
      <script type="speculationrules" dangerouslySetInnerHTML={{ __html: PREFETCH_RULES }} />
    </RouteHead>
  )
}
