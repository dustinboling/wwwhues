import { useEffect, useRef, useState } from 'react'
import type { JSX, ReactNode } from 'react'
import {
  AppShell,
  FooterLink,
  HUES_TABS,
  Icon,
  Link,
  MiniPlayer,
  Sheet,
  SheetRow,
  SiteFooter,
  SiteHeader,
  TabBar,
  TopBar,
  focusRouteTarget,
  setMediaBaseUrl,
  transformUrl,
  useAnnouncer,
} from '@hues/ui'
import type { TabDefinition } from '@hues/ui'
import { usePageContext } from 'vike-react/usePageContext'
import {
  CONTACT_PHONE_DISPLAY,
  CONTACT_PHONE_HREF,
  FOOTER_SITEMAP,
  FOOTER_SOCIALS,
  HEADER_NAV,
  MORE_SHEET_ROWS,
  SHELL_ART,
} from '../content/site'
import {
  currentTrack,
  nextTrack,
  restorePlayback,
  stopPlayer,
  togglePlay,
  usePlayerState,
} from './player'

// Media layer bootstrap (plan §1d): every image in the app resolves
// against the media domain. Idempotent; runs once per environment.
setMediaBaseUrl('https://media.hues.flowers')

function Wordmark(): JSX.Element {
  return <span className="hues-wordmark">Hues Floral Park</span>
}

// The account round is a real link to /account (never a click-handler
// button): session-aware behavior lands with the account slice.
function AccountLink(): JSX.Element {
  return (
    <Link href="/account" context="nav" aria-label="Account" className="hues-account-button">
      <Icon name="person" size={20} />
    </Link>
  )
}

// A11y #1/#2: on every client-side route change, move focus to the
// route's h1 (fallback: main) and announce the new page. Rendered inside
// AppShell so the announcer context is available. Pathname-guarded so
// StrictMode's double effect never announces the initial load.
function RouteAnnouncer(): null {
  const { urlPathname } = usePageContext()
  const announce = useAnnouncer()
  const previous = useRef(urlPathname)
  useEffect(() => {
    if (previous.current === urlPathname) return
    previous.current = urlPathname
    focusRouteTarget()
    announce(`${document.title} page`)
  }, [urlPathname, announce])
  return null
}

function tabArt(): { tabs: TabDefinition[]; discArt: string; plateArt: string } {
  return {
    tabs: HUES_TABS.map((tab) => ({
      ...tab,
      medallion: transformUrl({
        key: tab.id === 'seasons' ? SHELL_ART.seasonsDisc : (SHELL_ART.tabs[tab.id] ?? SHELL_ART.tabPlate),
        width: 320,
      }),
    })),
    discArt: transformUrl({ key: SHELL_ART.seasonsDisc, width: 320 }),
    plateArt: transformUrl({ key: SHELL_ART.tabPlate, width: 768 }),
  }
}

export function SiteShell({ children }: { children: ReactNode }): JSX.Element {
  const { urlPathname } = usePageContext()
  const [moreOpen, setMoreOpen] = useState(false)
  const art = tabArt()
  // The shell player engine (Nadia §4.4): one audio element living in
  // the shell, so playback survives client-side navigation. /music is
  // the player's full view, so the bar stays away there.
  const player = usePlayerState()
  const song = currentTrack(player)
  const miniTrack =
    song === null || urlPathname === '/music'
      ? null
      : {
          title: song.title,
          setLabel: `${player.groupLabel ?? 'The Sound of Hues'} · The Sound of Hues`,
          href: '/music',
        }

  // An interrupted session restores paused at its song, once, on mount
  // (client-only — the prerender is always idle).
  useEffect(() => {
    restorePlayback()
  }, [])

  // Route changes close the More sheet (the overlay-history hook drops
  // the pushed entry silently on this path).
  useEffect(() => {
    setMoreOpen(false)
  }, [urlPathname])

  return (
    <AppShell
      theme="park"
      header={
        <>
          <TopBar logo={<Wordmark />} account={<AccountLink />} />
          <SiteHeader
            logo={<Wordmark />}
            items={HEADER_NAV}
            currentHref={urlPathname}
            account={<AccountLink />}
          />
        </>
      }
      navigation={
        <TabBar
          tabs={art.tabs}
          currentPath={urlPathname}
          discArt={art.discArt}
          plateArt={art.plateArt}
          musicPlaying={player.playing}
          onMoreTab={() => setMoreOpen(true)}
          moreOpen={moreOpen}
        />
      }
      footer={
        <SiteFooter
          sitemap={
            <ul>
              {FOOTER_SITEMAP.map((item) => (
                <li key={item.href}>
                  <FooterLink href={item.href} current={item.href === urlPathname}>
                    {item.label}
                  </FooterLink>
                </li>
              ))}
            </ul>
          }
          accountLink={
            <Link href={CONTACT_PHONE_HREF} context="nav">
              {CONTACT_PHONE_DISPLAY}
            </Link>
          }
          socials={
            <ul>
              {FOOTER_SOCIALS.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} context="nav">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          }
        />
      }
      player={
        <MiniPlayer
          track={miniTrack}
          playing={player.playing}
          onPlayPause={togglePlay}
          onStop={stopPlayer}
          onNext={nextTrack}
        />
      }
      notices={
        <Sheet open={moreOpen} onClose={() => setMoreOpen(false)} title="More">
          <nav aria-label="More">
            <ul>
              {MORE_SHEET_ROWS.map((item) => (
                <li key={item.href}>
                  <SheetRow href={item.href} current={item.href === urlPathname}>
                    {item.label}
                  </SheetRow>
                </li>
              ))}
            </ul>
          </nav>
        </Sheet>
      }
    >
      <RouteAnnouncer />
      {children}
    </AppShell>
  )
}
