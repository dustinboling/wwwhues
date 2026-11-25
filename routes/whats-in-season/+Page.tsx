import type { JSX } from 'react'
import { Image, Link } from '@hues/ui'
import { parkTodayLabel } from '../../content/park-date'
import {
  CONTACT_PHONE_DISPLAY,
  CONTACT_PHONE_HREF,
  PARK_SIGNOFF,
} from '../../content/site'
import {
  SEASONS,
  SEASONS_HERO,
  SEASONS_PLAN_VISIT,
  SEASONS_STATUS,
  SEASONS_WORKING_ON,
  SEASONS_YEAR,
} from '../../content/seasons'
import '../../renderer/content.css'
import '../../renderer/seasons.css'

function Eyebrow({ children }: { children: string }): JSX.Element {
  return <p className="c-eyebrow">{children}</p>
}

// Season hub (/whats-in-season): the merged hub — hero, the
// build-time season-status snapshot (honestly labelled, never live),
// the three season panels linking to the top-level /season/:slug
// routes (N1), the working-on list, and the plan-your-visit close.
export default function Page(): JSX.Element {
  const buildDate = parkTodayLabel()
  return (
    <div className="c-page">
      <section className="c-head" aria-labelledby="seasons-title">
        <h1 id="seasons-title" data-route-title className="c-title">
          {SEASONS_HERO.heading}
        </h1>
        {SEASONS_HERO.ledes.map((lede) => (
          <p key={lede.slice(0, 24)} className="c-lede">
            {lede}
          </p>
        ))}
      </section>

      <section className="c-status hues-packet-card" aria-label="Season status">
        <Eyebrow>{`${SEASONS_STATUS.eyebrow} · ${buildDate}`}</Eyebrow>
        <h2 className="c-status__title">{SEASONS_STATUS.headline}</h2>
        <p className="c-status__body">{SEASONS_STATUS.body}</p>
        <p className="c-snapshot">{SEASONS_STATUS.snapshotNote(buildDate)}</p>
      </section>

      <section className="c-section" aria-labelledby="year-in-blooms">
        <div className="c-head">
          <Eyebrow>{SEASONS_YEAR.eyebrow}</Eyebrow>
          <h2 id="year-in-blooms" className="c-section__title">
            {SEASONS_YEAR.title}
          </h2>
        </div>
        <div className="seasons-panels">
          {SEASONS.map((season) => (
            <article key={season.slug} className="seasons-panel hues-packet-card">
              <Link
                href={`/season/${season.slug}`}
                context="nav"
                className="seasons-panel__link"
              >
                <span className="seasons-panel__art">
                  <Image
                    src={season.artKey}
                    alt=""
                    decorative
                    kind="plate"
                    slot="plate"
                    ratio="16/9"
                  />
                  <span className="seasons-panel__when">{season.when}</span>
                </span>
                <span className="seasons-panel__body">
                  <span className="seasons-panel__title">{season.title}</span>
                  <span className="seasons-panel__lede">{season.lede}</span>
                  <span className="seasons-panel__points">
                    {season.points.map((point) => (
                      <span key={point} className="seasons-panel__point">
                        {point}
                      </span>
                    ))}
                  </span>
                  <span className="seasons-panel__cta">{SEASONS_YEAR.cta}</span>
                </span>
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="c-section" aria-labelledby="seasons-working-on">
        <div className="c-head">
          <Eyebrow>{SEASONS_WORKING_ON.eyebrow}</Eyebrow>
          <h2 id="seasons-working-on" className="c-section__title">
            {SEASONS_WORKING_ON.title}
          </h2>
          <p className="c-lede c-lede--left">{SEASONS_WORKING_ON.intro}</p>
        </div>
        <div className="c-grid c-grid--2">
          {SEASONS_WORKING_ON.items.map((item) => (
            <article key={item.title} className="seasons-work hues-content-card">
              <h3 className="seasons-work__title">{item.title}</h3>
              <p className="seasons-work__text">{item.text}</p>
            </article>
          ))}
        </div>
        <p className="seasons-more">
          {SEASONS_WORKING_ON.more.lead}{' '}
          <Link href={SEASONS_WORKING_ON.more.href} context="prose">
            {SEASONS_WORKING_ON.more.label}
          </Link>
          {SEASONS_WORKING_ON.more.tail}
        </p>
      </section>

      <section className="c-section" aria-labelledby="seasons-plan-visit">
        <div className="seasons-plan hues-packet-card">
          <h2 id="seasons-plan-visit" className="c-section__title">
            {SEASONS_PLAN_VISIT.title}
          </h2>
          <p className="c-lede c-lede--left">{SEASONS_PLAN_VISIT.body}</p>
          <p className="seasons-plan__signoff">{PARK_SIGNOFF}</p>
          <p className="seasons-plan__address">
            {SEASONS_PLAN_VISIT.address} ·{' '}
            <Link href={CONTACT_PHONE_HREF} context="prose">
              {CONTACT_PHONE_DISPLAY}
            </Link>
          </p>
          <p className="seasons-plan__more">
            <Link href={SEASONS_PLAN_VISIT.more.href} context="prose">
              {SEASONS_PLAN_VISIT.more.label}
            </Link>
          </p>
        </div>
      </section>
    </div>
  )
}
