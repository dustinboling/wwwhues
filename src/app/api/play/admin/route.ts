import { NextResponse, type NextRequest } from 'next/server'

import { apiGet, apiPost, type AdminState } from '@/lib/play'

export const dynamic = 'force-dynamic'

/*
  Thin proxy to the hues-play-api worker. Auth (setup code + password,
  PBKDF2) and all data live in its Durable Object; this route only maps
  the browser's play_admin cookie to the API's X-Session header and
  sets the cookie from tokens the API issues at setup/login.
*/

const COOKIE = 'play_admin'

function sessionCookie(token: string) {
  return {
    name: COOKIE,
    value: token,
    httpOnly: true,
    secure: true,
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 30 * 24 * 60 * 60,
  }
}

export async function GET(request: NextRequest) {
  const session = request.cookies.get(COOKIE)?.value
  const { setupDone } = await apiGet<{ setupDone: boolean }>('/auth/status')
  if (!setupDone) {
    return NextResponse.json({ setupDone: false, authed: false })
  }
  if (!session) {
    return NextResponse.json({ setupDone: true, authed: false })
  }
  const state = await apiGet<AdminState>('/admin/state', session)
  return NextResponse.json(state)
}

interface AdminBody {
  action?: string
  code?: string
  password?: string
  [key: string]: unknown
}

export async function POST(request: NextRequest) {
  let body: AdminBody
  try {
    body = (await request.json()) as AdminBody
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }
  const action = body.action ?? ''

  if (action === 'setup' || action === 'login') {
    const path = action === 'setup' ? '/auth/setup' : '/auth/login'
    const { status, data } = await apiPost(path, {
      code: body.code,
      password: body.password,
    })
    if (status !== 200 || typeof data.sessionToken !== 'string') {
      return NextResponse.json(data, { status })
    }
    const res = NextResponse.json({ ok: true })
    res.cookies.set(sessionCookie(data.sessionToken))
    return res
  }

  if (action === 'logout') {
    const res = NextResponse.json({ ok: true })
    res.cookies.set({ ...sessionCookie(''), maxAge: 0 })
    return res
  }

  const session = request.cookies.get(COOKIE)?.value
  if (!session) {
    return NextResponse.json({ error: 'Not signed in.' }, { status: 401 })
  }
  const { status, data } = await apiPost('/admin/action', body, session)
  return NextResponse.json(data, { status })
}
