import { NextResponse, type NextRequest } from 'next/server'

import { accountApiPost, clearGameSessionCookie } from '@/lib/accounts'

export const dynamic = 'force-dynamic'

const COOKIE = 'hues_account'

export async function POST(request: NextRequest) {
  const session = request.cookies.get(COOKIE)?.value
  if (session) {
    // Revoke server-side too, so the token dies everywhere.
    await accountApiPost('/signout', {}, { 'X-Account-Session': session })
  }
  const res = NextResponse.json({ ok: true })
  clearGameSessionCookie(res)
  // SSO (2026-11-13): sign-out clears BOTH the parent-domain session
  // cookie (the live one, shared with every game subdomain) and any
  // legacy host-only cookie — sign out anywhere, signed out everywhere
  // (the token is also revoked server-side above).
  res.cookies.set({
    name: COOKIE,
    value: '',
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    domain: '.hues.flowers',
    maxAge: 0,
  })
  res.headers.append(
    'Set-Cookie',
    `${COOKIE}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax`,
  )
  return res
}
