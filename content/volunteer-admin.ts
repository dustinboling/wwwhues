// Volunteer admin surface: copy ported from
// src/app/volunteer/admin/page.tsx + AuthScreens.tsx (the Next.js
// originals stay until the day-28 sign-off), admin state shapes from
// src/lib/volunteers.ts, and the Oregon wall-clock helpers from the
// admin lib.ts (DST-safe, carried over verbatim).

import type { VolunteerSlot, VolunteerTask } from './volunteer'

export type { VolunteerSlot, VolunteerTask }

export const VOLUNTEER_ADMIN_TITLE = 'Volunteer Admin'

export const VOLUNTEER_ADMIN_DESCRIPTION =
  'Look after the Hues volunteer board: tasks, times, and signups.'

export const VOLUNTEER_ADMIN_EYEBROW = 'Hues Floral Park · Volunteers'

export const VOLUNTEER_ADMIN_HEADING = 'Volunteer admin'

export const VOLUNTEER_ADMIN_INTRO =
  "What's coming up, who's signed up, and the tasks themselves — all in one place."

export interface VolunteerSignup {
  id: string
  name: string
  email: string
  phone: string
  note: string
  createdAt: string
}

export interface VolunteerAdminState {
  setupDone: boolean
  authed: boolean
  tasks?: Array<VolunteerTask>
  slots?: Array<VolunteerSlot>
  signupsBySlot?: Record<string, Array<VolunteerSignup>>
}

export const OREGON_TZ = 'America/Los_Angeles'

export function fmtDay(iso: string): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: OREGON_TZ,
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(new Date(iso))
}

export function fmtDayShort(iso: string): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: OREGON_TZ,
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(new Date(iso))
}

export function fmtTime(iso: string): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: OREGON_TZ,
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(iso))
}

/** "Saturday, November 7 · 9:30 AM" */
export function fmtWhen(iso: string): string {
  return `${fmtDay(iso)} · ${fmtTime(iso)}`
}

export interface SessionView {
  slot: VolunteerSlot
  task: VolunteerTask
  signups: Array<VolunteerSignup>
  taken: number
  spotsLeft: number
  isFull: boolean
  isPast: boolean
  /** Starts within the next 7 days (and hasn't happened yet). */
  isThisWeek: boolean
}

const WEEK_MS = 7 * 24 * 60 * 60 * 1000

export function buildSessions(state: VolunteerAdminState): Array<SessionView> {
  const tasks = state.tasks ?? []
  const slots = state.slots ?? []
  const signupsBySlot = state.signupsBySlot ?? {}
  const taskById = new Map(tasks.map((t) => [t.id, t]))
  const now = Date.now()
  const sessions: Array<SessionView> = []
  for (const slot of slots) {
    const task = taskById.get(slot.taskId)
    if (task === undefined) continue
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
    (a, b) => new Date(a.slot.startsAt).getTime() - new Date(b.slot.startsAt).getTime(),
  )
  return sessions
}

/*
  A datetime-local value is Oregon wall-clock time. Convert it to a
  true UTC ISO string by measuring the zone's offset at that moment
  (carried over from the original admin client — DST-safe).
*/
export function localToISO(local: string): string {
  const naive = new Date(`${local}:00Z`).getTime()
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: OREGON_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date(naive))
  const get = (t: string): string => parts.find((p) => p.type === t)?.value ?? '00'
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
