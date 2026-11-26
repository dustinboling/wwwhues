import type { JSX } from 'react'
import { Image, Link, PhoneHero } from '@hues/ui'
import { usePageContext } from 'vike-react/usePageContext'
import { NotFound } from '../../../content/NotFound'
import { PARK_SIGNOFF } from '../../../content/site'
import {
  SEASON_DAHLIAS_CARD,
  SEASON_DETAIL_FOOTER,
  SEASON_PHONE_SIGNOFF,
  seasonBySlug,
  seasonNext,
  type Season,
  type SeasonFlower,
} from '../../../content/seasons'
import '../../../renderer/content.css'
import '../../../renderer/seasons.css'
import './season.css'

function Eyebrow({ children }: { children: string }): JSX.Element {
  return <p className="c-eyebrow">{children}</p>
}

function FlowerCard({ flower }: { flower: SeasonFlower }): JSX.Element {
  if (flower.photoKey === undefined) {
    return (
      <article className="seasons-flower hues-content-card">
        <div className="seasons-flower__head">
          <span
            aria-hidden="true"
            className="seasons-flower__swatch"
            style={{ backgroundColor: flower.swatch ?? 'transparent' }}
          />
          <h3 className="seasons-flower__name">{flower.name}</h3>
          <span className="c-badge">{flower.tag}</span>
        </div>
        <p className="seasons-flower__when">{flower.when}</p>
        <p className="seasons-flower__text">{flower.text}</p>
      </article>
    )
  }
  return (
    <article className="seasons-flower hues-packet-card">
      <Image
        src={flower.photoKey}
        alt={flower.photoAlt ?? `${flower.name} at Hues Floral Park`}
        kind="plate"
        slot="plate"
        ratio="4/3"
      />
      <div className="seasons-flower__body">
        <div className="seasons-flower__head">
          <h3 className="seasons-flower__name">{flower.name}</h3>
          <span className="c-badge">{flower.tag}</span>
        </div>
        <p className="seasons-flower__when">{flower.when}</p>
        <p className="seasons-flower__text">{flower.text}</p>
      </div>
    </article>
  )
}

function PhoneFlowerCard({ flower }: { flower: SeasonFlower }): JSX.Element {
  const tag = <span className="seas-m__tag">{flower.tag}</span>
  if (flower.photoKey === undefined) {
    return (
      <article className="seas-m__flowerplain">
        <div className="seas-m__plainhead">
          <span
            aria-hidden="true"
            className="seas-m__swatch"
            style={{ backgroundColor: flower.swatch ?? 'transparent' }}
          />
          <h3 className="seas-m__plainname">{flower.name}</h3>
          {tag}
        </div>
        <p className="seas-m__plainwhen">{flower.when}</p>
        <p className="seas-m__plaintext">{flower.text}</p>
      </article>
    )
  }
  return (
    <article className="seas-m__flower">
      <div className="seas-m__flowerart">
        <Image
          src={flower.photoKey}
          alt={flower.photoAlt ?? `${flower.name} at Hues Floral Park`}
          kind="photo"
          slot="plate"
        />
      </div>
      <div className="seas-m__flowerbody">
        <div className="seas-m__flowerhead">
          <h3 className="seas-m__flowername">{flower.name}</h3>
          {tag}
        </div>
        <p className="seas-m__flowerwhen">{flower.when}</p>
        <p className="seas-m__flowertext">{flower.text}</p>
      </div>
    </article>
  )
}

// Season detail (/season/:slug, N1): per-breakpoint composition (P8
// phone, P9b desktop heading repair). Phone renders the
// /m/season/[slug] order — the hero band, the group card art with its
// when chip, and the flower cards stacked with their paintings cropped
// edge-to-edge as production crops them (Q6: kind="photo" cover,
// overriding the pad-never-crop plate rule for season cards
// specifically). Desktop keeps its Slice B composition with its h1
// title, as production renders it. The two variants share no ids; the
// inactive one is display:none, so the visible outline holds one h1
// per breakpoint (the home precedent).
//
// Preloads: the head preload covers the desktop first plate (pad
// fit); the phone renders the same keys at cover fit, so there is no
// shared LCP URL to preload — the phone art loads lazily in-viewport
// (the home-procession precedent) with zero cross-breakpoint waste.
function SeasonDetail({ season }: { season: Season }): JSX.Element {
  const next = seasonNext(season.slug)
  return (
    <div className="seas">
      <div className="seas-m">
        <PhoneHero
          eyebrow={`What’s in season · ${season.when}`}
          title={`${season.title} at Hues`}
          intro={season.lede}
          routeTitle
        />

        {season.groups.map((group, index) => (
          <section key={group.heading} className="seas-m__group" aria-labelledby={`m-group-${index}`}>
            <div className="seas-m__card">
              <Image
                src={group.artKey}
                alt=""
                decorative
                kind="photo"
                slot="plate"
              />
              <span className="seas-m__when">{group.when}</span>
            </div>
            <p className="seas-m__eyebrow">{SEASON_DETAIL_FOOTER.groupEyebrow(group.when)}</p>
            <h2 id={`m-group-${index}`} className="seas-m__grouptitle">
              {group.heading}
            </h2>
            <div className="seas-m__flowers">
              {group.flowers.map((flower) => (
                <PhoneFlowerCard key={flower.name} flower={flower} />
              ))}
            </div>
          </section>
        ))}

        {season.slug === 'fall' && (
          <section className="seas-m__catalogwrap" aria-label={SEASON_DAHLIAS_CARD.eyebrow}>
            <Link
              href={SEASON_DAHLIAS_CARD.href}
              context="nav"
              className="seas-m__catalog"
            >
              <span className="seas-m__catalogeyebrow">{SEASON_DAHLIAS_CARD.eyebrow}</span>
              <span className="seas-m__catalogtitle">{SEASON_DAHLIAS_CARD.title}</span>
              <span className="seas-m__catalogtext">{SEASON_DAHLIAS_CARD.text}</span>
            </Link>
          </section>
        )}

        <nav className="seas-m__footer" aria-label="More seasons">
          <Link href={SEASON_DETAIL_FOOTER.hub.href} context="prose">
            {SEASON_DETAIL_FOOTER.hub.label}
          </Link>
          <Link href={`/season/${next.slug}`} context="prose">
            {`Next: ${next.title} ›`}
          </Link>
        </nav>
        <p className="seas-m__signoff">{SEASON_PHONE_SIGNOFF}</p>
      </div>

      <div className="seas-d c-page">
        <section className="c-head" aria-labelledby="season-title">
          <Eyebrow>{`What’s in season · ${season.when}`}</Eyebrow>
          {/* h1, as production renders it (P9b): the phone hero carries
              the page h1 at its breakpoint and this title carries it at
              desktop — the inactive variant is display:none, so the
              visible outline holds one h1 either way. */}
          <h1 id="season-title" data-route-title className="c-title">
            {season.title} at Hues
          </h1>
          <p className="c-lede">{season.lede}</p>
        </section>

        {season.groups.map((group, index) => (
          <section key={group.heading} className="c-section" aria-labelledby={`group-${index}`}>
            <figure className="c-plate hues-packet-card">
              <Image
                src={group.artKey}
                alt=""
                decorative
                kind="plate"
                slot="plate"
                ratio="21/9"
                priority={index === 0}
              />
              <figcaption className="c-plate__caption">{group.when}</figcaption>
            </figure>
            <Eyebrow>{SEASON_DETAIL_FOOTER.groupEyebrow(group.when)}</Eyebrow>
            <h2 id={`group-${index}`} className="c-section__title">
              {group.heading}
            </h2>
            <div className="seasons-flowers">
              {group.flowers.map((flower) => (
                <FlowerCard key={flower.name} flower={flower} />
              ))}
            </div>
          </section>
        ))}

        {season.slug === 'fall' && (
          <section className="c-section" aria-label={SEASON_DAHLIAS_CARD.eyebrow}>
            <Link
              href={SEASON_DAHLIAS_CARD.href}
              context="nav"
              className="seasons-catalog"
            >
              <span className="c-eyebrow">{SEASON_DAHLIAS_CARD.eyebrow}</span>
              <span className="seasons-catalog__title">{SEASON_DAHLIAS_CARD.title}</span>
              <span className="seasons-catalog__text">{SEASON_DAHLIAS_CARD.text}</span>
            </Link>
          </section>
        )}

        <nav className="seasons-footer" aria-label="More seasons">
          <Link href={SEASON_DETAIL_FOOTER.hub.href} context="prose">
            {SEASON_DETAIL_FOOTER.hub.label}
          </Link>
          <Link href={`/season/${next.slug}`} context="prose">
            {`Next: ${next.title} ›`}
          </Link>
        </nav>
        <p className="seasons-signoff">{PARK_SIGNOFF}</p>
      </div>
    </div>
  )
}

// Season detail (/season/:slug, N1): each season's full flower cards
// from the single seasons source. Unknown slugs render the branded
// 404 in place on client-side navigation; cold requests 404 at the
// edge, where no such asset exists.
export default function Page(): JSX.Element {
  const { routeParams } = usePageContext()
  const season = seasonBySlug(routeParams.slug ?? '')
  if (season === undefined) return <NotFound />
  return <SeasonDetail season={season} />
}
