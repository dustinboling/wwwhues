import type { JSX } from 'react'
import { Image, Link } from '@hues/ui'
import { usePageContext } from 'vike-react/usePageContext'
import { NotFound } from '../../../content/NotFound'
import { PARK_SIGNOFF } from '../../../content/site'
import {
  SEASON_DAHLIAS_CARD,
  SEASON_DETAIL_FOOTER,
  seasonBySlug,
  seasonNext,
  type Season,
  type SeasonFlower,
} from '../../../content/seasons'
import '../../../renderer/content.css'
import '../../../renderer/seasons.css'

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

function SeasonDetail({ season }: { season: Season }): JSX.Element {
  const next = seasonNext(season.slug)
  return (
    <div className="c-page">
      <section className="c-head" aria-labelledby="season-title">
        <Eyebrow>{`What’s in season · ${season.when}`}</Eyebrow>
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
