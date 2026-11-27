import { useEffect, useRef, useState } from 'react'
import type { JSX, ReactNode } from 'react'
import {
  AppShell,
  HUES_TABS,
  Icon,
  Image,
  Link,
  MiniPlayer,
  OfflineBanner,
  Sheet,
  SheetRow,
  SiteFooter,
  SiteHeader,
  TabBar,
  TopBar,
  UpdateNotice,
  deregisterLegacyWorkers,
  focusRouteTarget,
  setMediaBaseUrl,
  transformUrl,
  useAnnouncer,
} from '@hues/ui'
import type { TabDefinition } from '@hues/ui'
import { QueryClientProvider } from '@tanstack/react-query'
import { usePageContext } from 'vike-react/usePageContext'
import { AccountProvider, useAccount } from './account'
import { HuesScriptLogo } from './logo'
import { huesQueryClient, useHourBoundarySync } from './queries'
import { InstagramIcon, MailIcon, TikTokIcon } from './social-icons'
import {
  CONTACT_PHONE_HREF,
  FOOTER_BUSINESS_NAME,
  FOOTER_CITY,
  FOOTER_ENTRANCE,
  FOOTER_PHONE_COLOPHON,
  FOOTER_PHONE_CONTACT,
  FOOTER_PHONE_DISPLAY,
  FOOTER_PHONE_FULL_SITE,
  FOOTER_PHONE_LEAD,
  FOOTER_PHONE_LINKS,
  FOOTER_PHONE_SIGNOFF,
  FOOTER_SITEMAP,
  FOOTER_SOCIAL_CHIPS,
  FOOTER_SOCIALS_LABEL,
  FOOTER_STREET,
  HEADER_NAV,
  MORE_SHEET_ROWS,
  PARK_SIGNOFF,
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

const SOCIAL_ICONS = {
  instagram: InstagramIcon,
  tiktok: TikTokIcon,
  mail: MailIcon,
} as const

// The account round is a real link to /account (never a click-handler
// button — Bea §1.5(3)): the person glyph signed out, the account
// initial signed in, updating shell-wide the moment identity changes.
function AccountLink(): JSX.Element {
  const { state } = useAccount()
  if (state.status === 'in') {
    const initial = state.visitor.name.trim().charAt(0).toUpperCase() || '•'
    return (
      <Link
        href="/account"
        context="nav"
        aria-label={`Account, signed in as ${state.visitor.name}`}
        className="hues-account-button"
      >
        <span aria-hidden="true" className="hues-account-button__initial">
          {initial}
        </span>
      </Link>
    )
  }
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

// Route chrome modes (P10c, P10d): most routes wear the unified shell
// — TopBar + phone footer below 768px, SiteHeader + desktop footer
// above. Four routes match production's own chrome instead: /nursery
// has no /m page, so phones get production's desktop header and
// footer; /about's phone telling carries the story's own tagline
// footer, so the shell's phone footer stays away. The admin pages
// likewise have no /m edition and production shows no phone tab bar
// on them: /volunteer/admin wears the desktop header + footer without
// the tab bar (chrome-desktop plus the admin hides), while /play/admin
// is a bare shell in production (Layout isBareShell), so /arcade/admin
// hides the whole shell frame below 768px. Prerender-safe:
// urlPathname is known at build time.
function chromeClassFor(pathname: string): string | undefined {
  if (pathname === '/nursery') return 'hues-shell--chrome-desktop'
  if (pathname === '/about') return 'hues-shell--chrome-story'
  if (pathname === '/volunteer/admin') return 'hues-shell--chrome-desktop hues-shell--chrome-admin'
  if (pathname === '/arcade/admin') return 'hues-shell--chrome-bare'
  return undefined
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
  return (
    <QueryClientProvider client={huesQueryClient()}>
      <AccountProvider>
        <ShellInner>{children}</ShellInner>
      </AccountProvider>
    </QueryClientProvider>
  )
}

function ShellInner({ children }: { children: ReactNode }): JSX.Element {
  const { urlPathname } = usePageContext()
  const [moreOpen, setMoreOpen] = useState(false)
  const [swApply, setSwApply] = useState<(() => void) | null>(null)
  const [offlineSince, setOfflineSince] = useState<number | null>(null)
  const art = tabArt()
  // Hour-boundary sync for the live-data regions (Nadia §5 table):
  // mount + visibility return come from the query defaults.
  useHourBoundarySync()
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

  // Legacy cutover sweep (Perf #6): installed Print Edition (/m) workers
  // strand after the /m URLs become 301s. The served sw-m.js kill-switch
  // is the primary path; this client sweep removes stragglers. Once.
  useEffect(() => {
    void deregisterLegacyWorkers(['/m']).catch(() => undefined)
  }, [])

  // Offline strip state: present only while offline, labelled with when
  // the connection dropped (saved data, never posed as live).
  useEffect(() => {
    function mark(): void {
      setOfflineSince(navigator.onLine ? null : Date.now())
    }
    mark()
    window.addEventListener('online', mark)
    window.addEventListener('offline', mark)
    return () => {
      window.removeEventListener('online', mark)
      window.removeEventListener('offline', mark)
    }
  }, [])

  const offlineLabel =
    offlineSince === null
      ? null
      : `from ${new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' }).format(new Date(offlineSince))}`

  return (
    <AppShell
      theme="park"
      className={chromeClassFor(urlPathname)}
      // A waiting worker surfaces as the quiet UpdateNotice pill — Apply
      // at route boundaries, never forced, never mid-form (Mina §2.7).
      // The player wins: the notice waits while audio plays.
      onServiceWorkerUpdate={(apply) => setSwApply(() => apply)}
      offline={offlineLabel !== null}
      header={
        <>
          <TopBar logo={<HuesScriptLogo />} account={<AccountLink />} />
          <SiteHeader
            logo={<HuesScriptLogo />}
            lockup={
              <>
                <span className="hues-site-header__lockup-overline">Floral Park</span>{' '}
                <span className="hues-site-header__lockup-tagline">a little world apart</span>
              </>
            }
            items={HEADER_NAV}
            currentHref={urlPathname}
            account={<AccountLink />}
          />
        </>
      }
      // The tab bar lives after the footers in DOM order (P10a): the
      // Print Edition shell (src/app/m/Shell2.tsx) renders <TabBar />
      // after <main>, so production's extracted phone text ends with the
      // tab labels. The bar is position:fixed, so the DOM move changes
      // no pixel; on desktop it is display:none either way.
      footer={
        <>
          <SiteFooter
            variant="phone"
            art={
              <Image
                src={SHELL_ART.procession}
                alt="The animal procession from the Hues watercolor"
                slot="card"
              />
            }
            logo={<HuesScriptLogo />}
            signoff={FOOTER_PHONE_SIGNOFF}
            address={FOOTER_PHONE_CONTACT}
            sitemap={
              <ul>
                {FOOTER_PHONE_LINKS.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} context="nav">
                      {item.label}
                    </Link>
                  </li>
                ))}
                <li className="hues-site-footer__full-site">
                  <Link href={FOOTER_PHONE_FULL_SITE.href} context="nav">
                    {FOOTER_PHONE_FULL_SITE.label}
                  </Link>
                </li>
              </ul>
            }
            closing={<p className="hues-visually-hidden">{FOOTER_PHONE_COLOPHON}</p>}
          />
          <SiteFooter
            variant="desktop"
            logo={<HuesScriptLogo />}
            overline="Floral Park"
            signoff={PARK_SIGNOFF}
            socialsLabel={FOOTER_SOCIALS_LABEL}
            socials={FOOTER_SOCIAL_CHIPS.map((chip) => {
              const ChipIcon = SOCIAL_ICONS[chip.icon]
              return (
                <Link
                  key={chip.href}
                  href={chip.href}
                  context="nav"
                  {...(chip.external === true ? { target: '_blank', rel: 'noreferrer' } : {})}
                >
                  <ChipIcon />
                  {chip.label}
                  {chip.external === true && (
                    <span className="hues-visually-hidden">(opens in new tab)</span>
                  )}
                </Link>
              )
            })}
            sitemap={
              <ul>
                {FOOTER_SITEMAP.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} context="nav">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            }
            address={
              <>
                {FOOTER_BUSINESS_NAME}
                <br />
                {FOOTER_STREET}
                <br />
                {FOOTER_CITY}
                <br />
                {FOOTER_ENTRANCE}
                <br />
                {FOOTER_PHONE_LEAD}
                <Link href={CONTACT_PHONE_HREF} context="nav">
                  {FOOTER_PHONE_DISPLAY}
                </Link>
              </>
            }
            copyright={
              <>
                © {new Date().getFullYear()} {FOOTER_BUSINESS_NAME}. All rights reserved.
              </>
            }
          />
          <TabBar
            tabs={art.tabs}
            currentPath={urlPathname}
            discArt={art.discArt}
            plateArt={art.plateArt}
            musicPlaying={player.playing}
            onMoreTab={() => setMoreOpen(true)}
            moreOpen={moreOpen}
          />
        </>
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
        <>
          {offlineLabel !== null && <OfflineBanner ageLabel={offlineLabel} />}
          {swApply !== null && miniTrack === null && (
            <UpdateNotice
              onApply={() => {
                swApply()
                setSwApply(null)
              }}
              onDismiss={() => setSwApply(null)}
            />
          )}
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
        </>
      }
    >
      <RouteAnnouncer />
      {children}
    </AppShell>
  )
}
