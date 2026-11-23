import { getCloudflareContext } from '@opennextjs/cloudflare'

/*
  Hues Play client for the hues-play-api worker. All data + admin
  auth live in that worker's Durable Object (SQLite), which
  serializes writes — event caps and sponsor counts are exact.
  This module only formats and forwards, server-side.
*/

export interface PlayEvent {
  id: string
  title: string
  date: string
  startTime: string
  endTime: string
  project: string
  cap: number
  priceCents: number
  bring: string
  confirmText: string
  spotsPer: number
  spotsLeft: number
  status?: string
  createdAt?: string
}

export interface PlayItem {
  id: string
  name: string
  description: string
  priceCents: number | null
  cap: number | null
  includesPass: boolean
  status: 'active' | 'coming_soon' | 'hidden'
  sort: number
  createdAt?: string
  taken?: number
  spotsLeft?: number | null
}

export interface PaverSize {
  id: string
  name: string
  dimensions: string
  priceCents: number
  fits: string
  sort: number
}

export interface PublicState {
  events: Array<PlayEvent>
  items: Array<PlayItem>
  paverSizes: Array<PaverSize>
}

export interface Rsvp {
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

export interface AdminState {
  setupDone: boolean
  authed: boolean
  events?: Array<PlayEvent>
  rsvps?: Array<Rsvp>
  items?: Array<PlayItem>
  sponsorOrders?: Array<SponsorOrder>
  itemInterest?: Array<ItemInterest>
  paverSizes?: Array<PaverSize>
  paverOrders?: Array<PaverOrder>
  paverInterest?: Array<PaverInterest>
}

async function apiBase(): Promise<string> {
  const { env } = await getCloudflareContext({ async: true })
  const fromEnv = (env as unknown as { PLAY_API_URL?: string }).PLAY_API_URL
  return (
    fromEnv ??
    process.env.PLAY_API_URL ??
    'https://hues-play-api.dustin-boling.workers.dev'
  )
}

export async function apiGet<T>(path: string, session?: string): Promise<T> {
  const base = await apiBase()
  const res = await fetch(`${base}${path}`, {
    headers: session ? { 'X-Session': session } : {},
    cache: 'no-store',
  })
  return (await res.json()) as T
}

export async function apiPost(
  path: string,
  body: Record<string, unknown>,
  session?: string,
): Promise<{ status: number; data: Record<string, unknown> }> {
  const base = await apiBase()
  const res = await fetch(`${base}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(session ? { 'X-Session': session } : {}),
    },
    body: JSON.stringify(body),
    cache: 'no-store',
  })
  let data: Record<string, unknown> = {}
  try {
    data = (await res.json()) as Record<string, unknown>
  } catch {
    data = {}
  }
  return { status: res.status, data }
}

export async function apiGetText(
  path: string,
  session?: string,
): Promise<{ status: number; text: string; contentType: string }> {
  const base = await apiBase()
  const res = await fetch(`${base}${path}`, {
    headers: session ? { 'X-Session': session } : {},
    cache: 'no-store',
  })
  return {
    status: res.status,
    text: await res.text(),
    contentType: res.headers.get('Content-Type') ?? 'text/plain',
  }
}

/* ---------- display formatting ---------- */

export function formatEventDate(date: string): string {
  const d = new Date(`${date}T12:00:00`)
  if (Number.isNaN(d.getTime())) return date
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Los_Angeles',
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(d)
}

export function formatPrice(cents: number | null): string {
  if (cents === null || cents === undefined) return ''
  if (cents === 0) return 'Free'
  return `$${(cents / 100).toFixed(cents % 100 === 0 ? 0 : 2)}`
}
