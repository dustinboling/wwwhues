// Arcade admin surface: copy ported from src/app/play/admin/page.tsx
// (the Next.js original stays until the day-28 sign-off) and admin
// state shapes from src/lib/play.ts. N2: the page route moved
// /play/admin → /arcade/admin, but the API paths do NOT rename —
// this surface posts to /api/play/admin (§2.1).

import type { PaverSize, PlayEvent, PlayItem } from './play'

export const ARCADE_ADMIN_TITLE = 'Hues Arcade Admin'

export const ARCADE_ADMIN_DESCRIPTION =
  'Events and RSVPs, sponsorships and plaques, pavers and their making. Changes show in the app right away.'

export const ARCADE_ADMIN_EYEBROW = 'Hues Arcade'

export const ARCADE_ADMIN_HEADING = 'App Admin'

export const ARCADE_ADMIN_INTRO =
  'Events and RSVPs, sponsorships and plaques, pavers and their making. Changes show in the app right away.'

export const ARCADE_ADMIN_BACK = 'Back to Hues Arcade'

export interface PlayRsvp {
  id: string
  eventId: string
  name: string
  email: string
  phone: string
  spots: number
  confirmed: boolean
  attended: boolean
  createdAt: string
}

export interface SponsorOrder {
  id: string
  itemId: string
  plaqueType: string
  plaqueText: string
  passHolder: string
  email: string
  phone: string
  paid: boolean
  assigned: string
  createdAt: string
}

export interface ItemInterest {
  id: string
  itemId: string
  name: string
  email: string
  createdAt: string
}

export interface PaverOrder {
  id: string
  sizeId: string
  choice: string
  printName: string
  printDate: string
  contactName: string
  email: string
  phone: string
  paid: boolean
  productionStatus: string
  location: string
  createdAt: string
}

export interface PaverInterest {
  id: string
  name: string
  email: string
  interest: string
  createdAt: string
}

export interface ArcadeAdminState {
  setupDone: boolean
  authed: boolean
  events?: Array<PlayEvent>
  rsvps?: Array<PlayRsvp>
  items?: Array<PlayItem>
  sponsorOrders?: Array<SponsorOrder>
  itemInterest?: Array<ItemInterest>
  paverSizes?: Array<PaverSize>
  paverOrders?: Array<PaverOrder>
  paverInterest?: Array<PaverInterest>
}

export const PRODUCTION_STAGES = ['ordered', 'print_done', 'cast', 'cured', 'installed'] as const

export const PRODUCTION_LABEL: Record<string, string> = {
  ordered: 'Ordered',
  print_done: 'Print session done',
  cast: 'Cast',
  cured: 'Cured',
  installed: 'Installed',
}

/** cents → "12" / "12.50" for the admin price inputs. */
export function centsToDollars(cents: number | null | undefined): string {
  if (cents === null || cents === undefined) return ''
  return String(cents / 100)
}

/** "12.50" → 1250 (null when blank/invalid). */
export function dollarsToCents(value: string): number | null {
  if (value.trim() === '') return null
  const parsed = Number.parseFloat(value)
  return Number.isNaN(parsed) ? null : Math.round(parsed * 100)
}
