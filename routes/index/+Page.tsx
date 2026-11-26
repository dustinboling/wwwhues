import { Fragment, type JSX } from 'react'
import {
  CardRail,
  Image,
  Link,
  PacketCard,
  PhotoBand,
  PlateFrame,
  RailEndCard,
  SpotArt,
} from '@hues/ui'
import { HuesScriptLogo } from '../../renderer/logo'
import { parkTodayLabel } from '../../content/park-date'
import {
  CONTACT_PHONE_DISPLAY,
  CONTACT_PHONE_HREF,
  MAPS_URL,
} from '../../content/site'
import {
  ARCADE_BANNER,
  DAHLIA_STRIP,
  DUSK_BAND,
  HERO,
  HOME_CARDS,
  HOME_PHONE,
  MASTHEAD,
  MEET_DUSTY,
  MUSIC_CARD,
  PROCESSION,
  RIGHT_NOW,
  SEASON_CHAPTERS,
  SEASON_STATUS,
  VISIT_PACKET,
  VOLUNTEER_BAR,
} from '../../content/home'
import './home.css'

function Eyebrow({ children }: { children: string }): JSX.Element {
  return <p className="home-eyebrow">{children}</p>
}

// Home (/): prerendered with the complete primary content. The composition
// is per-breakpoint (Slice H opening + P6 sections): phone renders the /m
// page order (masthead, Procession, status, Right Now with spot art, the
// season rail, the dahlia rail, the full-bleed dusk band, Meet Dusty, the
// visit packet, Gather/Sponsor side by side with the green Volunteer bar,
// the Music packet, the Arcade banner); desktop renders the H1 hero block
// with the framed plate, the overlapping status packet, packet cards, the
// framed dahlia strip, and the framed bands. Phone-only and desktop-only
// variants share no ids; the inactive variant is display:none, so the
// visible heading outline stays one h1 per breakpoint. Copy is unchanged
// from the content module; link targets stay on the unified canonicals.
export default function Page(): JSX.Element {
  const buildDate = parkTodayLabel()
  return (
    <div className="home">
      <section className="home-masthead">
        <h1 data-route-title className="home-masthead__brand">
          <HuesScriptLogo className="home-masthead__logo" />
          <span className="home-masthead__park">{MASTHEAD.park}</span>
        </h1>
        <p className="home-masthead__tagline">{MASTHEAD.tagline}</p>
        <div className="home-masthead__rule" aria-hidden="true">
          <i />
        </div>
      </section>

      <figure className="home-procession">
        <Image
          src={PROCESSION.artKey}
          alt={PROCESSION.artAlt}
          kind="plate"
          slot="plate"
          ratio="3/2"
        />
        <figcaption className="home-procession__caption">{PROCESSION.caption}</figcaption>
      </figure>

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
        <PlateFrame size="plate" overlay={HERO.artCaption} className="home-hero__plate">
          <Image
            src={HERO.artKey}
            alt={HERO.artAlt}
            kind="plate"
            slot="hero"
            ratio="16/9"
            priority
          />
        </PlateFrame>
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

      <section className="home-section home-rightnow" aria-labelledby="right-now">
        <div className="home-headrow">
          <div>
            <Eyebrow>{RIGHT_NOW.eyebrow}</Eyebrow>
            <h2 id="right-now" className="home-section__title">
              {RIGHT_NOW.heading}
            </h2>
          </div>
          <SpotArt
            src={HOME_PHONE.rightNowSpotKey}
            size="sm"
            placement="beside"
            className="home-rightnow__spot"
          />
        </div>
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

      <section className="home-section home-seasons-m" aria-labelledby="year-in-blooms-m">
        <div className="home-seasons-m__head">
          <SpotArt src={HOME_PHONE.bloomsSpotKey} size="lg" placement="above" />
          <Eyebrow>{SEASON_CHAPTERS.eyebrow}</Eyebrow>
          <h2 id="year-in-blooms-m" className="home-section__title">
            {SEASON_CHAPTERS.heading}
          </h2>
          <p className="home-section__lede">{HOME_PHONE.chaptersLede}</p>
        </div>
        <CardRail gap="roomy" className="home-bleed">
          {/* Card names come from the card content (no aria-label):
              production's "— meet the flowers" label fails label-in-name
              (WCAG 2.5.3) against the card's visible text. */}
          {SEASON_CHAPTERS.chapters.map((chapter) => (
            <Link
              key={chapter.slug}
              href={`/season/${chapter.slug}`}
              context="nav"
              className="home-chapterlink"
            >
              <PacketCard
                title=""
                radius="md"
                art={
                  <span className="home-chapterart home-chapterart--m">
                    <Image
                      src={chapter.artKey}
                      alt=""
                      decorative
                      kind="photo"
                      slot="card"
                    />
                    <span className="home-chapterart__when">{chapter.when}</span>
                  </span>
                }
                className="home-chaptercard"
              >
                <h3 className="home-chaptercard__title">{chapter.title}</h3>
                <p className="home-chaptercard__text">{chapter.text}</p>
              </PacketCard>
            </Link>
          ))}
          <RailEndCard href={SEASON_CHAPTERS.more.href} title={HOME_PHONE.seasonEndCard} />
        </CardRail>
      </section>

      <section
        className="home-section home-seasons home-seasons-d"
        aria-labelledby="year-in-blooms"
      >
        <Eyebrow>{SEASON_CHAPTERS.eyebrow}</Eyebrow>
        <h2 id="year-in-blooms" className="home-section__title">
          {SEASON_CHAPTERS.heading}
        </h2>
        <p className="home-section__lede">{SEASON_CHAPTERS.lede}</p>
        <div className="home-trio">
          {SEASON_CHAPTERS.chapters.map((chapter) => (
            <Link
              key={chapter.slug}
              href={`/season/${chapter.slug}`}
              context="nav"
              className="home-chapterlink"
            >
              <PacketCard
                title=""
                radius="xl"
                art={
                  <span className="home-chapterart home-chapterart--d">
                    <Image
                      src={chapter.artKey}
                      alt=""
                      decorative
                      kind="photo"
                      slot="card"
                    />
                    <span className="home-chapterart__when">{chapter.when}</span>
                  </span>
                }
                className="home-chaptercard"
              >
                <h3 className="home-chaptercard__title">{chapter.title}</h3>
                <p className="home-chaptercard__text">{chapter.text}</p>
              </PacketCard>
            </Link>
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

      <section className="home-section home-dahlia-m" aria-labelledby="dahlias-m">
        <div className="home-headrow">
          <div>
            <Eyebrow>{DAHLIA_STRIP.eyebrow}</Eyebrow>
            <h2 id="dahlias-m" className="home-section__title">
              {DAHLIA_STRIP.heading}
            </h2>
          </div>
          <SpotArt src={HOME_PHONE.dahliaSpotKey} size="xs" placement="beside" />
        </div>
        <CardRail gap="tight" className="home-bleed">
          {DAHLIA_STRIP.artKeys.map((key) => (
            <PlateFrame key={key} size="tile" className="home-dtile-m">
              <Image src={key} alt={DAHLIA_STRIP.artAlt} slot="card" kind="photo" />
            </PlateFrame>
          ))}
          {/* Stacked end card in route styles (not P5 RailEndCard): the
              component's hardcoded aria-label holds the title only, which
              fails label-in-name against the visible kicker — the route
              card takes its name from its content instead. */}
          <Link href={DAHLIA_STRIP.more.href} context="nav" className="home-railend-stack">
            <span className="home-railend-stack__kicker">{HOME_PHONE.dahliaEndKicker}</span>
            <span className="home-railend-stack__body">
              <span className="home-railend-stack__heading">{HOME_PHONE.dahliaEndTitle}</span>
              <span aria-hidden="true" className="home-railend-stack__arrow">
                →
              </span>
            </span>
          </Link>
        </CardRail>
        <p className="home-dahlia-m__copy">{DAHLIA_STRIP.copy}</p>
        <Link href={DAHLIA_STRIP.more.href} context="prose" className="home-dahlia-m__more">
          {DAHLIA_STRIP.more.label}
        </Link>
      </section>

      <section className="home-section home-dahlia-d" aria-labelledby="dahlias">
        <Eyebrow>{DAHLIA_STRIP.eyebrow}</Eyebrow>
        <h2 id="dahlias" className="home-section__title">
          {DAHLIA_STRIP.heading}
        </h2>
        <div className="home-strip">
          {DAHLIA_STRIP.artKeys.map((key) => (
            <PlateFrame key={key} size="tile" className="home-dtile-d">
              <Image src={key} alt={DAHLIA_STRIP.artAlt} slot="card" kind="photo" />
            </PlateFrame>
          ))}
        </div>
        <p className="home-dahlia-d__copy">{DAHLIA_STRIP.copy}</p>
        <Link href={DAHLIA_STRIP.more.href} context="prose" className="home-dahlia-d__more">
          {DAHLIA_STRIP.more.label}
        </Link>
      </section>

      <div className="home-bandframe home-bleed">
        <PhotoBand
          band="dusk"
          src={DUSK_BAND.artKey}
          alt={DUSK_BAND.artAlt}
          focalPoint="50% 70%"
          caption={
            <>
              <p className="home-band__quote">{DUSK_BAND.quote}</p>
              <p className="home-band__text">{DUSK_BAND.caption}</p>
            </>
          }
        />
      </div>

      <section className="home-dusty" aria-label="Meet Dusty">
        <div className="home-dusty__media">
          <PhotoBand
            band="meet-dusty"
            src={MEET_DUSTY.circleArtKey}
            alt={MEET_DUSTY.circleArtAlt}
          />
          <span className="home-dusty__portrait">
            <Image
              src={MEET_DUSTY.portraitArtKey}
              alt={MEET_DUSTY.portraitArtAlt}
              slot="card"
              kind="photo"
              ratio="1/1"
            />
          </span>
        </div>
        <div className="home-dusty__body">
          <p className="home-dusty__quote">{MEET_DUSTY.quote}</p>
          <p className="home-dusty__copy">{MEET_DUSTY.copy}</p>
          <Link href={MEET_DUSTY.more.href} context="nav" className="home-dusty__cta">
            {MEET_DUSTY.more.label}
          </Link>
        </div>
      </section>

      <section className="home-section home-visitwrap" aria-label="Plan your visit">
        <SpotArt
          src={HOME_PHONE.visitSpotKey}
          size="lg"
          placement="above"
          className="home-visit__spot"
        />
        <div className="home-visit hues-packet-card">
          <Eyebrow>{VISIT_PACKET.title}</Eyebrow>
          <ul className="home-visit__facts">
            {VISIT_PACKET.facts.map((fact, index) =>
              index === 2 ? (
                // The picking-bucket fact carries the /m words on phone
                // (Q1) and the desktop words on desktop; one li shows.
                <Fragment key="bucket">
                  <li className="home-visit__fact home-visit__fact--m">
                    <span aria-hidden="true">🪣</span>
                    <span>{HOME_PHONE.visitBucket}</span>
                  </li>
                  <li className="home-visit__fact home-visit__fact--d">
                    <span aria-hidden="true">{fact.icon}</span>
                    <span>{fact.text}</span>
                  </li>
                </Fragment>
              ) : (
                <li key={fact.text} className="home-visit__fact">
                  <span aria-hidden="true">{fact.icon}</span>
                  <span>{fact.text}</span>
                </li>
              ),
            )}
          </ul>
          <div className="home-status__ctas home-visit__ctas">
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
          <p className="home-visit__ucut">
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
        </div>
      </section>

      <section className="home-section home-gsv-m" aria-label="Gather, sponsor, volunteer">
        <div className="home-gsv-m__grid">
          {HOME_CARDS.slice(0, 2).map((card) => (
            <Link key={card.href} href={card.href} context="nav" className="home-gpcardlink">
              <PacketCard
                title={card.title}
                radius="xl"
                className="home-gpcard home-gpcard--compact"
              >
                <span className="home-eyebrow home-gpcard__eyebrow">{card.eyebrow}</span>
                <span className="home-gpcard__text">{card.text}</span>
                <span className="home-gpcard__cta">{card.cta}</span>
              </PacketCard>
            </Link>
          ))}
        </div>
        <Link href={VOLUNTEER_BAR.href} context="nav" className="home-volbar">
          <span className="home-volbar__titles">
            <span className="home-volbar__title">{VOLUNTEER_BAR.title}</span>
            <span className="home-volbar__text">{VOLUNTEER_BAR.text}</span>
          </span>
          <span aria-hidden="true" className="home-volbar__arrow">
            →
          </span>
        </Link>
      </section>

      <section className="home-section home-gsv-d" aria-label="Gather, sponsor, volunteer">
        <div className="home-trio">
          {HOME_CARDS.map((card) => (
            <Link key={card.href} href={card.href} context="nav" className="home-gpcardlink">
              <PacketCard title={card.title} radius="xl" className="home-gpcard">
                <span className="home-eyebrow home-gpcard__eyebrow">{card.eyebrow}</span>
                <span className="home-gpcard__text">{card.text}</span>
                <span className="home-gpcard__cta">{card.cta}</span>
              </PacketCard>
            </Link>
          ))}
        </div>
      </section>

      <section className="home-section home-music" aria-label="Music">
        {/* Unlinked PacketCards throughout this route: the component's
            linked variant names the link from the title alone, which fails
            label-in-name (WCAG 2.5.3) against the card body — the outer
            route link takes its name from the whole card instead. */}
        <Link href={MUSIC_CARD.href} context="nav" className="home-gpcardlink">
          <PacketCard title={MUSIC_CARD.title} radius="xl" className="home-gpcard home-music__card">
            <span className="home-eyebrow home-gpcard__eyebrow">{MUSIC_CARD.eyebrow}</span>
            <span className="home-gpcard__text">{MUSIC_CARD.text}</span>
            <span className="home-music__pill">{MUSIC_CARD.cta}</span>
          </PacketCard>
        </Link>
      </section>

      <section className="home-section home-arcade" aria-label="Hues Arcade">
        <Link href={ARCADE_BANNER.href} context="nav" className="home-arcade__card">
          <span className="home-arcade__art">
            <Image
              src={ARCADE_BANNER.artKey}
              alt=""
              decorative
              slot="card"
              kind="photo"
              focalPoint="50% 70%"
            />
          </span>
          <span aria-hidden="true" className="home-arcade__fade" />
          <span className="home-arcade__body">
            <span className="home-arcade__title">
              {ARCADE_BANNER.titleLead}
              <span className="home-arcade__accent">{ARCADE_BANNER.titleAccent}</span>
            </span>
            <span className="home-arcade__text">{ARCADE_BANNER.text}</span>
            <span className="home-arcade__pill">{ARCADE_BANNER.cta}</span>
          </span>
        </Link>
      </section>
    </div>
  )
}
