import { NextResponse, type NextRequest } from 'next/server'

import { accountApiPost } from '@/lib/accounts'

export const dynamic = 'force-dynamic'

const COOKIE = 'hues_account'

export async function POST(request: NextRequest) {
  const session = request.cookies.get(COOKIE)?.value
  if (!session) {
    return NextResponse.json({ error: 'Not signed in.' }, { status: 401 })
  }
  let body: Record<string, unknown>
  try {
    body = (await request.json()) as Record<string, unknown>
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }
  const { status, data } = await accountApiPost('/update', body, {
    'X-Account-Session': session,
  })
  return NextResponse.json(data, { status })
}
