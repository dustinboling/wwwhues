'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useRef, useState, type RefObject } from 'react'

import { ShareButton } from './ShareButton'
import { ButterflyLayer } from './Butterflies'
import MenuBadge, { type MenuBadgeKind } from '@/components/MenuBadge'
import { fetchAccountVisitor } from '@/lib/use-account'
import {
  FacebookIcon,
  InstagramIcon,
  MailIcon,
  TikTokIcon,
} from '@/components/SocialIcons'

/**
 * The Print Edition tab bar — Dusty's approved v17b seven-tab design,
 * built for production 2026-11-01 (site assets v18). The artwork is
 * NOT redrawn in CSS: it is sliced from the approved v17b render
 * pipeline (tab-bar-v2-work/build-v17b.py + export-v18-production.py)
 * into layered WebP assets under /m-art/tabbar/ —
 *   plate:  plush cream panel + padded cowl + tuck gap + deep-green
 *           piping + French double-stitching + the six flank
 *           medallions' seat beds and tuck rings (no icons, no labels)
 *   disc:   the C2 cloisonné center disc (the Seasons tab; the
 *           artwork carries no label — a visible "Seasons" label
 *           is set in code under the disc, on the flank baseline;
 *           Dusty directed the word "Four" be removed, 2026-11-01)
 *   med-*:  the six cloisonné flank medallions. Home ships in two
 *           variants: lit window (Home active) and unlit window
 *           (everywhere else), exactly as the mock's active treatment.
 * Seven tabs: Home · Visit · Help · Seasons · Arcade · Music · More.
 * Help links the Help hub (/m/help), which directs to the Sponsor
 * and Volunteer pages. More is a button that opens a sheet with
 * Dahlias, Gather, Our Story, Sponsor and Volunteer.
 * Geometry (CSS pt, plate box 390×112): panel top line at y=47,
 * disc 74pt centred at (195, 47), flank medallions 32pt with centres
 * at y=71, labels on the mock's baseline. The tap targets stay in
 * the seven equal columns (55.714pt each), but since 2026-11-09
 * (Dustin: "bring smaller buttons closer together, giving the large
 * center button more space around it") the flank medallions and
 * their labels ride at compressed positions — pitch 52.1pt within
 * each trio, trios pushed toward the edges — so the disc's air
 * grows from ~2.7pt to ~9.9pt a side. The v19 plate
 * (tabbar-v19-plate.webp, export-v19-production.py) paints the
 * seat beds at those same compressed centres; medallion `shift`
 * values below place each medallion on its painted seat. On screens wider than 390pt the plate stays
 * centred and a plain cream panel continues the bar's lower half
 * full-width.
 */

const ART = '/m-art/tabbar'

type FlankTab = {
  href: string
  label: string
  medallion: string
  medallionInactive?: string
  /** Extra path prefixes that also light this tab (Help stays lit
      on the pages its hub directs to). */
  activeAlso?: string[]
  /** Horizontal offset (pt) of the medallion + label from the
      column centre, matching the v19 plate's compressed seats. */
  shift?: number
}

const LEFT_TABS: FlankTab[] = [
  {
    href: '/m',
    label: 'Home',
    medallion: `${ART}/tabbar-v18-med-home.webp`,
    medallionInactive: `${ART}/tabbar-v18-med-home-unlit.webp`,
  },
  { href: '/m/visit', label: 'Visit', medallion: `${ART}/tabbar-v18-med-visit.webp`, shift: -3.5 },
  {
    href: '/m/help',
    label: 'Help',
    medallion: `${ART}/tabbar-v18-med-grow.webp`,
    shift: -7.1,
    /* Help is the hub for both kinds of support (Dustin,
       2026-11-15): the tab stays lit on the Sponsor and Volunteer
       pages it directs to. */
    activeAlso: ['/m/sponsor', '/m/volunteer'],
  },
]

const RIGHT_TABS: FlankTab[] = [
  { href: '/m/arcade', label: 'Arcade', medallion: `${ART}/tabbar-v18-med-arcade.webp`, shift: 7.1 },
  { href: '/m/music', label: 'Music', medallion: `${ART}/tabbar-v18-med-music.webp`, shift: 3.6 },
]

const SEASON_HREF = '/m/season'
const MORE_MEDALLION = `${ART}/tabbar-v18-med-more.webp`

/** Destinations in the More sheet — all stay within the Print Edition. */
const MORE_LINKS: {
  href: string
  label: string
  note?: string
  badge: MenuBadgeKind
}[] = [
  /* The account row's note is dynamic (see MoreSheet): "Signed in
     as …" when there's a session, nothing otherwise — a static
     "one sign-in for everything" caption was silly (Dustin,
     2026-11-12). The other rows keep their notes. */
  { href: '/m/account', label: 'My Hues Account', badge: 'account' },
  { href: '/m/dahlias', label: 'Dahlias', note: 'The collection, A to Z', badge: 'dahlias' },
  { href: '/m/gather', label: 'Gather', note: 'Project days and RSVPs', badge: 'gather' },
  { href: '/m/story', label: 'Our Story', note: 'How the park came to be', badge: 'story' },
  /* Sponsor and Volunteer sit together at the foot of the sheet —
     the two ways to support Hues, financially and physically
     (Dustin, 2026-11-15). */
  { href: '/m/sponsor', label: 'Sponsor', note: 'A bed, a tree, a bench — your name in the park', badge: 'give' },
  { href: '/m/volunteer', label: 'Volunteer', note: 'Lend a hand in the beds', badge: 'volunteer' },
]

/** Round icon links at the foot of the More sheet — share first,
 *  then the socials (Dustin, 2026-11-12; share moved out of the
 *  app header to here). */
const SHEET_SOCIALS: {
  href: string
  label: string
  Icon: (props: React.ComponentPropsWithoutRef<'svg'>) => React.JSX.Element
}[] = [
  { href: 'https://instagram.com/huesflowers', label: 'Hues on Instagram', Icon: InstagramIcon },
  { href: 'https://www.facebook.com/HuesFlowerFarm', label: 'Hues on Facebook', Icon: FacebookIcon },
  { href: 'https://www.tiktok.com/@www.hues.flowers', label: 'Hues on TikTok', Icon: TikTokIcon },
  { href: 'mailto:hello@hues.flowers', label: 'Email Hues', Icon: MailIcon },
]

const SHEET_ROUND_LINK =
  'flex h-11 w-11 items-center justify-center rounded-full bg-[#fffdf4] text-[#23362b] shadow-sm ring-1 ring-[#b08d37]/70 transition active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#927128]'

function useActive(href: string, activeAlso?: string[]): boolean {
  const pathname = usePathname()
  if (href === '/m') return pathname === '/m'
  if (pathname?.startsWith(href)) return true
  return activeAlso?.some((p) => pathname?.startsWith(p)) ?? false
}

function useMoreActive(): boolean {
  const pathname = usePathname()
  return MORE_LINKS.some(
    (link) => pathname === link.href || (pathname?.startsWith(`${link.href}/`) ?? false),
  )
}

const LINK_CLASS =
  'p-tab relative block h-full rounded-[26px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#927128] focus-visible:ring-inset'

const LABEL_CLASS = (active: boolean) =>
  `absolute inset-x-0 top-[92px] text-center text-[10.5px] leading-[14px] tracking-[0.03em] ${
    active ? 'font-semibold text-[#23362b]' : 'font-medium text-[#4e5d47]'
  }`

function FlankLink({ tab }: { tab: FlankTab }) {
  const active = useActive(tab.href, tab.activeAlso)
  const src = active ? tab.medallion : (tab.medallionInactive ?? tab.medallion)
  return (
    <Link
      href={tab.href}
      aria-current={active ? 'page' : undefined}
      className={LINK_CLASS}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        aria-hidden="true"
        width={96}
        height={96}
        draggable={false}
        style={
          tab.shift ? { left: `calc(50% + ${tab.shift}px)` } : undefined
        }
        className="absolute top-[55px] left-1/2 h-[32px] w-[32px] -translate-x-1/2 select-none"
      />
      <span
        className={LABEL_CLASS(active)}
        style={
          tab.shift ? { transform: `translateX(${tab.shift}px)` } : undefined
        }
      >
        {tab.label}
      </span>
    </Link>
  )
}

function SeasonLink({ onPress }: { onPress: () => void }) {
  const active = useActive(SEASON_HREF)
  const discRef = useRef<HTMLImageElement | null>(null)

  // A press spins the cloisonné disc one full turn (with a little
  // swell) and releases the butterflies (Dustin, 2026-11-13). The
  // spin animates the standalone `rotate`/`scale` properties —
  // NOT `transform`: the disc's centring lives in Tailwind v4's
  // standalone `translate` property, and an animated transform
  // that also carried translateX(-50%) stacked BOTH shifts, so
  // the disc visibly travelled sideways mid-spin (Dustin: "keep
  // the button spinning in place"). Individual properties
  // compose with the resting translate instead of fighting it.
  const spinAndRelease = useCallback(() => {
    try {
      discRef.current?.animate(
        [
          { rotate: '0deg', scale: '1' },
          { rotate: '180deg', scale: '1.08', offset: 0.55 },
          { rotate: '360deg', scale: '1' },
        ],
        { duration: 780, easing: 'cubic-bezier(0.25, 0.7, 0.3, 1)' },
      )
    } catch {
      // Older engines without individual-transform WAAPI support:
      // no spin, but the butterflies still fly.
    }
    onPress()
  }, [onPress])

  return (
    <Link
      href={SEASON_HREF}
      aria-current={active ? 'page' : undefined}
      className={LINK_CLASS}
      onClick={spinAndRelease}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={discRef}
        src={`${ART}/tabbar-v18-disc.webp`}
        alt=""
        aria-hidden="true"
        width={222}
        height={222}
        draggable={false}
        style={
          active
            ? { filter: 'drop-shadow(0 0 9px rgba(176, 141, 55, 0.65))' }
            : undefined
        }
        className="absolute top-[10px] left-1/2 h-[74px] w-[74px] max-w-none -translate-x-1/2 select-none"
      />
      {/* Visible label under the disc: "Seasons" (Dusty removed the
          word "Four", 2026-11-01), set on the same top-[92px]
          baseline as the flank labels so all seven read as one row.
          The disc ends at y=84, so it clears cleanly. */}
      <span className={LABEL_CLASS(active)}>Seasons</span>
    </Link>
  )
}

function MoreSheet({
  onClose,
  closeRef,
}: {
  onClose: () => void
  closeRef: RefObject<HTMLButtonElement | null>
}) {
  const pathname = usePathname()
  const [accountNote, setAccountNote] = useState<string | null>(null)

  useEffect(() => {
    let live = true
    void (async () => {
      const v = await fetchAccountVisitor()
      if (!live || !v) return
      setAccountNote(`Signed in as ${v.name.split(' ')[0]}`)
    })()
    return () => {
      live = false
    }
  }, [])

  return (
    <div className="fixed inset-0 z-50" role="presentation">
      {/* Backdrop: tapping anywhere outside the sheet closes it. */}
      <button
        type="button"
        aria-label="Close menu"
        onClick={onClose}
        className="absolute inset-0 h-full w-full cursor-default bg-[#23362b]/45"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="p-more-sheet-title"
        className="absolute inset-x-0 bottom-0 mx-auto w-full max-w-[390px] rounded-t-[26px] border-t-2 border-[#b08d37] bg-[#f7f1de] px-5 pt-4 shadow-[0_-12px_40px_rgba(35,54,43,0.35)]"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 20px)' }}
      >
        <div className="mb-3 flex items-start justify-between gap-4">
          <h2
            id="p-more-sheet-title"
            className="p-display text-[22px] leading-[26px] font-semibold text-[#23362b]"
          >
            More at Hues
          </h2>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#b08d37]/70 text-[18px] leading-none text-[#23362b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#927128]"
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>
        <ul className="divide-y divide-[#b08d37]/35 border-y border-[#b08d37]/35">
          {MORE_LINKS.map((link) => {
            const current =
              pathname === link.href ||
              (pathname?.startsWith(`${link.href}/`) ?? false)
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={current ? 'page' : undefined}
                  onClick={onClose}
                  className="flex items-center gap-3.5 py-[11px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#927128]"
                >
                  <MenuBadge kind={link.badge} />
                  <span
                    className={`p-display text-[18px] leading-[22px] ${
                      current
                        ? 'font-semibold text-[#23362b] underline decoration-[#b08d37] decoration-2 underline-offset-4'
                        : 'font-medium text-[#2e4438]'
                    }`}
                  >
                    {link.label}
                  </span>
                  {(() => {
                    const note =
                      link.href === '/m/account' ? accountNote : link.note
                    return note ? (
                      <span className="ml-auto text-right text-[12.5px] leading-[16px] text-[#4e5d47]">
                        {note}
                      </span>
                    ) : null
                  })()}
                </Link>
              </li>
            )
          })}
        </ul>
        <div className="mt-5 flex items-center gap-3">
          <ShareButton />
          {SHEET_SOCIALS.map(({ href, label, Icon }) => (
            <a
              key={href}
              href={href}
              aria-label={label}
              title={label}
              {...(href.startsWith('http')
                ? { target: '_blank', rel: 'noreferrer' }
                : {})}
              className={SHEET_ROUND_LINK}
            >
              <Icon className="h-5 w-5 fill-current" />
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}

function MoreButton({ onOpen }: { onOpen: () => void }) {
  const active = useMoreActive()
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-haspopup="dialog"
      className={`${LINK_CLASS} w-full cursor-pointer`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={MORE_MEDALLION}
        alt=""
        aria-hidden="true"
        width={96}
        height={96}
        draggable={false}
        className="absolute top-[55px] left-1/2 h-[32px] w-[32px] -translate-x-1/2 select-none"
      />
      <span className={LABEL_CLASS(active)}>More</span>
    </button>
  )
}

export function TabBar() {
  const [sheetOpen, setSheetOpen] = useState(false)
  const [burstKey, setBurstKey] = useState(0)
  const releaseButterflies = useCallback(() => setBurstKey((k) => k + 1), [])
  const pathname = usePathname()
  const moreButtonRef = useRef<HTMLDivElement | null>(null)
  const closeRef = useRef<HTMLButtonElement | null>(null)

  const closeSheet = useCallback(() => setSheetOpen(false), [])

  // Soft navigation (e.g. via a link elsewhere on the page) closes
  // the sheet so it can never linger over a page it didn't open on.
  useEffect(() => {
    setSheetOpen(false)
  }, [pathname])

  // While the sheet is open: Escape closes it, focus starts on the
  // sheet's close control, and closing returns focus to the More tab.
  useEffect(() => {
    if (!sheetOpen) return
    closeRef.current?.focus()
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSheetOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      moreButtonRef.current?.querySelector('button')?.focus()
    }
  }, [sheetOpen])

  return (
    <>
      <nav
        aria-label="Hues mobile"
        className="fixed inset-x-0 bottom-0 z-40"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {/* Panel continuation: on screens wider than the 390pt plate,
            the bar's lower half continues full-width in the panel cream
            (and through the safe-area inset below the plate). */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-[47px] bottom-0 border-t border-[#e0d5b8]/60 bg-[#f7f1de]"
        />
        <div className="relative mx-auto h-[112px] w-full max-w-[390px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`${ART}/tabbar-v19-plate.webp`}
            alt=""
            aria-hidden="true"
            width={1170}
            height={336}
            draggable={false}
            className="absolute inset-0 h-full w-full select-none"
          />
          <div className="absolute inset-0 grid grid-cols-7">
            <FlankLink tab={LEFT_TABS[0]} />
            <FlankLink tab={LEFT_TABS[1]} />
            <FlankLink tab={LEFT_TABS[2]} />
            <SeasonLink onPress={releaseButterflies} />
            <FlankLink tab={RIGHT_TABS[0]} />
            <FlankLink tab={RIGHT_TABS[1]} />
            <div ref={moreButtonRef} className="relative h-full">
              <MoreButton onOpen={() => setSheetOpen(true)} />
            </div>
          </div>
        </div>
      </nav>
      {sheetOpen ? <MoreSheet onClose={closeSheet} closeRef={closeRef} /> : null}
      <ButterflyLayer burstKey={burstKey} />
    </>
  )
}
