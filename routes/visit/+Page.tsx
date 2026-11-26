import type { JSX } from 'react'
import { ContentCard, Image, Link, PhoneHero, SpotArt } from '@hues/ui'
import { CONTACT_PHONE_DISPLAY, CONTACT_PHONE_HREF, MAPS_URL } from '../../content/site'
import {
  VISIT_DRIVING,
  VISIT_FACTS,
  VISIT_FAQS,
  VISIT_HERO,
  VISIT_NEXT_STEPS,
  VISIT_PHONE_FACTS,
  VISIT_PHONE_FIND_US_CTA,
  VISIT_PHONE_INSTALL,
  VISIT_PHONE_UCUT_DOOR,
  type VisitFact,
} from '../../content/visit'
import '../../renderer/content.css'
import './visit.css'

function Eyebrow({ children }: { children: string }): JSX.Element {
  return <p className="c-eyebrow">{children}</p>
}

function FactBody({
  fact,
  cue,
  mapsNote,
}: {
  fact: VisitFact
  cue?: string
  mapsNote?: boolean
}): JSX.Element {
  return (
    <>
      <span className="visit-m__facticon" aria-hidden="true">
        {fact.icon}
      </span>
      <div>
        <h2 className="visit-m__facttitle">{fact.title}</h2>
        <p className="visit-m__facttext">{fact.text}</p>
        {cue !== undefined && (
          <p className="visit-m__cue">
            {cue} <span aria-hidden="true">→</span>
            {mapsNote === true && <span className="hues-visually-hidden">(opens in Maps)</span>}
          </p>
        )}
      </div>
    </>
  )
}

// Visit (/visit): per-breakpoint composition (P7 phone, P9 desktop
// heading repair). Phone renders the /m/visit order — the photo hero,
// Maps/Call pills, the 13 fact cards, the How U-Cut door, and the Take
// Hues With You install card — with the desktop-only FAQ and driving
// directions behind closed disclosures (Q1). Desktop keeps its Slice B
// composition: hero, fact grid, driving directions, FAQ (mirrored in
// FAQPage JSON-LD from the same source), and next-step cards. The two
// variants share no ids; the inactive one is display:none. The phone
// hero carries the page h1 and the desktop title renders the same
// words one level down, so the prerendered document holds one h1.
export default function Page(): JSX.Element {
  return (
    <div className="visit">
      <div className="visit-m">
        <PhoneHero
          photo={{ src: VISIT_HERO.artKey, alt: VISIT_HERO.artAlt, priority: true }}
          eyebrow={VISIT_HERO.eyebrow}
          title={VISIT_HERO.heading}
          routeTitle
        />
        <div className="visit-m__body">
          <div className="visit-m__pills">
            <Link href={MAPS_URL} context="nav" className="hues-button hues-button--primary">
              Get directions
            </Link>
            <Link
              href={CONTACT_PHONE_HREF}
              context="nav"
              className="hues-button hues-button--secondary"
            >
              Call {CONTACT_PHONE_DISPLAY}
            </Link>
          </div>

          <section className="visit-m__facts" aria-label="Visitor facts">
            {VISIT_PHONE_FACTS.map((fact) =>
              fact.title === 'Find us' ? (
                // The Find us card taps through to Maps, with a bold cue
                // line so it reads as tappable (production /m/visit).
                <a
                  key={fact.title}
                  href={MAPS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="visit-m__fact"
                >
                  <FactBody fact={fact} cue={VISIT_PHONE_FIND_US_CTA} mapsNote />
                </a>
              ) : (
                <div key={fact.title} className="visit-m__fact">
                  <FactBody fact={fact} />
                </div>
              ),
            )}
          </section>

          <section className="visit-m__door" aria-label="How U-Cut works">
            <Link href={VISIT_PHONE_UCUT_DOOR.href} context="nav" className="visit-m__fact">
              <FactBody
                fact={{
                  icon: VISIT_PHONE_UCUT_DOOR.icon,
                  title: VISIT_PHONE_UCUT_DOOR.title,
                  text: VISIT_PHONE_UCUT_DOOR.text,
                }}
                cue={VISIT_PHONE_UCUT_DOOR.cta}
              />
            </Link>
          </section>

          <section className="visit-m__install" aria-label="Take Hues with you">
            <SpotArt src={VISIT_PHONE_INSTALL.spotKey} size="lg" placement="above" />
            <div className="visit-m__panel">
              <h2 className="visit-m__paneltitle">{VISIT_PHONE_INSTALL.heading}</h2>
              <p className="visit-m__panelbody">{VISIT_PHONE_INSTALL.body}</p>
              <ol className="visit-m__steps">
                {VISIT_PHONE_INSTALL.steps.map((step, index) => (
                  <li key={step.strong}>
                    <span className="visit-m__stepnum" aria-hidden="true">
                      {index + 1}
                    </span>
                    <span>
                      {step.lead}
                      <strong>{step.strong}</strong>
                      {step.tail}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </section>

          <div className="visit-m__more">
            <details className="visit-m__details">
              <summary className="visit-m__summary">Questions, answered</summary>
              <div className="visit-m__detailbody">
                {VISIT_FAQS.map((faq) => (
                  <div key={faq.question}>
                    <h3 className="c-faq__question">{faq.question}</h3>
                    <p className="c-faq__answer">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </details>
            <details className="visit-m__details">
              <summary className="visit-m__summary">Driving directions</summary>
              <div className="visit-m__detailbody">
                {VISIT_DRIVING.map((route) => (
                  <div key={route.title}>
                    <h3 className="c-faq__question">{route.title}</h3>
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
              </div>
            </details>
          </div>
        </div>
      </div>

      <div className="visit-d c-page">
        <section className="c-head" aria-labelledby="visit-title">
          <Eyebrow>{VISIT_HERO.eyebrow}</Eyebrow>
          {/* h2 under the phone h1: both variants prerender in one
              document, so the desktop title steps one level down to
              keep a single h1 (the P7 composition). Same id, class,
              and text — the desktop rendering is unchanged. */}
          <h2 id="visit-title" className="c-title">
            {VISIT_HERO.heading}
          </h2>
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
    </div>
  )
}
