// Backend origin resolution + forwarding for the /api proxy
// (architecture-plan §2.1 "Backend consumption").
//
// The four *_API_URL vars carry the same values as today's wrangler.jsonc
// (live config, kept byte-identical): the proxy only moves the host that
// forwards to them, from Next.js routes to this Worker. No CORS changes
// (browsers keep talking same-origin to the property host), no Durable
// Object contact, no backend changes — additive headers only.
//
// Forwarding rules:
// - Set-Cookie from a backend passes through byte-identical (every
//   value preserved; Headers.append, never set).
// - Backend JSON bodies pass through untouched (status included — the
//   account 409 split-pair case, validation 400s, admin 401s).
// - A backend that cannot be reached (or answers non-JSON where JSON
//   is required) maps to 502 with retry semantics, never a hang.
// - Optimistic-concurrency preconditions (If-Match) and idempotency
//   keys (Idempotency-Key) forward verbatim; backends that do not know
//   them yet ignore them, which keeps the §2.1(e)/Data #2.5 client
//   pattern additive and safe.

export interface BackendEnv {
  ACCOUNTS_API_URL?: string
  PLAY_API_URL?: string
  VOLUNTEER_API_URL?: string
  THISORThat_API_URL?: string
  TURNSTILE_SECRET_KEY?: string
}

const FALLBACKS = {
  ACCOUNTS_API_URL: 'https://hues-accounts-api.dustin-boling.workers.dev',
  PLAY_API_URL: 'https://hues-play-api.dustin-boling.workers.dev',
  VOLUNTEER_API_URL: 'https://hues-volunteers-api.dustin-boling.workers.dev',
  THISORThat_API_URL: 'https://hues-thisorthat-api.dustin-boling.workers.dev',
} as const

export type BackendName = keyof typeof FALLBACKS

export function backendBase(env: BackendEnv, name: BackendName): string {
  const fromEnv = env[name]
  if (typeof fromEnv === 'string' && fromEnv !== '') return fromEnv.replace(/\/$/, '')
  return FALLBACKS[name]
}

export const BACKEND_UNREACHABLE_MESSAGE =
  'The park’s board didn’t answer — please try again in a moment.'

export interface BackendJson {
  status: number
  data: Record<string, unknown>
  setCookies: string[]
}

/** Split a backend's Set-Cookie values (getSetCookie where available). */
export function splitSetCookie(headers: Headers): string[] {
  const splitter = (
    headers as Headers & { getSetCookie?: () => string[] }
  ).getSetCookie
  if (typeof splitter === 'function') return splitter.call(headers)
  const single = headers.get('Set-Cookie')
  return single === null ? [] : [single]
}

export async function backendPostJson(
  base: string,
  path: string,
  body: Record<string, unknown>,
  headers: Record<string, string>,
  fetcher: typeof fetch = fetch,
): Promise<BackendJson> {
  let res: Response
  try {
    res = await fetcher(`${base}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify(body),
      cache: 'no-store',
    })
  } catch {
    return { status: 502, data: { error: BACKEND_UNREACHABLE_MESSAGE }, setCookies: [] }
  }
  return readBackendJson(res)
}

export async function backendGetJson(
  base: string,
  path: string,
  headers: Record<string, string>,
  fetcher: typeof fetch = fetch,
): Promise<BackendJson> {
  let res: Response
  try {
    res = await fetcher(`${base}${path}`, { headers, cache: 'no-store' })
  } catch {
    return { status: 502, data: { error: BACKEND_UNREACHABLE_MESSAGE }, setCookies: [] }
  }
  return readBackendJson(res)
}

async function readBackendJson(res: Response): Promise<BackendJson> {
  const setCookies = splitSetCookie(res.headers)
  let data: Record<string, unknown>
  try {
    data = (await res.json()) as Record<string, unknown>
  } catch {
    return { status: 502, data: { error: BACKEND_UNREACHABLE_MESSAGE }, setCookies }
  }
  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    return { status: 502, data: { error: BACKEND_UNREACHABLE_MESSAGE }, setCookies }
  }
  return { status: res.status, data, setCookies }
}

/** Forward If-Match / Idempotency-Key verbatim when the client sent them. */
export function forwardedPreconditions(request: Request): Record<string, string> {
  const headers: Record<string, string> = {}
  const match = request.headers.get('If-Match')
  if (match !== null) headers['If-Match'] = match
  const key = request.headers.get('Idempotency-Key')
  if (key !== null) headers['Idempotency-Key'] = key
  return headers
}
