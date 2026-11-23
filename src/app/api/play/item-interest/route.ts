import { NextResponse, type NextRequest } from 'next/server'

import { apiPost } from '@/lib/play'

export const dynamic = 'force-dynamic'

/* Thin proxy: validation, capacity, duplicate checks, and storage
   live in the hues-play-api Durable Object (serialized = exact). */
export async function POST(request: NextRequest) {
  let body: Record<string, unknown>
  try {
    body = (await request.json()) as Record<string, unknown>
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }
  const { status, data } = await apiPost('/item-interest', body)
  return NextResponse.json(data, { status })
}
