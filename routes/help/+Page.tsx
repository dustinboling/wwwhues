import type { JSX } from 'react'
import { Image, Link } from '@hues/ui'
import { HELP_HERO, HELP_SPONSOR_CARD, HELP_VOLUNTEER_CARD } from '../../content/help'
import { PARK_SIGNOFF } from '../../content/site'
import '../../renderer/content.css'

// Help (/help): the Help tab's hub — the entry point routing visitors
// to Sponsor (financially) or Volunteer (physically), with the hub's
// own purpose stated up top. Fully prerendered, no live data.
export default function Page(): JSX.Element {
  return (
    <div className="c-page c-page--narrow">
      <section className="c-packet hues-packet-card" aria-label="Help Hues">
        <p className="c-eyebrow">{HELP_HERO.eyebrow}</p>
        <h1 data-route-title className="c-title c-title--left">
          {HELP_HERO.heading}
        </h1>
        <p className="c-prose">{HELP_HERO.intro}</p>
        <Image src={HELP_HERO.artKey} alt={HELP_HERO.artAlt} slot="hero" ratio="21/9" priority />
      </section>

      <div className="c-stack">
        {[HELP_SPONSOR_CARD, HELP_VOLUNTEER_CARD].map((card) => (
          <article key={card.href} className="c-packet hues-packet-card">
            <p className="c-eyebrow">{card.eyebrow}</p>
            <h2 className="c-section__title">{card.heading}</h2>
            <p className="c-prose">{card.body}</p>
            <Link href={card.href} context="prose">
              {card.cta} <span aria-hidden="true">→</span>
            </Link>
          </article>
        ))}
      </div>

      <p className="c-signoff">{PARK_SIGNOFF}</p>
    </div>
  )
}
