import { getCloudflareContext } from '@opennextjs/cloudflare'

/*
  Hues account client for the hues-accounts-api worker.
  All identity data + sessions live in that worker's Durable
  Object (SQLite). This module only forwards, server-side —
  browsers talk to the /api/account routes on hues.flowers, and
  the session token itself rides in an httpOnly cookie, exactly
  like the This or That voter session.
*/

async function apiBase(): Promise<string> {
  const { env } = await getCloudflareContext({ async: true })
  const fromEnv = (env as unknown as { ACCOUNTS_API_URL?: string })
    .ACCOUNTS_API_URL
  return (
    fromEnv ??
    process.env.ACCOUNTS_API_URL ??
    'https://hues-accounts-api.dustin-boling.workers.dev'
  )
}

export interface AccountVisitor {
  id: string
  name: string
  email: string
  phone: string
}

export async function accountApiPost(
  path: string,
  body: Record<string, unknown>,
  headers: Record<string, string> = {},
): Promise<{ status: number; data: Record<string, unknown> }> {
  const base = await apiBase()
  const res = await fetch(`${base}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
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

export async function accountApiGetWithStatus(
  path: string,
  headers: Record<string, string> = {},
): Promise<{ status: number; data: Record<string, unknown> }> {
  const base = await apiBase()
  const res = await fetch(`${base}${path}`, { headers, cache: 'no-store' })
  let data: Record<string, unknown> = {}
  try {
    data = (await res.json()) as Record<string, unknown>
  } catch {
    data = {}
  }
  return { status: res.status, data }
}

/*
  Identity changes must reach the games (Dustin, 2026-11-13: he
  signed out of one Hues account, in as another, and This or That?
  still greeted him by the first account — the game keeps its own
  voter cookie, minted under whoever entered the game first).
  Every account sign-in, sign-up and sign-out clears the game's
  voter cookie; the game then re-enters silently under the current
  account (or shows its entry gate when nobody is signed in).
*/
export function clearGameSessionCookie(res: {
  cookies: {
    set: (c: {
      name: string
      value: string
      httpOnly: boolean
      secure: boolean
      sameSite: 'lax'
      path: string
      domain: string
      maxAge: number
    }) => void
  }
}): void {
  // The game lives on thisorthat.hues.flowers now and sets its voter
  // cookie scoped to the parent domain; clearing with the SAME domain
  // scope is what makes the clear reach it (SSO pass, 2026-11-13).
  res.cookies.set({
    name: 'tot_voter',
    value: '',
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    domain: '.hues.flowers',
    maxAge: 0,
  })
}
