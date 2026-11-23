import { NextResponse, type NextRequest } from 'next/server'

import { accountApiGetWithStatus } from '@/lib/accounts'

export const dynamic = 'force-dynamic'

const COOKIE = 'hues_account'

export async function GET(request: NextRequest) {
  const session = request.cookies.get(COOKIE)?.value
  if (!session) {
    return NextResponse.json({ error: 'Not signed in.' }, { status: 401 })
  }
  const { status, data } = await accountApiGetWithStatus('/me', {
    'X-Account-Session': session,
  })
  return NextResponse.json(data, { status })
}
