/*
  Shared helpers for the volunteer admin dashboard.

  Everything here is presentation logic built on top of the existing
  hues-volunteers-api contract (proxied through /api/volunteer/admin):
    GET  /api/volunteer/admin  -> AdminState
    POST /api/volunteer/admin  -> { action: 'setup' | 'login' |
         'logout' } or an /admin/action body forwarded as-is
         (create_task, update_task, delete_task, create_slot,
          delete_slot, delete_signup).
  No new endpoints, no auth changes.
*/

import type { AdminState, Signup, Slot, Task } from '@/lib/volunteers'

export type { AdminState, Signup, Slot, Task }

export const TZ = 'America/Los_Angeles'

/* ---------------- formatting ---------------- */

export function fmtDay(iso: string): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: TZ,
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(new Date(iso))
}

export function fmtDayShort(iso: string): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: TZ,
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(new Date(iso))
}

export function fmtTime(iso: string): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: TZ,
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(iso))
}

/** "Saturday, November 7 · 9:30 AM" */
export function fmtWhen(iso: string): string {
  return `${fmtDay(iso)} · ${fmtTime(iso)}`
}

/* ---------------- session derivation ---------------- */

export interface SessionView {
  slot: Slot
  task: Task
  signups: Array<Signup>
  taken: number
  spotsLeft: number
  isFull: boolean
  isPast: boolean
  /** Starts within the next 7 days (and hasn't happened yet). */
  isThisWeek: boolean
}

const WEEK_MS = 7 * 24 * 60 * 60 * 1000

export function buildSessions(state: AdminState): Array<SessionView> {
  const tasks = state.tasks ?? []
  const slots = state.slots ?? []
  const signupsBySlot = state.signupsBySlot ?? {}
  const taskById = new Map(tasks.map((t) => [t.id, t]))
  const now = Date.now()
  const sessions: Array<SessionView> = []
  for (const slot of slots) {
    const task = taskById.get(slot.taskId)
    if (!task) continue
    const signups = signupsBySlot[slot.id] ?? []
    const start = new Date(slot.startsAt).getTime()
    sessions.push({
      slot,
      task,
      signups,
      taken: signups.length,
      spotsLeft: Math.max(0, slot.capacity - signups.length),
      isFull: signups.length >= slot.capacity,
      isPast: start < now,
      isThisWeek: start >= now && start - now <= WEEK_MS,
    })
  }
  sessions.sort(
    (a, b) =>
      new Date(a.slot.startsAt).getTime() - new Date(b.slot.startsAt).getTime(),
  )
  return sessions
}

/* ---------------- time input conversion ---------------- */

/*
  A datetime-local value is Oregon wall-clock time. Convert it to a
  true UTC ISO string by measuring the zone's offset at that moment
  (carried over from the original admin client — DST-safe).
*/
export function localToISO(local: string): string {
  const naive = new Date(`${local}:00Z`).getTime()
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date(naive))
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '00'
  const asIfUTC = Date.UTC(
    Number(get('year')),
    Number(get('month')) - 1,
    Number(get('day')),
    Number(get('hour')),
    Number(get('minute')),
    Number(get('second')),
  )
  const offsetMs = asIfUTC - naive
  return new Date(naive - offsetMs).toISOString()
}

/** "2026-11-07" + "09:30" -> ISO instant, as Oregon local time. */
export function dateTimeToISO(date: string, time: string): string {
  return localToISO(`${date}T${time}`)
}

export function isPastDateTime(date: string, time: string): boolean {
  if (!date || !time) return false
  return new Date(dateTimeToISO(date, time)).getTime() < Date.now()
}

/* ---------------- client for the site proxy ---------------- */

export type ActResult = { ok: true } | { ok: false; error: string }

const NETWORK_ERROR =
  'Can’t reach the board right now. Check your connection and try again.'

export async function fetchAdminState(): Promise<AdminState> {
  const res = await fetch('/api/volunteer/admin', { cache: 'no-store' })
  if (!res.ok) {
    throw new Error(`Admin state request failed (${res.status})`)
  }
  return (await res.json()) as AdminState
}

export async function postAdmin(
  body: Record<string, unknown>,
): Promise<ActResult> {
  let res: Response
  try {
    res = await fetch('/api/volunteer/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  } catch {
    return { ok: false, error: NETWORK_ERROR }
  }
  let data: { error?: string } = {}
  try {
    data = (await res.json()) as { error?: string }
  } catch {
    data = {}
  }
  if (!res.ok) {
    return { ok: false, error: data.error ?? 'Something went wrong. Try again.' }
  }
  return { ok: true }
}

/* ---------------- small utilities ---------------- */

export function plural(n: number, one: string, many?: string): string {
  return n === 1 ? one : (many ?? `${one}s`)
}
