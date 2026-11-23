import { getCloudflareContext } from '@opennextjs/cloudflare'

/*
  Volunteer board client for the hues-volunteers-api worker.
  All data + admin auth live in that worker's Durable Object (SQLite),
  which serializes writes — slot capacities and counts are exact.
  (KV was tried first; its eventual consistency lost signups in testing.)
  This module only formats and forwards, server-side.
*/

export interface Task {
  id: string
  title: string
  description: string
  duration: string
  setting: string
  physical: string
  status: 'open' | 'closed' | 'done'
  createdAt: string
}

export interface Slot {
  id: string
  taskId: string
  startsAt: string
  capacity: number
}

export interface Signup {
  id: string
  name: string
  email: string
  phone: string
  note: string
  createdAt: string
}

export interface PublicState {
  tasks: Array<Task>
  slots: Array<Slot>
  counts: Record<string, number>
}

export interface AdminState {
  setupDone: boolean
  authed: boolean
  tasks?: Array<Task>
  slots?: Array<Slot>
  signupsBySlot?: Record<string, Array<Signup>>
}

async function apiBase(): Promise<string> {
  const { env } = await getCloudflareContext({ async: true })
  const fromEnv = (env as unknown as { VOLUNTEER_API_URL?: string })
    .VOLUNTEER_API_URL
  return (
    fromEnv ??
    process.env.VOLUNTEER_API_URL ??
    'https://hues-volunteers-api.dustin-boling.workers.dev'
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

/* ---------- display formatting ---------- */

export function formatSlot(startsAt: string): string {
  const d = new Date(startsAt)
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Los_Angeles',
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(d)
}

export function formatSlotLong(startsAt: string): string {
  const d = new Date(startsAt)
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Los_Angeles',
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(d)
}
