import type { JSX } from 'react'
import { Image, Link } from '@hues/ui'
import { PARK_SIGNOFF } from '../../content/site'
import {
  WORKING_ON_ART_ALT,
  WORKING_ON_ART_KEY,
  WORKING_ON_FOLLOW,
  WORKING_ON_HEADING,
  WORKING_ON_LEDE,
  WORKING_ON_NOW,
  WORKING_ON_PLAN,
  WORKING_ON_WHY,
} from '../../content/working-on'
import '../../renderer/content.css'

function Eyebrow({ children }: { children: string }): JSX.Element {
  return <p className="c-eyebrow">{children}</p>
}

// Working On (/working-on): the hand-kept log of the season's work —
// what's happening now, the calendared plan to May, and what it's for.
export default function Page(): JSX.Element {
  return (
    <div className="c-page">
      <div className="c-split">
        <figure className="c-portrait">
          <Image src={WORKING_ON_ART_KEY} alt={WORKING_ON_ART_ALT} slot="card" ratio="1/1" priority />
        </figure>
        <div>
          <h1 data-route-title className="c-title c-title--left">
            {WORKING_ON_HEADING}
          </h1>
          <div className="c-stack">
            {WORKING_ON_LEDE.map((paragraph) => (
              <p key={paragraph.slice(0, 24)} className="c-prose">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </div>

      <section className="c-section" aria-labelledby="happening-now">
        <Eyebrow>Happening Now</Eyebrow>
        <h2 id="happening-now" className="c-section__title">
          Fall: The Planting Season
        </h2>
        <div className="c-grid c-grid--2">
          {WORKING_ON_NOW.map((item) => (
            <article key={item.title} className="c-note hues-content-card">
              <h3 className="c-note__title">{item.title}</h3>
              <p className="c-note__body">{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="c-section" aria-labelledby="calendared-plan">
        <Eyebrow>The Calendared Plan</Eyebrow>
        <h2 id="calendared-plan" className="c-section__title">
          From Fall Planting to Mother’s Day
        </h2>
        <div className="c-timeline">
          {WORKING_ON_PLAN.map((item) => (
            <div key={`${item.when}-${item.title}`} className="c-timeline__row">
              <p className="c-timeline__when">{item.when}</p>
              <div>
                <h3 className="c-note__title">{item.title}</h3>
                <p className="c-note__body">{item.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="c-section" aria-labelledby="what-for">
        <Eyebrow>What It’s All For</Eyebrow>
        <h2 id="what-for" className="c-section__title">
          Why November Matters
        </h2>
        <div className="c-grid c-grid--3">
          {WORKING_ON_WHY.map((item) => (
            <article key={item.title} className="c-note hues-content-card">
              <h3 className="c-note__title">{item.title}</h3>
              <p className="c-note__body">{item.body}</p>
            </article>
          ))}
        </div>
        <div className="c-stack c-closing--left">
          <p className="c-prose">
            {WORKING_ON_FOLLOW.before}
            <Link href={WORKING_ON_FOLLOW.link.href} context="prose">
              {WORKING_ON_FOLLOW.link.label}
            </Link>
            {WORKING_ON_FOLLOW.after}
          </p>
          <p className="c-prose">{PARK_SIGNOFF}</p>
        </div>
      </section>
    </div>
  )
}
