import type { JSX } from 'react'
import { Link } from '@hues/ui'
import {
  NURSERY_COMING_SOON,
  NURSERY_HEADING,
  NURSERY_INTRO,
} from '../../content/nursery'
import '../../renderer/content.css'

// Nursery (/nursery): the coming-soon packet for cut flower starts.
export default function Page(): JSX.Element {
  return (
    <div className="c-page">
      <header className="c-packet hues-packet-card">
        <p className="c-eyebrow">Hues Floral Park · Junction City, Oregon</p>
        <h1 data-route-title className="c-title c-title--left">
          {NURSERY_HEADING}
        </h1>
        <p className="c-lede c-lede--left">{NURSERY_INTRO}</p>
      </header>

      <section className="c-packet hues-packet-card" aria-label="Coming soon">
        <p className="c-eyebrow">{NURSERY_COMING_SOON.eyebrow}</p>
        <h2 className="c-section__title">{NURSERY_COMING_SOON.heading}</h2>
        <p className="c-prose">{NURSERY_COMING_SOON.body}</p>
        <div className="c-ctas c-ctas--left">
          <Link
            href={NURSERY_COMING_SOON.primaryCta.href}
            context="nav"
            className="hues-button hues-button--primary"
          >
            {NURSERY_COMING_SOON.primaryCta.label}
          </Link>
          <Link
            href={NURSERY_COMING_SOON.secondaryCta.href}
            context="nav"
            className="hues-button hues-button--secondary"
          >
            {NURSERY_COMING_SOON.secondaryCta.label}
          </Link>
        </div>
      </section>
    </div>
  )
}
