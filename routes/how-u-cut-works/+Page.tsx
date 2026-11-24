import type { JSX } from 'react'
import { Image, Link } from '@hues/ui'
import { parkTodayLabel } from '../../content/park-date'
import { MAPS_URL, PARK_SIGNOFF } from '../../content/site'
import {
  UCUT_CLOSING_LINKS,
  UCUT_DAHLIA_GUIDE,
  UCUT_DAHLIA_MORE,
  UCUT_FACTS,
  UCUT_GUIDES_HEADING,
  UCUT_GUIDE_INTRO,
  UCUT_GUIDE_GROUPS,
  UCUT_HEAD,
  UCUT_LEDE,
  UCUT_RESTING,
  UCUT_STATUS_HEADING,
  UCUT_STEPS,
  UCUT_STEPS_ASIDE,
  UCUT_STEPS_LEDE,
  type CuttingGuide,
} from '../../content/ucut'
import '../../renderer/content.css'

function Eyebrow({ children }: { children: string }): JSX.Element {
  return <p className="c-eyebrow">{children}</p>
}

function GuideRow({ label, text }: { label: string; text: string }): JSX.Element {
  return (
    <div>
      <p className="c-guide__label">{label}</p>
      <p className="c-guide__text">{text}</p>
    </div>
  )
}

function GuideCard({ guide }: { guide: CuttingGuide }): JSX.Element {
  return (
    <article className="c-guide">
      <Image src={guide.artKey} alt={guide.artAlt} kind="plate" slot="card" ratio="16/10" />
      <div className="c-guide__body">
        <h4 className="c-guide__name">{guide.name}</h4>
        <div className="c-guide__rows">
          <GuideRow label="Ready when" text={guide.ready} />
          <GuideRow label="The cut" text={guide.cut} />
          <GuideRow label="After" text={guide.after} />
        </div>
      </div>
    </article>
  )
}

// How U-Cut Works (/how-u-cut-works): the season status, the five steps,
// the flower-by-flower cutting guides, and the good-to-know facts.
export default function Page(): JSX.Element {
  return (
    <div className="c-page">
      <header className="c-head">
        <Eyebrow>{UCUT_HEAD.eyebrow}</Eyebrow>
        <h1 data-route-title className="c-title">
          {UCUT_HEAD.heading}
        </h1>
        <p className="c-lede">{UCUT_LEDE}</p>
      </header>

      <figure className="c-plate hues-packet-card">
        <Image
          src={UCUT_HEAD.artKey}
          alt={UCUT_HEAD.artAlt}
          slot="hero"
          ratio="21/10"
          priority
        />
        <figcaption className="c-plate__caption">{UCUT_HEAD.artCaption}</figcaption>
      </figure>

      <section className="c-status hues-packet-card" aria-label="Season status">
        <Eyebrow>{`Season status · ${parkTodayLabel()}`}</Eyebrow>
        <h2 className="c-status__title">{UCUT_STATUS_HEADING}</h2>
        <p className="c-status__body">{UCUT_RESTING}</p>
      </section>

      <section className="c-section" aria-labelledby="how-it-works">
        <h2 id="how-it-works" className="c-section__title">
          How it works
        </h2>
        <p className="c-lede">{UCUT_STEPS_LEDE}</p>
        <div className="c-grid c-grid--3">
          {UCUT_STEPS.map((step, index) => (
            <div key={step.title} className="c-step hues-content-card">
              <span className="c-step__index" aria-hidden="true">
                {String(index + 1).padStart(2, '0')}
              </span>
              <div>
                <h3 className="c-step__title">{step.title}</h3>
                <p className="c-step__text">{step.text}</p>
              </div>
            </div>
          ))}
          <div className="c-step c-step--aside">
            <p className="c-step__aside">{UCUT_STEPS_ASIDE}</p>
          </div>
        </div>
      </section>

      <section className="c-section" aria-labelledby="cutting-guides">
        <h2 id="cutting-guides" className="c-section__title">
          {UCUT_GUIDES_HEADING}
        </h2>
        <p className="c-lede">{UCUT_GUIDE_INTRO}</p>

        <article className="c-leadguide hues-packet-card">
          <Image
            src={UCUT_DAHLIA_GUIDE.artKey}
            alt={UCUT_DAHLIA_GUIDE.artAlt}
            kind="plate"
            slot="hero"
            ratio="21/8"
          />
          <div className="c-leadguide__body">
            <Eyebrow>Start here</Eyebrow>
            <h3 className="c-leadguide__name">{UCUT_DAHLIA_GUIDE.name}</h3>
            {UCUT_DAHLIA_GUIDE.when !== undefined && (
              <p className="c-leadguide__when">{UCUT_DAHLIA_GUIDE.when}</p>
            )}
            <div className="c-leadguide__rows">
              <GuideRow label="Ready when" text={UCUT_DAHLIA_GUIDE.ready} />
              <GuideRow label="The cut" text={UCUT_DAHLIA_GUIDE.cut} />
              <GuideRow label="After" text={UCUT_DAHLIA_GUIDE.after} />
            </div>
            <Link href={UCUT_DAHLIA_MORE.href} context="prose">
              {UCUT_DAHLIA_MORE.label}
            </Link>
          </div>
        </article>

        {UCUT_GUIDE_GROUPS.map((group) => (
          <div key={group.title} className="c-guidegroup">
            <h3 className="c-guidegroup__title">{group.title}</h3>
            <p className="c-guidegroup__sub">{group.sub}</p>
            <div className="c-grid c-grid--3">
              {group.guides.map((guide) => (
                <GuideCard key={guide.name} guide={guide} />
              ))}
            </div>
          </div>
        ))}
      </section>

      <section className="c-section" aria-labelledby="good-to-know">
        <h2 id="good-to-know" className="c-section__title">
          Good to know
        </h2>
        <div className="c-grid c-grid--3">
          {UCUT_FACTS.map((fact) => {
            const isFindUs = fact.title === 'Find us'
            const body = (
              <>
                <span className="c-fact__icon" aria-hidden="true">
                  {fact.icon}
                </span>
                <div>
                  <h3 className="c-fact__title">{fact.title}</h3>
                  <p className="c-fact__text">{fact.text}</p>
                  {isFindUs && (
                    <p className="c-fact__more">
                      Get directions <span aria-hidden="true">→</span>
                      <span className="c-sr-only">(opens in Maps)</span>
                    </p>
                  )}
                </div>
              </>
            )
            return isFindUs ? (
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

      <div className="c-closing">
        <div className="c-closing__links">
          {UCUT_CLOSING_LINKS.map((link) => (
            <Link key={link.href} href={link.href} context="prose">
              {link.label}
            </Link>
          ))}
        </div>
        <p className="c-signoff">{PARK_SIGNOFF}</p>
      </div>
    </div>
  )
}
