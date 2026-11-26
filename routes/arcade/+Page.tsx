import { useEffect } from 'react'
import type { JSX } from 'react'
import { Image, Link, SpotArt } from '@hues/ui'
import {
  ARCADE_GAMES,
  ARCADE_GAMES_HEAD,
  ARCADE_GAME_ORIGINS,
  ARCADE_HERO,
  ARCADE_MORE,
  ARCADE_PLAY_NOW,
  type ArcadeGame,
} from '../../content/arcade'
import { PARK_SIGNOFF } from '../../content/site'
import '../../renderer/content.css'
import './arcade.css'

function Eyebrow({ children }: { children: string }): JSX.Element {
  return <p className="c-eyebrow">{children}</p>
}

function GameCard({ game }: { game: ArcadeGame }): JSX.Element {
  // Production's card order (PlayHub): the thumbs + badge row, the
  // game name as an h3, the description, and the play pill. The whole
  // card is one outbound anchor; the h3 inside it restores the titles'
  // heading role (P9).
  return (
    <article className={`c-game hues-packet-card${game.featured === true ? ' c-game--featured' : ''}`}>
      <Link
        href={game.href}
        context="nav"
        className="c-game__link"
      >
        {game.featured === true && (
          <span aria-hidden="true" className="c-game__vs">
            VS
          </span>
        )}
        {game.thumbs.length > 0 ? (
          <span className="c-game__top">
            <span className="c-game__thumbs" aria-hidden="true">
              {game.thumbs.map((thumb) => (
                <Image key={thumb} src={thumb} alt="" decorative slot="card" ratio="1/1" />
              ))}
            </span>
            <span className="c-badge">{game.badge}</span>
          </span>
        ) : (
          <span className="c-badge">{game.badge}</span>
        )}
        <h3 className="c-game__name">{game.name}</h3>
        <span className="c-game__text">{game.description}</span>
        <span className="hues-button hues-button--primary">{ARCADE_PLAY_NOW}</span>
      </Link>
    </article>
  )
}

// Arcade (/arcade, N2 canonical): the games hub — static links to the six
// game subdomains. Interaction warming prerenders a game on first hover
// or touch of its card (at most once per URL); the head hints warm
// DNS + TLS for all six origins on hub load.
export default function Page(): JSX.Element {
  useEffect(() => {
    const origins = new Set(ARCADE_GAME_ORIGINS)
    const warmed = new Set<string>()
    const warm = (url: string): void => {
      if (warmed.has(url)) return
      warmed.add(url)
      const script = document.createElement('script')
      script.type = 'speculationrules'
      script.textContent = JSON.stringify({ prerender: [{ urls: [url], eagerness: 'immediate' }] })
      document.head.appendChild(script)
    }
    const onInteract = (e: Event): void => {
      const target = e.target as Element | null
      const anchor = target?.closest?.('a[href]') as HTMLAnchorElement | null
      if (anchor !== null && origins.has(anchor.origin)) {
        warm(anchor.href)
      }
    }
    document.addEventListener('pointerover', onInteract, { passive: true })
    document.addEventListener('touchstart', onInteract, { passive: true })
    return () => {
      document.removeEventListener('pointerover', onInteract)
      document.removeEventListener('touchstart', onInteract)
    }
  }, [])

  return (
    <div className="arcade c-page c-page--narrow">
      <section className="c-packet hues-packet-card" aria-label="Welcome to the Hues Arcade">
        <Image
          src={ARCADE_HERO.artKey}
          alt={ARCADE_HERO.artAlt}
          slot="hero"
          ratio="3/2"
          priority
        />
        <div className="c-head">
          <Eyebrow>{ARCADE_HERO.eyebrow}</Eyebrow>
          <h1 data-route-title className="c-title">
            {ARCADE_HERO.headingLead}
            <span className="c-title__accent">{ARCADE_HERO.headingAccent}</span>
          </h1>
          <p className="c-tagline">{ARCADE_HERO.tagline}</p>
          <p className="c-lede">{ARCADE_HERO.intro}</p>
        </div>
      </section>

      <section id="games" aria-label="Games" className="c-section">
        <div className="arcade-games__head">
          <div>
            <Eyebrow>{ARCADE_GAMES_HEAD.eyebrow}</Eyebrow>
            <h2 className="c-section__title">{ARCADE_GAMES_HEAD.heading}</h2>
            <p className="c-lede c-lede--left">{ARCADE_GAMES_HEAD.blurb}</p>
          </div>
          <SpotArt src={ARCADE_GAMES_HEAD.artKey} size="sm" />
        </div>
        <div className="c-stack">
          {ARCADE_GAMES.map((game) => (
            <GameCard key={game.href} game={game} />
          ))}
          <article className="c-packet hues-packet-card">
            <h3 className="c-note__title">{ARCADE_MORE.heading}</h3>
            <p className="c-note__body">{ARCADE_MORE.body}</p>
          </article>
        </div>
      </section>

      <p className="c-signoff">{PARK_SIGNOFF}</p>
    </div>
  )
}
