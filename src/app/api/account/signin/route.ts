import { NextResponse, type NextRequest } from 'next/server'

import { accountApiPost, clearGameSessionCookie } from '@/lib/accounts'

export const dynamic = 'force-dynamic'

const COOKIE = 'hues_account'
const MAX_AGE = 90 * 24 * 60 * 60

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>
  try {
    body = (await request.json()) as Record<string, unknown>
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }
  const { status, data } = await accountApiPost('/signin', body)
  if (status !== 200 || typeof data.sessionToken !== 'string') {
    return NextResponse.json(data, { status })
  }
  const res = NextResponse.json({ ok: true, visitor: data.visitor })
  clearGameSessionCookie(res)
  // SSO (2026-11-13, Dusty): one Hues account across hues.flowers AND
  // every game subdomain — the session cookie is scoped to the parent
  // domain so all subdomains receive it. The legacy host-only cookie
  // is expired in the same response so no duplicate identity lingers.
  res.cookies.set({
    name: COOKIE,
    value: data.sessionToken,
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    domain: '.hues.flowers',
    maxAge: MAX_AGE,
  })
  res.headers.append(
    'Set-Cookie',
    `${COOKIE}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax`,
  )
  return res
}
