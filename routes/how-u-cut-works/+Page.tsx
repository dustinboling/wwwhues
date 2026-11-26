import type { JSX } from 'react'
import { Image, Link, PhoneHero } from '@hues/ui'
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
  UCUT_PHONE_CLOSING_LINKS,
  UCUT_PHONE_DAHLIA_CHIP,
  UCUT_PHONE_GUIDES,
  UCUT_PHONE_HERO,
  UCUT_PHONE_SIGNOFF,
  UCUT_PHONE_STEPS,
  UCUT_RESTING,
  UCUT_STATUS_HEADING,
  UCUT_STEPS,
  UCUT_STEPS_ASIDE,
  UCUT_STEPS_LEDE,
  type CuttingGuide,
} from '../../content/ucut'
import '../../renderer/content.css'
import './how-u-cut-works.css'

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

function PhoneGuideRows({ guide }: { guide: CuttingGuide }): JSX.Element {
  return (
    <div className="ucut-m__guiderows">
      <GuideRow label="Ready when" text={guide.ready} />
      <GuideRow label="The cut" text={guide.cut} />
      <GuideRow label="After" text={guide.after} />
    </div>
  )
}

// How U-Cut Works (/how-u-cut-works): per-breakpoint composition (P9).
// Phone renders the /m/how-u-cut-works order — the hero band, the
// season-status card, the five numbered steps, the dahlia lead guide
// with its plate, the grouped cutting guides, the good-to-know cards
// (Find us taps through to Maps), and the closing doors. Desktop keeps
// its Slice B composition untouched: head plate, status, steps with the
// cutting aside, guides, facts, closing. The two variants share no ids;
// the inactive one is display:none. Each variant carries its own h1
// (production's desktop outline kept), so the visible outline stays one
// h1 per breakpoint.
export default function Page(): JSX.Element {
  const buildDate = parkTodayLabel()
  return (
    <div className="ucut">
      <div className="ucut-m">
        <PhoneHero
          eyebrow={UCUT_PHONE_HERO.eyebrow}
          title={UCUT_PHONE_HERO.heading}
          intro={UCUT_LEDE}
          routeTitle
        />

        <section className="ucut-m__status" aria-label="Season status">
          <div className="ucut-m__statuscard">
            <p className="ucut-m__badge">
              <span aria-hidden="true" className="ucut-m__dot" />
              {`Season status · ${buildDate}`}
            </p>
            <h2 className="ucut-m__statustitle">{UCUT_STATUS_HEADING}</h2>
            <p className="ucut-m__statustext">{UCUT_RESTING}</p>
          </div>
        </section>

        <section className="ucut-m__steps" aria-labelledby="ucut-m-how">
          <p className="ucut-m__eyebrow">{UCUT_PHONE_STEPS.eyebrow}</p>
          <h2 id="ucut-m-how" className="ucut-m__title">
            {UCUT_PHONE_STEPS.heading}
          </h2>
          <p className="ucut-m__sub">{UCUT_STEPS_LEDE}</p>
          <div className="ucut-m__steplist">
            {UCUT_STEPS.map((step, index) => (
              <div key={step.title} className="ucut-m__step">
                <span aria-hidden="true" className="ucut-m__stepnum">
                  {index + 1}
                </span>
                <div>
                  <h3 className="ucut-m__steptitle">{step.title}</h3>
                  <p className="ucut-m__steptext">{step.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="ucut-m__guides" aria-labelledby="ucut-m-guides">
          <p className="ucut-m__eyebrow">{UCUT_PHONE_GUIDES.eyebrow}</p>
          <h2 id="ucut-m-guides" className="ucut-m__title">
            {UCUT_PHONE_GUIDES.heading}
          </h2>
          <p className="ucut-m__sub">{UCUT_GUIDE_INTRO}</p>

          <article className="ucut-m__lead">
            <div className="ucut-m__leadart">
              <Image
                src={UCUT_DAHLIA_GUIDE.artKey}
                alt={UCUT_DAHLIA_GUIDE.artAlt}
                kind="photo"
                slot="card"
              />
              <span className="ucut-m__chip">{UCUT_PHONE_DAHLIA_CHIP}</span>
            </div>
            <div className="ucut-m__leadbody">
              <h3 className="ucut-m__leadname">{UCUT_DAHLIA_GUIDE.name}</h3>
              {UCUT_DAHLIA_GUIDE.when !== undefined && (
                <p className="ucut-m__leadwhen">{UCUT_DAHLIA_GUIDE.when}</p>
              )}
              <PhoneGuideRows guide={UCUT_DAHLIA_GUIDE} />
              <Link href={UCUT_DAHLIA_MORE.href} context="prose">
                {UCUT_DAHLIA_MORE.label}
              </Link>
            </div>
          </article>

          {UCUT_GUIDE_GROUPS.map((group) => (
            <div key={group.title} className="ucut-m__group">
              <h3 className="ucut-m__grouptitle">{group.title}</h3>
              <p className="ucut-m__sub">{group.sub}</p>
              <div className="ucut-m__guidelist">
                {group.guides.map((guide) => (
                  <article key={guide.name} className="ucut-m__guide">
                    <div className="ucut-m__guideart">
                      <Image
                        src={guide.artKey}
                        alt={guide.artAlt}
                        kind="photo"
                        slot="card"
                      />
                    </div>
                    <div className="ucut-m__guidebody">
                      <h4 className="ucut-m__guidename">{guide.name}</h4>
                      <PhoneGuideRows guide={guide} />
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ))}
        </section>

        <section className="ucut-m__facts" aria-labelledby="ucut-m-good">
          <h2 id="ucut-m-good" className="ucut-m__title">
            Good to know
          </h2>
          <div className="ucut-m__factlist">
            {UCUT_FACTS.map((fact) => {
              const isFindUs = fact.title === 'Find us'
              const body = (
                <>
                  <span className="ucut-m__facticon" aria-hidden="true">
                    {fact.icon}
                  </span>
                  <div>
                    <h3 className="ucut-m__facttitle">{fact.title}</h3>
                    <p className="ucut-m__facttext">{fact.text}</p>
                    {isFindUs && (
                      <p className="ucut-m__cue">
                        Get directions <span aria-hidden="true">→</span>
                        <span className="hues-visually-hidden">(opens in Maps)</span>
                      </p>
                    )}
                  </div>
                </>
              )
              return isFindUs ? (
                <a
                  key={fact.title}
                  href={MAPS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ucut-m__fact"
                >
                  {body}
                </a>
              ) : (
                <div key={fact.title} className="ucut-m__fact">
                  {body}
                </div>
              )
            })}
          </div>
        </section>

        <section className="ucut-m__closing" aria-label="Keep wandering">
          <div className="ucut-m__links">
            {UCUT_PHONE_CLOSING_LINKS.map((link) => (
              <Link key={link.href} href={link.href} context="prose">
                {link.label}
              </Link>
            ))}
          </div>
          <p className="ucut-m__signoff">{UCUT_PHONE_SIGNOFF}</p>
        </section>
      </div>

      <div className="ucut-d c-page">
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
          <Eyebrow>{`Season status · ${buildDate}`}</Eyebrow>
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
    </div>
  )
}
