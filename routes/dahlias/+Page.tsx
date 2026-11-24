import { useEffect, useMemo, useRef, useState } from 'react'
import type { JSX } from 'react'
import {
  Button,
  EmptyState,
  Image,
  Link,
  SegmentedControl,
  TextField,
  useAnnouncer,
} from '@hues/ui'
import { PARK_SIGNOFF } from '../../content/site'
import {
  DAHLIAS,
  DAHLIAS_FILTER,
  DAHLIAS_GAME_CARD,
  DAHLIAS_HERO,
  EMPTY_DAHLIAS_QUERY,
  NO_PHOTO_ART_KEY,
  dahliasQueryString,
  filterCultivars,
  groupCultivarsByLetter,
  hasPhoto,
  parseDahliasQuery,
  type DahliaCultivar,
  type DahliaPhotoFilter,
  type DahliasQuery,
} from '../../content/dahlias'
import '../../renderer/content.css'
import './dahlias.css'

function Eyebrow({ children }: { children: string }): JSX.Element {
  return <p className="c-eyebrow">{children}</p>
}

function CultivarCard({ cultivar }: { cultivar: DahliaCultivar }): JSX.Element {
  return (
    <li className="dahlias-card hues-packet-card">
      {cultivar.photoKey !== null ? (
        <span className="dahlias-card__photo">
          <Image
            src={cultivar.photoKey}
            alt={`${cultivar.name} dahlia in bloom at Hues Floral Park`}
            slot="card"
            ratio="4/3"
          />
        </span>
      ) : (
        <span className="dahlias-card__plate">
          <Image src={NO_PHOTO_ART_KEY} alt="" decorative slot="card" ratio="4/3" />
          <span className="dahlias-card__noname">{cultivar.name}</span>
          <span className="dahlias-card__nophoto">No photo yet</span>
        </span>
      )}
      <span className="dahlias-card__body">
        <span className="dahlias-card__name">{cultivar.name}</span>
        {cultivar.description !== '' && (
          <span className="dahlias-card__text">{cultivar.description}</span>
        )}
        <Link
          href={cultivar.link.href}
          context="prose"
          target="_blank"
          rel="noreferrer"
          aria-label={`See photos of ${cultivar.name} on Google (opens in new tab)`}
          className="dahlias-card__link"
        >
          See photos ↗
        </Link>
      </span>
    </li>
  )
}

// Dahlias (/dahlias): the collection — prerendered with the full A–Z
// grid (the served HTML always carries every cultivar), with the
// filter state as client state mirrored into the URL query (q + photo
// per the policy table in content/dahlias.ts). Typing searches in
// place via replaceState; the photo facet pushes one history entry per
// deliberate change, so Back/Forward walk filter states in place.
export default function Page(): JSX.Element {
  const [query, setQuery] = useState<DahliasQuery>(EMPTY_DAHLIAS_QUERY)
  const announce = useAnnouncer()
  const announced = useRef(false)

  // The prerender carries the unfiltered grid; the URL's filter state
  // applies on mount and on Back/Forward — never during prerender.
  useEffect(() => {
    setQuery(parseDahliasQuery(window.location.search))
    const onPopState = (): void => {
      setQuery(parseDahliasQuery(window.location.search))
    }
    window.addEventListener('popstate', onPopState)
    return () => {
      window.removeEventListener('popstate', onPopState)
    }
  }, [])

  const visible = useMemo(() => filterCultivars(DAHLIAS, query), [query])
  const groups = useMemo(() => groupCultivarsByLetter(visible), [visible])
  const photoCount = useMemo(() => DAHLIAS.filter(hasPhoto).length, [])
  const filtered = query.q !== '' || query.photo !== 'all'

  useEffect(() => {
    if (!announced.current) {
      announced.current = true
      return
    }
    announce(
      filtered
        ? `${visible.length} of ${DAHLIAS.length} varieties match`
        : `Showing all ${DAHLIAS.length} varieties`,
    )
  }, [visible.length, filtered, announce])

  const applyQuery = (next: DahliasQuery, push: boolean): void => {
    setQuery(next)
    const url = `/dahlias${dahliasQueryString(next)}`
    if (push) window.history.pushState(null, '', url)
    else window.history.replaceState(null, '', url)
  }

  return (
    <div className="c-page">
      <section className="c-head" aria-labelledby="dahlias-title">
        <Eyebrow>{DAHLIAS_HERO.eyebrow}</Eyebrow>
        <h1 id="dahlias-title" data-route-title className="c-title">
          {DAHLIAS_HERO.heading}
        </h1>
        <p className="c-lede">{DAHLIAS_HERO.lede}</p>
      </section>

      <figure className="c-plate hues-packet-card">
        <Image
          src={DAHLIAS_HERO.artKey}
          alt={DAHLIAS_HERO.artAlt}
          slot="hero"
          ratio="21/9"
          priority
        />
      </figure>

      <dl className="dahlias-stats">
        {DAHLIAS_HERO.stats.map((stat) => (
          <div key={stat.small} className="dahlias-stats__stat hues-packet-card">
            <dd className="dahlias-stats__big">{stat.big}</dd>
            <dt className="dahlias-stats__small">{stat.small}</dt>
          </div>
        ))}
      </dl>
      <p className="c-lede c-lede--left">{DAHLIAS_HERO.intro}</p>

      <section className="c-section" aria-labelledby="collection">
        <div className="c-head">
          <Eyebrow>The collection</Eyebrow>
          <h2 id="collection" className="c-section__title">
            The collection, A–Z
          </h2>
          <p className="c-lede c-lede--left">
            All {DAHLIAS.length} varieties in the beds — {photoCount} photographed at
            the park so far, the rest still waiting for their close-up.
          </p>
        </div>

        <div className="dahlias-browse">
          <form
            className="dahlias-filters hues-packet-card"
            role="search"
            aria-label="Filter the collection"
            onSubmit={(event) => event.preventDefault()}
          >
            <TextField
              label={DAHLIAS_FILTER.searchLabel}
              type="search"
              placeholder={DAHLIAS_FILTER.searchPlaceholder}
              value={query.q}
              onChange={(event) =>
                applyQuery({ ...query, q: event.target.value.slice(0, 80) }, false)
              }
            />
            <SegmentedControl
              label={DAHLIAS_FILTER.photoLabel}
              segments={DAHLIAS_FILTER.photoOptions}
              value={query.photo}
              onChange={(value) =>
                applyQuery({ ...query, photo: value as DahliaPhotoFilter }, true)
              }
            />
            <p className="dahlias-filters__count" aria-live="off">
              {filtered
                ? `Showing ${visible.length} of ${DAHLIAS.length} varieties`
                : `${DAHLIAS.length} varieties`}
            </p>
            {filtered && (
              <Button variant="quiet" onClick={() => applyQuery(EMPTY_DAHLIAS_QUERY, true)}>
                Clear filters
              </Button>
            )}
          </form>

          <div className="dahlias-results">
            {groups.length > 0 && (
              <nav aria-label="Jump to a letter" className="dahlias-letters">
                {groups.map((group) => (
                  <a key={group.letter} href={`#letter-${group.letter}`} className="dahlias-letters__chip">
                    {group.letter}
                  </a>
                ))}
              </nav>
            )}

            {groups.length === 0 ? (
              <EmptyState
                variant="no-results"
                title="No dahlias match those filters"
                body="Try a shorter search, or clear the filters to browse the whole collection again."
                action={
                  <Button variant="secondary" onClick={() => applyQuery(EMPTY_DAHLIAS_QUERY, true)}>
                    Clear filters
                  </Button>
                }
              />
            ) : (
              groups.map((group) => (
                <div key={group.letter} className="dahlias-letter">
                  <h3 id={`letter-${group.letter}`} className="dahlias-letter__heading">
                    <span className="dahlias-letter__glyph">{group.letter}</span>
                    <span aria-hidden="true" className="dahlias-letter__rule" />
                  </h3>
                  <ul role="list" className="dahlias-grid">
                    {group.cultivars.map((cultivar) => (
                      <CultivarCard key={cultivar.name} cultivar={cultivar} />
                    ))}
                  </ul>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="c-section" aria-labelledby="dahlias-game">
        <div className="dahlias-game">
          <Eyebrow>{DAHLIAS_GAME_CARD.eyebrow}</Eyebrow>
          <h2 id="dahlias-game" className="c-section__title">
            {DAHLIAS_GAME_CARD.title}
          </h2>
          <p className="c-lede c-lede--left">{DAHLIAS_GAME_CARD.text}</p>
          <Link
            href={DAHLIAS_GAME_CARD.href}
            context="nav"
            className="hues-button hues-button--primary"
          >
            {DAHLIAS_GAME_CARD.cta}
          </Link>
        </div>
        <p className="dahlias-signoff">{PARK_SIGNOFF}</p>
      </section>
    </div>
  )
}
