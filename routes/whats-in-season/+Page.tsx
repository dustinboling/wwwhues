import type { JSX } from 'react'
import { Image, Link, PhoneHero, SpotArt } from '@hues/ui'
import { parkTodayLabel } from '../../content/park-date'
import {
  CONTACT_PHONE_DISPLAY,
  CONTACT_PHONE_HREF,
  PARK_SIGNOFF,
} from '../../content/site'
import {
  SEASONS,
  SEASONS_HERO,
  SEASONS_PHONE_HERO,
  SEASONS_PHONE_STATUS,
  SEASONS_PHONE_WORKING_ON,
  SEASONS_PHONE_YEAR,
  SEASONS_PLAN_VISIT,
  SEASONS_STATUS,
  SEASONS_WORKING_ON,
  SEASONS_YEAR,
  type SeasonFlower,
} from '../../content/seasons'
import '../../renderer/content.css'
import '../../renderer/seasons.css'
import './whats-in-season.css'

function Eyebrow({ children }: { children: string }): JSX.Element {
  return <p className="c-eyebrow">{children}</p>
}

// Hub flower card (P9, Q3): production's desktop catalog card — the
// watercolor plate, name, tag chip, when line, and text. Same classes
// as the detail flower card, one heading level deeper (h5): the hub
// nests season (h3) → group (h4) → flower (h5), exactly the production
// desktop outline.
function HubFlowerCard({ flower }: { flower: SeasonFlower }): JSX.Element {
  return (
    <article className="seasons-flower hues-packet-card">
      {flower.photoKey !== undefined && (
        <Image
          src={flower.photoKey}
          alt={flower.photoAlt ?? `${flower.name} at Hues Floral Park`}
          kind="plate"
          slot="plate"
          ratio="4/3"
        />
      )}
      <div className="seasons-flower__body">
        <div className="seasons-flower__head">
          <h5 className="seasons-flower__name">{flower.name}</h5>
          <span className="c-badge">{flower.tag}</span>
        </div>
        <p className="seasons-flower__when">{flower.when}</p>
        <p className="seasons-flower__text">{flower.text}</p>
      </div>
    </article>
  )
}

// Season hub (/whats-in-season): per-breakpoint composition (P8 phone,
// P9 desktop catalog + heading repair). Phone renders the /m/season
// order — the frost-frame hero band, the /m season-status card (Q1
// words, with the staging snapshot note the prerender owes), the
// rainbow over "The season at a glance", the three chapter cards, and
// the working-on list — with the desktop-only plan-your-visit close
// staying in the HTML via the desktop variant. Desktop renders the
// production desktop composition: hero, status snapshot, the full
// 40-flower catalog inline under the season panels (Q3: the catalog
// AND the season pages), working-on, plan-your-visit. The two variants
// share no ids; the inactive one is display:none. Each variant carries
// its own h1 (production's desktop outline restored, P9), so the
// visible outline stays one h1 per breakpoint.
export default function Page(): JSX.Element {
  const buildDate = parkTodayLabel()
  return (
    <div className="seash">
      <div className="seash-m">
        <PhoneHero
          eyebrow={SEASONS_PHONE_HERO.eyebrow}
          title={SEASONS_PHONE_HERO.heading}
          artFrame="frost"
          art={
            <Image
              src={SEASONS_PHONE_HERO.artKey}
              alt={SEASONS_PHONE_HERO.artAlt}
              kind="photo"
              slot="band"
            />
          }
          routeTitle
        />

        <section className="seash-m__status" aria-label="Season status">
          <div className="seash-m__statuscard">
            <p className="seash-m__badge">
              <span aria-hidden="true" className="seash-m__dot" />
              {`${SEASONS_PHONE_STATUS.eyebrow} · ${buildDate}`}
            </p>
            <h2 className="seash-m__statustitle">{SEASONS_PHONE_STATUS.headline}</h2>
            <p className="seash-m__statustext">{SEASONS_PHONE_STATUS.body}</p>
            <p className="c-snapshot">{SEASONS_STATUS.snapshotNote(buildDate)}</p>
          </div>
        </section>

        <section className="seash-m__glance" aria-labelledby="seash-glance">
          <SpotArt src={SEASONS_PHONE_YEAR.spotKey} size="md" className="seash-m__rainbow" />
          <h2 id="seash-glance" className="seash-m__title">
            {SEASONS_PHONE_YEAR.title}
          </h2>
          <div className="seash-m__chapters">
            {/* Card names come from the card content (no aria-label):
                production's "— meet the flowers" label fails label-in-name
                (WCAG 2.5.3) against the card's visible text — same as the
                home season rail. */}
            {SEASONS.map((season) => (
              <Link
                key={season.slug}
                href={`/season/${season.slug}`}
                context="nav"
                className="seash-m__chapterlink"
              >
                <article className="seash-m__chapter">
                  <div className="seash-m__art">
                    <Image
                      src={season.artKey}
                      alt=""
                      decorative
                      kind="photo"
                      slot="plate"
                    />
                    <span className="seash-m__when">{season.when}</span>
                  </div>
                  <div className="seash-m__chapterbody">
                    <h3 className="seash-m__chaptertitle">{season.title}</h3>
                    <ul className="seash-m__points">
                      {season.points.map((point) => (
                        <li key={point} className="seash-m__point">
                          {point}
                        </li>
                      ))}
                    </ul>
                    <span className="seash-m__cta">{SEASONS_YEAR.cta}</span>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </section>

        <section id="working-on" className="seash-m__work" aria-labelledby="seash-work">
          <p className="seash-m__eyebrow">{SEASONS_PHONE_WORKING_ON.eyebrow}</p>
          <h2 id="seash-work" className="seash-m__title">
            {SEASONS_PHONE_WORKING_ON.title}
          </h2>
          <p className="seash-m__workintro">{SEASONS_PHONE_WORKING_ON.intro}</p>
          <div className="seash-m__worklist">
            {SEASONS_WORKING_ON.items.map((item) => (
              <article key={item.title} className="seash-m__workcard">
                <h3 className="seash-m__worktitle">{item.title}</h3>
                <p className="seash-m__worktext">{item.text}</p>
              </article>
            ))}
          </div>
        </section>
      </div>

      <div className="seash-d c-page">
        <section className="c-head" aria-labelledby="seasons-title">
          {/* h1, as production renders it: the P8 phone-h1/desktop-h2
              split regressed the desktop heading outline (P9). Each
              variant carries its own h1; the inactive one is
              display:none, so the visible outline stays one h1 per
              breakpoint. Same id, class, and text, so the desktop
              rendering is unchanged. */}
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
          {/* Q3: the season doors stay (the panel link cards), and the
              full 40-flower catalog renders inline beneath them, as
              production's desktop hub does — season (h3) → group (h4)
              → flower (h5), the production outline. */}
          <div className="seasons-hubseasons">
            {SEASONS.map((season) => (
              <div key={season.slug} className="seasons-hubseason">
                <article className="seasons-panel hues-packet-card">
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
                      <h3 className="seasons-panel__title">{season.title}</h3>
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
                {season.groups.map((group) => (
                  <div key={group.heading} className="seasons-hubgroup">
                    <div className="seasons-hubgroup__head">
                      <h4 className="seasons-hubgroup__title">{group.heading}</h4>
                      <span className="seasons-hubgroup__when">{group.when}</span>
                    </div>
                    <div className="seasons-flowers">
                      {group.flowers.map((flower) => (
                        <HubFlowerCard key={flower.name} flower={flower} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
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
    </div>
  )
}
