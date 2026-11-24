import type { JSX } from 'react'
import { GoldRule, Image, Link } from '@hues/ui'
import { MAPS_URL } from '../../content/site'
import {
  FLORAL_PARK_BUILT_BY_HAND,
  FLORAL_PARK_FACTS,
  FLORAL_PARK_HEAD,
  FLORAL_PARK_MORE_THAN,
  FLORAL_PARK_OPENING,
  FLORAL_PARK_VISITORS,
  FLORAL_PARK_VISIT_INTRO,
  FLORAL_PARK_WHY_FLOWERS,
} from '../../content/floral-park'
import '../../renderer/content.css'

function Eyebrow({ children }: { children: string }): JSX.Element {
  return <p className="c-eyebrow">{children}</p>
}

// Floral Park (/floral-park): Dusty's story of the park in four
// movements with its photo plates, plus the Plan Your Visit fact set.
export default function Page(): JSX.Element {
  return (
    <div className="c-page">
      <header className="c-head">
        <Eyebrow>{FLORAL_PARK_HEAD.eyebrow}</Eyebrow>
        <h1 data-route-title className="c-title">
          {FLORAL_PARK_HEAD.heading}
        </h1>
        <GoldRule />
      </header>

      <figure className="c-plate hues-packet-card">
        <Image
          src={FLORAL_PARK_HEAD.artKey}
          alt={FLORAL_PARK_HEAD.artAlt}
          kind="plate"
          slot="hero"
          ratio="21/9"
          priority
        />
        <figcaption className="c-plate__caption">{FLORAL_PARK_HEAD.artCaption}</figcaption>
      </figure>

      <div className="c-narrow">
        <p className="c-standfirst">{FLORAL_PARK_OPENING.standfirst}</p>
        <p className="c-dropcap">{FLORAL_PARK_OPENING.body}</p>
      </div>

      <section className="c-section c-split" aria-labelledby="more-than">
        <div>
          <h2 id="more-than" className="c-section__title">
            {FLORAL_PARK_MORE_THAN.heading}
          </h2>
          {FLORAL_PARK_MORE_THAN.paragraphs.map((paragraph) => (
            <p key={paragraph.slice(0, 24)} className="c-prose">
              {paragraph}
            </p>
          ))}
        </div>
        <figure className="c-plate hues-packet-card">
          <Image
            src={FLORAL_PARK_MORE_THAN.artKey}
            alt={FLORAL_PARK_MORE_THAN.artAlt}
            slot="plate"
            ratio="4/5"
          />
        </figure>
      </section>

      <figure className="c-pullquote">
        <GoldRule />
        <blockquote className="c-pullquote__quote">{FLORAL_PARK_MORE_THAN.pullQuote}</blockquote>
        <GoldRule />
      </figure>

      <section className="c-section c-narrow" aria-labelledby="built-by-hand">
        <h2 id="built-by-hand" className="c-section__title">
          {FLORAL_PARK_BUILT_BY_HAND.heading}
        </h2>
        {FLORAL_PARK_BUILT_BY_HAND.paragraphs.map((paragraph) => (
          <p key={paragraph.slice(0, 24)} className="c-prose">
            {paragraph}
          </p>
        ))}
      </section>

      <figure className="c-plate hues-packet-card">
        <Image
          src={FLORAL_PARK_BUILT_BY_HAND.artKey}
          alt={FLORAL_PARK_BUILT_BY_HAND.artAlt}
          slot="hero"
          ratio="21/10"
        />
      </figure>

      <section className="c-section c-split" aria-labelledby="why-flowers">
        <figure className="c-plate hues-packet-card">
          <Image
            src={FLORAL_PARK_WHY_FLOWERS.artKey}
            alt={FLORAL_PARK_WHY_FLOWERS.artAlt}
            slot="plate"
            ratio="3/4"
          />
        </figure>
        <div>
          <h2 id="why-flowers" className="c-section__title">
            {FLORAL_PARK_WHY_FLOWERS.heading}
          </h2>
          {FLORAL_PARK_WHY_FLOWERS.paragraphs.map((paragraph) => (
            <p key={paragraph.slice(0, 24)} className="c-prose">
              {paragraph}
            </p>
          ))}
        </div>
      </section>

      <section className="c-section c-narrow" aria-labelledby="for-whom">
        <h2 id="for-whom" className="c-section__title">
          {FLORAL_PARK_VISITORS.heading}
        </h2>
        <p className="c-prose">{FLORAL_PARK_VISITORS.intro}</p>
        <ul className="c-kindlist">
          {FLORAL_PARK_VISITORS.kinds.map((kind) => (
            <li key={kind} className="c-kindlist__item">
              {kind}
            </li>
          ))}
        </ul>
        <figure className="c-plate hues-packet-card">
          <Image
            src={FLORAL_PARK_VISITORS.artKey}
            alt={FLORAL_PARK_VISITORS.artAlt}
            slot="card"
            ratio="1/1"
          />
        </figure>
        {FLORAL_PARK_VISITORS.paragraphs.map((paragraph) => (
          <p key={paragraph.slice(0, 24)} className="c-prose">
            {paragraph}
          </p>
        ))}
      </section>

      <section className="c-section" aria-labelledby="plan-your-visit">
        <h2 id="plan-your-visit" className="c-section__title">
          Plan Your Visit
        </h2>
        <p className="c-lede">{FLORAL_PARK_VISIT_INTRO}</p>
        <div className="c-grid c-grid--3">
          {FLORAL_PARK_FACTS.map((fact) => {
            const body = (
              <>
                <span className="c-fact__icon" aria-hidden="true">
                  {fact.icon}
                </span>
                <div>
                  <h3 className="c-fact__title">{fact.title}</h3>
                  <p className="c-fact__text">{fact.text}</p>
                  {fact.linkToMaps === true && (
                    <p className="c-fact__more">
                      Get directions <span aria-hidden="true">→</span>
                      <span className="c-sr-only">(opens in Maps)</span>
                    </p>
                  )}
                </div>
              </>
            )
            return fact.linkToMaps === true ? (
              <Link
                key={fact.title}
                href={MAPS_URL}
                context="nav"
                target="_blank"
                rel="noopener noreferrer"
                className="c-fact hues-packet-card"
              >
                {body}
              </Link>
            ) : (
              <article key={fact.title} className="c-fact hues-packet-card">
                {body}
              </article>
            )
          })}
        </div>
      </section>
    </div>
  )
}
