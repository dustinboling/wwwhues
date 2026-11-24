// Ported from src/lib/play.ts (single source; the Next.js original stays
// until the day-28 sign-off): the public-state shapes and the display
// formatters the Gather/Sponsor pages render. The server fetch (apiGet)
// is NOT ported — build-time state arrives via scripts/fetch-snapshots.mjs
// in this slice, and client revalidation via the /api proxy in Slice D.

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

export interface PlayPublicState {
  events: Array<PlayEvent>
  items: Array<PlayItem>
  paverSizes: Array<PaverSize>
}

export interface PlaySnapshot {
  fetchedAt: string
  data: PlayPublicState
}

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
