import { NextResponse, type NextRequest } from 'next/server'

import { apiGetText } from '@/lib/play'

export const dynamic = 'force-dynamic'

/* CSV export of sponsor plaque texts, authed via the play_admin
   cookie → X-Session header, same as the admin JSON proxy. */
export async function GET(request: NextRequest) {
  const session = request.cookies.get('play_admin')?.value
  if (!session) {
    return NextResponse.json({ error: 'Not signed in.' }, { status: 401 })
  }
  const { status, text, contentType } = await apiGetText(
    '/admin/plaques.csv',
    session,
  )
  if (status !== 200) {
    return NextResponse.json({ error: 'Not signed in.' }, { status })
  }
  return new Response(text, {
    headers: {
      'Content-Type': contentType,
      'Content-Disposition': 'attachment; filename="hues-play-plaques.csv"',
    },
  })
}
