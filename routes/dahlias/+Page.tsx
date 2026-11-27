import { useEffect, useMemo, useRef, useState } from 'react'
import type { JSX } from 'react'
import {
  Button,
  EmptyState,
  Image,
  Link,
  PhoneHero,
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
  type CultivarLetterGroup,
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
          {/* Printed plate name: visible artwork, aria-hidden like
              production — the body name below is the card's single text
              name (P10b). */}
          <span className="dahlias-card__noname" aria-hidden="true">
            {cultivar.name}
          </span>
          <span className="dahlias-card__nophoto">No photo yet</span>
        </span>
      )}
      <span className="dahlias-card__body">
        <span className="dahlias-card__name">{cultivar.name}</span>
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

// Phone tile (P8), as production /m/dahlias renders it: the photo
// fills the tile with the name once beneath it, and cultivars still
// awaiting photography get the compact dashed name plate with the
// pompon — the "See photos" link lives on those plates only.
function PhoneCultivarCard({ cultivar }: { cultivar: DahliaCultivar }): JSX.Element {
  if (cultivar.photoKey === null) {
    return (
      <li className="dahl-m__tile">
        <div className="dahl-m__noplate">
          <div className="dahl-m__nodash">
            <Image
              src={NO_PHOTO_ART_KEY}
              alt=""
              decorative
              slot="card"
              className="dahl-m__pompon"
            />
            <p className="dahl-m__noname">{cultivar.name}</p>
            <p className="dahl-m__nophoto">No photo yet</p>
          </div>
          <a
            href={cultivar.link.href}
            target="_blank"
            rel="noreferrer"
            aria-label={`See photos of ${cultivar.name} on Google (opens in new tab)`}
            className="dahl-m__seelink"
          >
            See photos ↗
          </a>
        </div>
      </li>
    )
  }
  return (
    <li className="dahl-m__tile">
      <div className="dahl-m__photo">
        <Image
          src={cultivar.photoKey}
          alt={`${cultivar.name} dahlia in bloom at Hues Floral Park`}
          slot="card"
          ratio="4/3"
        />
      </div>
      <p className="dahl-m__name">{cultivar.name}</p>
    </li>
  )
}

// The filter surface, shared by both variants (P8 keeps search +
// filters at both widths): same state, same behavior — the TextField
// and SegmentedControl mint their own ids per instance, so the two
// mounted forms never share one.
function CollectionFilters({
  query,
  visibleCount,
  applyQuery,
}: {
  query: DahliasQuery
  visibleCount: number
  applyQuery: (next: DahliasQuery, push: boolean) => void
}): JSX.Element {
  const filtered = query.q !== '' || query.photo !== 'all'
  return (
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
          ? `Showing ${visibleCount} of ${DAHLIAS.length} varieties`
          : `${DAHLIAS.length} varieties`}
      </p>
      {filtered && (
        <Button variant="quiet" onClick={() => applyQuery(EMPTY_DAHLIAS_QUERY, true)}>
          Clear filters
        </Button>
      )}
    </form>
  )
}

function LetterGroups({ groups }: { groups: CultivarLetterGroup[] }): JSX.Element {
  return (
    <>
      {groups.map((group) => (
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
      ))}
    </>
  )
}

function PhoneLetterGroups({ groups }: { groups: CultivarLetterGroup[] }): JSX.Element {
  return (
    <>
      {groups.map((group) => (
        <div key={group.letter} className="dahl-m__letter">
          <h3 id={`m-letter-${group.letter}`} className="dahl-m__letterhead">
            <span className="dahl-m__glyph">{group.letter}</span>
            <span aria-hidden="true" className="dahl-m__rule" />
          </h3>
          <ul role="list" className="dahl-m__grid">
            {group.cultivars.map((cultivar) => (
              <PhoneCultivarCard key={cultivar.name} cultivar={cultivar} />
            ))}
          </ul>
        </div>
      ))}
    </>
  )
}

// Dahlias (/dahlias): per-breakpoint composition (P8 phone, P9b
// desktop heading repair). Phone renders the /m/dahlias order — the
// tall photo hero, stats, the collection with production tiles, letter
// nav, and the arcade game card — keeping the staging search + photo
// filters above the grid. Desktop keeps its Slice B composition with
// its h1 title, as production renders it. The grid's filter state is
// client state mirrored into the URL query (q + photo): the
// prerender carries the full A–Z grid in both variants, typing
// searches in place via replaceState, and the photo facet pushes one
// history entry per deliberate change. The two variants share no
// ids (phone letter anchors take the m-letter- prefix); the inactive
// one is display:none, so the visible outline holds one h1 per
// breakpoint (the home precedent). Cultivar data, the ItemList JSON-LD,
// and the counted 111 (Q2) do not change.
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

  const emptyState =
    groups.length === 0 ? (
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
    ) : null

  return (
    <div className="dahl">
      <div className="dahl-m">
        <PhoneHero
          photo={{ src: DAHLIAS_HERO.artKey, alt: DAHLIAS_HERO.artAlt, priority: true }}
          photoSize="tall"
          eyebrow={DAHLIAS_HERO.eyebrow}
          title={DAHLIAS_HERO.heading}
          intro={DAHLIAS_HERO.lede}
          routeTitle
        />

        <div className="dahl-m__body">
          <dl className="dahl-m__stats">
            {DAHLIAS_HERO.stats.map((stat) => (
              <div key={stat.small} className="dahl-m__stat">
                <dd className="dahl-m__big">{stat.big}</dd>
                <dt className="dahl-m__small">{stat.small}</dt>
              </div>
            ))}
          </dl>
          <p className="dahl-m__intro">{DAHLIAS_HERO.intro}</p>

          <section className="dahl-m__collection" aria-labelledby="m-collection">
            <h2 id="m-collection" className="dahl-m__colltitle">
              The collection, A–Z
            </h2>
            <p className="dahl-m__count">
              All {DAHLIAS.length} varieties in the beds — {photoCount} photographed at
              the park so far, the rest still waiting for their close-up.
            </p>

            <div className="dahl-m__filters">
              <CollectionFilters query={query} visibleCount={visible.length} applyQuery={applyQuery} />
            </div>

            {groups.length > 0 && (
              <nav aria-label="Jump to a letter" className="dahl-m__letters">
                {groups.map((group) => (
                  <a key={group.letter} href={`#m-letter-${group.letter}`} className="dahl-m__chip">
                    {group.letter}
                  </a>
                ))}
              </nav>
            )}

            {emptyState ?? <PhoneLetterGroups groups={groups} />}
          </section>

          <section className="dahl-m__gamewrap" aria-labelledby="m-dahlias-game">
            <div className="dahl-m__game">
              <p className="dahl-m__gameeyebrow">{DAHLIAS_GAME_CARD.eyebrow}</p>
              <h2 id="m-dahlias-game" className="dahl-m__gametitle">
                {DAHLIAS_GAME_CARD.title}
              </h2>
              <p className="dahl-m__gametext">{DAHLIAS_GAME_CARD.text}</p>
              <Link
                href={DAHLIAS_GAME_CARD.href}
                context="nav"
                className="hues-button hues-button--primary"
              >
                {DAHLIAS_GAME_CARD.cta}
              </Link>
            </div>
            <p className="dahl-m__signoff">{PARK_SIGNOFF}</p>
          </section>
        </div>
      </div>

      <div className="dahl-d c-page">
        <section className="c-head" aria-labelledby="dahlias-title">
          <Eyebrow>{DAHLIAS_HERO.eyebrow}</Eyebrow>
          {/* h1, as production renders it (P9b): the phone hero carries
              the page h1 at its breakpoint and this title carries it at
              desktop — the inactive variant is display:none, so the
              visible outline holds one h1 either way. */}
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
            <CollectionFilters query={query} visibleCount={visible.length} applyQuery={applyQuery} />

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

              {emptyState ?? <LetterGroups groups={groups} />}
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
    </div>
  )
}
