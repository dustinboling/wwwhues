// Account surface copy, ported from src/app/account/page.tsx and
// src/components/AccountPanel.tsx (single source; the Next.js originals
// stay until the day-28 sign-off). The "where your account works" list
// carries the N2 canonical (/arcade, never /play) and the unified
// routes (no /m links — the UA split is gone).

export const ACCOUNT_TITLE = 'My Hues Account'

export const ACCOUNT_DESCRIPTION =
  'Your Hues account — one simple sign-in for the games, This or That, and volunteering at Hues Floral Park in Junction City, Oregon. Just your name, email, and mobile number — no password.'

export const ACCOUNT_EYEBROW = 'One sign-in for everything'

export const ACCOUNT_HEADING = 'My Hues Account'

export const ACCOUNT_INTRO =
  'The games, your picks, volunteering — all under one name: yours. No password to remember, ever.'

export const ACCOUNT_OG_IMAGE_KEY = 'hues/og/home.webp'

export const ACCOUNT_OG_IMAGE_ALT = 'Hues Floral Park, a little world apart'

export const ACCOUNT_TWITTER_TITLE = 'My Hues Account — Hues Floral Park'

export const ACCOUNT_CREATE_BLURB =
  'One account for everything at Hues — the games, your picks, volunteering. No password: your email and mobile number are your sign-in.'

export const ACCOUNT_SIGNIN_BLURB =
  'Welcome back. Enter the email and mobile number you signed up with.'

export const ACCOUNT_PRIVACY_NOTE =
  'We keep only your name, email, and mobile number — never a password — and we don’t sell your details.'

export const ACCOUNT_SIGNED_IN_NOTE =
  'You’re signed in on this device. Your games, picks, and sign-ups all know you by these details:'

export const ACCOUNT_EDIT_NOTE =
  'Your email and mobile number are your sign-in — changing them changes how you sign in everywhere.'

export const ACCOUNT_WHERE_HEADING = 'Where your account works'

export interface AccountWhereRow {
  label: string
  href: string
  note: string
}

export const ACCOUNT_WHERE: AccountWhereRow[] = [
  { label: 'The Arcade', href: '/arcade', note: 'Games to play' },
  { label: 'This or That?', href: 'https://thisorthat.hues.flowers', note: 'Pick your favorite dahlias' },
  { label: 'Volunteer', href: '/volunteer', note: 'Lend a hand' },
  { label: 'Gather', href: '/gather', note: 'Project days and RSVPs' },
  { label: 'Sponsor', href: '/sponsor', note: 'Help the park grow' },
]

export const ACCOUNT_LOADING = 'One moment…'

export const ACCOUNT_EXPIRED =
  'Welcome back — please sign in again to pick up where you left off.'
