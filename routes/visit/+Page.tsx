import type { JSX } from 'react'
import { ContentCard, Image, Link } from '@hues/ui'
import { CONTACT_PHONE_DISPLAY, CONTACT_PHONE_HREF, MAPS_URL } from '../../content/site'
import {
  VISIT_DRIVING,
  VISIT_FACTS,
  VISIT_FAQS,
  VISIT_HERO,
  VISIT_NEXT_STEPS,
} from '../../content/visit'
import '../../renderer/content.css'

function Eyebrow({ children }: { children: string }): JSX.Element {
  return <p className="c-eyebrow">{children}</p>
}

// Visit (/visit): the park's fact sheet — hero, the visit-fact grid, the
// driving directions, the FAQ (mirrored in FAQPage JSON-LD from the same
// source), and the next-step cards. Complete primary content in the
// prerendered HTML.
export default function Page(): JSX.Element {
  return (
    <div className="c-page">
      <section className="c-head" aria-labelledby="visit-title">
        <Eyebrow>{VISIT_HERO.eyebrow}</Eyebrow>
        <h1 id="visit-title" data-route-title className="c-title">
          {VISIT_HERO.heading}
        </h1>
        <p className="c-lede">{VISIT_HERO.lede}</p>
        <div className="c-ctas">
          <Link href={MAPS_URL} context="nav" className="hues-button hues-button--primary">
            Get directions
          </Link>
          <Link href={CONTACT_PHONE_HREF} context="nav" className="hues-button hues-button--secondary">
            Call {CONTACT_PHONE_DISPLAY}
          </Link>
        </div>
      </section>

      <figure className="c-plate hues-packet-card">
        <Image
          src={VISIT_HERO.artKey}
          alt={VISIT_HERO.artAlt}
          slot="hero"
          ratio="21/9"
          priority
        />
        <figcaption className="c-plate__caption">{VISIT_HERO.caption}</figcaption>
      </figure>

      <section className="c-section" aria-label="Visitor facts">
        <div className="c-grid c-grid--3">
          {VISIT_FACTS.map((fact) => (
            <article key={fact.title} className="c-fact hues-packet-card">
              <span className="c-fact__icon" aria-hidden="true">
                {fact.icon}
              </span>
              <div>
                <h2 className="c-fact__title">{fact.title}</h2>
                <p className="c-fact__text">{fact.text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="c-section c-cols2" aria-label="Directions">
        {VISIT_DRIVING.map((route) => (
          <div key={route.title}>
            <Eyebrow>Directions</Eyebrow>
            <h2 className="c-section__title">{route.title}</h2>
            <ol className="c-steps">
              {route.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
            <Link href={route.link.href} context="prose">
              {route.link.label}
            </Link>
          </div>
        ))}
      </section>

      <section className="c-section" aria-labelledby="visit-faq">
        <div className="c-head">
          <Eyebrow>Good questions</Eyebrow>
          <h2 id="visit-faq" className="c-section__title">
            Questions, answered
          </h2>
        </div>
        <div className="c-cols2">
          {VISIT_FAQS.map((faq) => (
            <div key={faq.question}>
              <h3 className="c-faq__question">{faq.question}</h3>
              <p className="c-faq__answer">{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="c-section" aria-labelledby="visit-next">
        <div className="c-head">
          <Eyebrow>Keep wandering</Eyebrow>
          <h2 id="visit-next" className="c-section__title">
            What would you like to see next?
          </h2>
        </div>
        <div className="c-grid c-grid--3">
          {VISIT_NEXT_STEPS.map((step) => (
            <ContentCard
              key={step.href}
              eyebrow={step.eyebrow}
              title={step.title}
              description={step.text}
              cta="Continue →"
              href={step.href}
            />
          ))}
        </div>
      </section>
    </div>
  )
}
