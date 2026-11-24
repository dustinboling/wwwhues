import type { JSX } from 'react'
import { ContentCard, Image, Link } from '@hues/ui'
import { parkTodayLabel } from '../../content/park-date'
import {
  CONTACT_PHONE_DISPLAY,
  CONTACT_PHONE_HREF,
  MAPS_URL,
} from '../../content/site'
import {
  DAHLIA_STRIP,
  DUSK_BAND,
  HERO,
  HOME_CARDS,
  MEET_DUSTY,
  MUSIC_CARD,
  RIGHT_NOW,
  SEASON_CHAPTERS,
  SEASON_STATUS,
  VISIT_PACKET,
} from '../../content/home'
import './home.css'

function Eyebrow({ children }: { children: string }): JSX.Element {
  return <p className="home-eyebrow">{children}</p>
}

// Home (/): prerendered with the complete primary content — hero, the
// season-status build-time snapshot (honestly labelled, never live),
// the season chapters, Right Now, dahlias, the dusk band, Meet Dusty,
// the visit packet, and the gather/sponsor/volunteer/music cards.
export default function Page(): JSX.Element {
  const buildDate = parkTodayLabel()
  return (
    <div className="home">
      <section className="home-hero" aria-labelledby="home-title">
        <Eyebrow>{HERO.eyebrow}</Eyebrow>
        <h1 id="home-title" data-route-title className="home-hero__title">
          {HERO.heading}
        </h1>
        <p className="home-hero__lede">{HERO.lede}</p>
        <div className="home-hero__ctas">
          <Link
            href={HERO.primaryCta.href}
            context="nav"
            className="hues-button hues-button--primary"
          >
            {HERO.primaryCta.label}
          </Link>
          <Link href={HERO.secondaryCta.href} context="prose" className="home-hero__more">
            {HERO.secondaryCta.label} →
          </Link>
        </div>
        <figure className="home-hero__plate">
          <Image
            src={HERO.artKey}
            alt={HERO.artAlt}
            kind="plate"
            slot="hero"
            ratio="16/9"
            priority
          />
          <figcaption className="home-hero__caption">{HERO.artCaption}</figcaption>
        </figure>
      </section>

      <section className="home-status hues-packet-card" aria-label="Season status">
        <Eyebrow>{`${SEASON_STATUS.eyebrow} · ${buildDate}`}</Eyebrow>
        <h2 className="home-status__headline">{SEASON_STATUS.headline}</h2>
        <p className="home-status__detail">{SEASON_STATUS.detail}</p>
        <div className="home-status__ctas">
          <Link
            href={SEASON_STATUS.primaryCta.href}
            context="nav"
            className="hues-button hues-button--primary"
          >
            {SEASON_STATUS.primaryCta.label}
          </Link>
          <Link
            href={SEASON_STATUS.secondaryCta.href}
            context="nav"
            className="hues-button hues-button--secondary"
          >
            {SEASON_STATUS.secondaryCta.label}
          </Link>
        </div>
        <p className="home-status__snapshot">{SEASON_STATUS.snapshotNote(buildDate)}</p>
      </section>

      <section className="home-section" aria-labelledby="right-now">
        <Eyebrow>{RIGHT_NOW.eyebrow}</Eyebrow>
        <h2 id="right-now" className="home-section__title">
          {RIGHT_NOW.heading}
        </h2>
        <div className="home-trio">
          {RIGHT_NOW.items.map((item, index) => (
            <article key={item.title} className="home-trio__card hues-content-card">
              <span className="home-trio__index" aria-hidden="true">
                {String(index + 1).padStart(2, '0')}
              </span>
              <h3 className="home-trio__title">{item.title}</h3>
              <p className="home-trio__text">{item.text}</p>
            </article>
          ))}
        </div>
        <Link href={RIGHT_NOW.more.href} context="prose">
          {RIGHT_NOW.more.label}
        </Link>
      </section>

      <section className="home-section home-seasons" aria-labelledby="year-in-blooms">
        <Eyebrow>{SEASON_CHAPTERS.eyebrow}</Eyebrow>
        <h2 id="year-in-blooms" className="home-section__title">
          {SEASON_CHAPTERS.heading}
        </h2>
        <p className="home-section__lede">{SEASON_CHAPTERS.lede}</p>
        <div className="home-trio">
          {SEASON_CHAPTERS.chapters.map((chapter) => (
            <article key={chapter.slug} className="home-chapter hues-content-card">
              <Link
                href={`/season/${chapter.slug}`}
                context="nav"
                className="hues-content-card__link"
                aria-label={`${chapter.title} — meet the flowers`}
              >
                <span className="home-chapter__art">
                  <Image
                    src={chapter.artKey}
                    alt=""
                    decorative
                    kind="plate"
                    slot="plate"
                    ratio="16/9"
                  />
                  <span className="home-chapter__when">{chapter.when}</span>
                </span>
                <h3 className="home-trio__title">{chapter.title}</h3>
                <p className="home-trio__text">{chapter.text}</p>
              </Link>
            </article>
          ))}
        </div>
        <div className="home-section__cta">
          <Link
            href={SEASON_CHAPTERS.more.href}
            context="nav"
            className="hues-button hues-button--primary"
          >
            {SEASON_CHAPTERS.more.label}
          </Link>
        </div>
      </section>

      <section className="home-section" aria-labelledby="dahlias">
        <Eyebrow>{DAHLIA_STRIP.eyebrow}</Eyebrow>
        <h2 id="dahlias" className="home-section__title">
          {DAHLIA_STRIP.heading}
        </h2>
        <div className="home-strip">
          {DAHLIA_STRIP.artKeys.map((key) => (
            <Image key={key} src={key} alt={DAHLIA_STRIP.artAlt} slot="card" ratio="4/5" />
          ))}
        </div>
        <p className="home-section__lede">{DAHLIA_STRIP.copy}</p>
        <Link href={DAHLIA_STRIP.more.href} context="prose">
          {DAHLIA_STRIP.more.label}
        </Link>
      </section>

      <figure className="home-band">
        <Image
          src={DUSK_BAND.artKey}
          alt={DUSK_BAND.artAlt}
          slot="band"
          focalPoint="50% 70%"
        />
        <figcaption className="home-band__caption">
          <p className="home-band__quote">{DUSK_BAND.quote}</p>
          <p className="home-band__text">{DUSK_BAND.caption}</p>
        </figcaption>
      </figure>

      <section className="home-dusty" aria-label="Meet Dusty">
        <Image src={MEET_DUSTY.circleArtKey} alt={MEET_DUSTY.circleArtAlt} slot="band" />
        <div className="home-dusty__body">
          <span className="home-dusty__portrait">
            <Image
              src={MEET_DUSTY.portraitArtKey}
              alt={MEET_DUSTY.portraitArtAlt}
              slot="card"
              ratio="1/1"
            />
          </span>
          <p className="home-dusty__quote">{MEET_DUSTY.quote}</p>
          <p className="home-dusty__copy">{MEET_DUSTY.copy}</p>
          <Link href={MEET_DUSTY.more.href} context="nav" className="home-dusty__cta">
            {MEET_DUSTY.more.label}
          </Link>
        </div>
      </section>

      <section className="home-visit hues-packet-card" aria-label="Plan your visit">
        <Eyebrow>{VISIT_PACKET.title}</Eyebrow>
        <ul className="home-visit__facts">
          {VISIT_PACKET.facts.map((fact) => (
            <li key={fact.text} className="home-visit__fact">
              <span aria-hidden="true">{fact.icon}</span>
              <span>{fact.text}</span>
            </li>
          ))}
        </ul>
        <div className="home-status__ctas">
          <Link href={MAPS_URL} context="nav" className="hues-button hues-button--primary">
            Get directions
          </Link>
          <Link
            href={CONTACT_PHONE_HREF}
            context="nav"
            className="hues-button hues-button--secondary"
          >
            {CONTACT_PHONE_DISPLAY}
          </Link>
        </div>
        <p>
          <Link href={VISIT_PACKET.ucut.href} context="prose">
            {VISIT_PACKET.ucut.label}
          </Link>
        </p>
        <div className="home-driving">
          {VISIT_PACKET.driving.map((route) => (
            <div key={route.title}>
              <h2 className="home-driving__title">{route.title}</h2>
              <ol className="home-driving__steps">
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
      </section>

      <section className="home-section" aria-label="Gather, sponsor, volunteer">
        <div className="home-trio">
          {HOME_CARDS.map((card) => (
            <ContentCard
              key={card.href}
              eyebrow={card.eyebrow}
              title={card.title}
              description={card.text}
              cta={card.cta}
              href={card.href}
            />
          ))}
        </div>
      </section>

      <section className="home-section" aria-label="Music">
        <ContentCard
          eyebrow={MUSIC_CARD.eyebrow}
          title={MUSIC_CARD.title}
          description={MUSIC_CARD.text}
          cta={MUSIC_CARD.cta}
          href={MUSIC_CARD.href}
        />
      </section>
    </div>
  )
}
