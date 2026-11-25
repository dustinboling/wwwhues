import { describe, expect, it } from 'vitest'
import { createApp } from '../../server/api'
import { CSRF_HEADER, CSRF_VALUE } from '../../server/csrf'

// Full proxy contract through app.request() with a canned backend:
// same paths, same responses, cookies byte-identical, guards enforced.

const JSON_HEADERS = { 'Content-Type': 'application/json' }

function postInit(body: Record<string, unknown>, extra: Record<string, string> = {}): RequestInit {
  return {
    method: 'POST',
    headers: { ...JSON_HEADERS, [CSRF_HEADER]: CSRF_VALUE, ...extra },
    body: JSON.stringify(body),
  }
}

type Route = (url: string, init?: RequestInit) => Response | null

function mockFetch(routes: Route[]): typeof fetch {
  return (async (input: string | URL | Request, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url
    for (const route of routes) {
      const res = route(url, init)
      if (res !== null) return res
    }
    return new Response(JSON.stringify({ error: 'backend: no route' }), { status: 500 })
  }) as typeof fetch
}

function json(data: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers },
  })
}

function setCookies(res: Response): string[] {
  const splitter = (res.headers as Headers & { getSetCookie?: () => string[] }).getSetCookie
  if (typeof splitter === 'function') return splitter.call(res.headers)
  const single = res.headers.get('Set-Cookie')
  return single === null ? [] : [single]
}

const VISITOR = { id: 'v1', name: 'Ada', email: 'ada@example.com', phone: '+15415550123' }

describe('account proxy', () => {
  it('signup sets the SSO cookie, expires the legacy duplicate, and clears the voter session', async () => {
    const seen: Array<{ url: string; init?: RequestInit }> = []
    const fetcher = mockFetch([
      (url, init) => {
        seen.push({ url, init })
        if (url.endsWith('/signup')) {
          return json({ ok: true, sessionToken: 'tok-1', visitor: VISITOR })
        }
        return null
      },
    ])
    const app = createApp({ env: {}, fetcher })
    const res = await app.request(
      'https://hues.flowers/api/account/signup',
      postInit({ name: 'Ada', email: 'ada@example.com', phone: '(541) 555-0123' }),
    )
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ ok: true, visitor: VISITOR })
    const cookies = setCookies(res)
    expect(cookies).toHaveLength(3)
    expect(cookies[0]).toContain('hues_account=tok-1')
    expect(cookies[0]).toContain('Domain=.hues.flowers')
    expect(cookies[0]).toContain('HttpOnly')
    expect(cookies[0]).toContain('Secure')
    expect(cookies[0]).toContain('SameSite=Lax')
    expect(cookies[0]).toContain(`Max-Age=${90 * 24 * 60 * 60}`)
    expect(cookies[1]).toBe('hues_account=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax')
    expect(cookies[2]).toContain('tot_voter=; Path=/; Domain=.hues.flowers; Max-Age=0')
    // Same backend path as today's Next.js route.
    expect(seen[0]?.url).toBe('https://hues-accounts-api.dustin-boling.workers.dev/signup')
  })

  it('passes the 409 split-pair case through untouched (status + body, no cookies)', async () => {
    const fetcher = mockFetch([
      (url) =>
        url.endsWith('/signup')
          ? json(
              {
                error:
                  'That email and that mobile number belong to two different accounts. Please use the email and number you signed up with — or call us at (458) 245-1323 and we’ll sort it out.',
              },
              409,
            )
          : null,
    ])
    const app = createApp({ env: {}, fetcher })
    const res = await app.request(
      'https://hues.flowers/api/account/signup',
      postInit({ name: 'Ada', email: 'a@x.com', phone: '1' }),
    )
    expect(res.status).toBe(409)
    const data = (await res.json()) as { error: string }
    expect(data.error).toContain('two different accounts')
    expect(setCookies(res)).toHaveLength(0)
  })

  it('signout revokes server-side and clears every session cookie', async () => {
    const calls: string[] = []
    const fetcher = mockFetch([
      (url) => {
        calls.push(url)
        return url.endsWith('/signout') ? json({ ok: true }) : null
      },
    ])
    const app = createApp({ env: {}, fetcher })
    const res = await app.request('https://hues.flowers/api/account/signout', {
      method: 'POST',
      headers: { [CSRF_HEADER]: CSRF_VALUE, Cookie: 'hues_account=tok-1' },
    })
    expect(res.status).toBe(200)
    expect(calls).toEqual(['https://hues-accounts-api.dustin-boling.workers.dev/signout'])
    const cookies = setCookies(res)
    expect(cookies).toHaveLength(3)
    expect(cookies.some((c) => c.startsWith('hues_account=; Path=/; Domain=.hues.flowers; Max-Age=0'))).toBe(true)
    expect(cookies.some((c) => c.startsWith('hues_account=; Path=/; Max-Age=0'))).toBe(true)
    expect(cookies.some((c) => c.startsWith('tot_voter='))).toBe(true)
  })

  it('me maps the cookie to X-Account-Session and answers 401 without one', async () => {
    let sessionHeader: string | null = null
    const fetcher = mockFetch([
      (url, init) => {
        const headers = new Headers(init?.headers)
        sessionHeader = headers.get('X-Account-Session')
        return url.endsWith('/me') ? json({ ok: true, visitor: VISITOR }) : null
      },
    ])
    const app = createApp({ env: {}, fetcher })
    const authed = await app.request('https://hues.flowers/api/account/me', {
      headers: { Cookie: 'hues_account=tok-9' },
    })
    expect(authed.status).toBe(200)
    expect(sessionHeader).toBe('tok-9')
    expect(authed.headers.get('Cache-Control')).toBe('private, no-cache')
    const anon = await app.request('https://hues.flowers/api/account/me')
    expect(anon.status).toBe(401)
  })

  it('update forwards the session plus If-Match preconditions', async () => {
    let seen: Record<string, string> = {}
    const fetcher = mockFetch([
      (url, init) => {
        const headers = new Headers(init?.headers)
        headers.forEach((value, key) => {
          seen[key] = value
        })
        return url.endsWith('/update') ? json({ ok: true, visitor: VISITOR }) : null
      },
    ])
    const app = createApp({ env: {}, fetcher })
    const res = await app.request(
      'https://hues.flowers/api/account/update',
      postInit({ name: 'Ada L.' }, { Cookie: 'hues_account=tok-9', 'If-Match': '"3"' }),
    )
    expect(res.status).toBe(200)
    expect(seen['x-account-session']).toBe('tok-9')
    expect(seen['if-match']).toBe('"3"')
  })
})

describe('public writes', () => {
  const signupBody = { taskId: 't', slotId: 's', name: 'Bo', email: 'bo@x.com' }

  it('volunteer signup proxies when no Turnstile secret is configured (dev path)', async () => {
    const fetcher = mockFetch([(url) => (url.endsWith('/signup') ? json({ ok: true }) : null)])
    const app = createApp({ env: {}, fetcher })
    const res = await app.request(
      'https://hues.flowers/api/volunteer/signup',
      postInit(signupBody),
    )
    expect(res.status).toBe(200)
  })

  it('enforces Siteverify before the write when the secret is set', async () => {
    const backendHits: string[] = []
    const fetcher = mockFetch([
      (url) => {
        if (url.includes('challenges.cloudflare.com')) {
          return json({ success: false })
        }
        backendHits.push(url)
        return json({ ok: true })
      },
    ])
    const app = createApp({ env: { TURNSTILE_SECRET_KEY: 'secret' }, fetcher })
    const res = await app.request(
      'https://hues.flowers/api/volunteer/signup',
      postInit({ ...signupBody, turnstileToken: 'bad-token' }),
    )
    expect(res.status).toBe(403)
    expect(backendHits).toHaveLength(0)
  })

  it('accepts the write when Siteverify succeeds', async () => {
    const fetcher = mockFetch([
      (url) => {
        if (url.includes('challenges.cloudflare.com')) {
          return json({ success: true })
        }
        return url.endsWith('/sponsor') ? json({ ok: true }) : null
      },
    ])
    const app = createApp({ env: { TURNSTILE_SECRET_KEY: 'secret' }, fetcher })
    const res = await app.request(
      'https://hues.flowers/api/play/sponsor',
      postInit({ itemId: 'i', name: 'Bo', turnstileToken: 'good' }),
    )
    expect(res.status).toBe(200)
  })

  it('rejects invalid JSON with 400', async () => {
    const app = createApp({ env: {}, fetcher: mockFetch([]) })
    const res = await app.request('https://hues.flowers/api/play/rsvp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', [CSRF_HEADER]: CSRF_VALUE },
      body: 'not-json{{{',
    })
    expect(res.status).toBe(400)
  })

  it('serves public-state with the edge freshness TTLs', async () => {
    const fetcher = mockFetch([(url) => (url.endsWith('/public-state') ? json({ events: [] }) : null)])
    const app = createApp({ env: {}, fetcher })
    const res = await app.request('https://hues.flowers/api/play/public-state')
    expect(res.status).toBe(200)
    expect(res.headers.get('Cache-Control')).toBe('public, max-age=60, stale-while-revalidate=300')
  })

  it('passes backend Set-Cookie through byte-identical', async () => {
    const fetcher = mockFetch([
      (url) =>
        url.endsWith('/public-state')
          ? json({ events: [] }, 200, { 'Set-Cookie': 'x=1; Path=/; Secure' })
          : null,
    ])
    const app = createApp({ env: {}, fetcher })
    const res = await app.request('https://hues.flowers/api/play/public-state')
    expect(setCookies(res)).toEqual(['x=1; Path=/; Secure'])
  })

  it('maps an unreachable backend to 502 with retry semantics', async () => {
    const fetcher = (async () => {
      throw new Error('down')
    }) as typeof fetch
    const app = createApp({ env: {}, fetcher })
    const res = await app.request('https://hues.flowers/api/play/public-state')
    expect(res.status).toBe(502)
    const data = (await res.json()) as { error: string }
    expect(data.error).toContain('try again')
  })
})

describe('admin proxies', () => {
  it('reports setup/login states and maps the cookie to X-Session', async () => {
    const sessions: Array<string | null> = []
    const fetcher = mockFetch([
      (url, init) => {
        if (url.endsWith('/auth/status')) return json({ setupDone: true })
        if (url.endsWith('/admin/state')) {
          sessions.push(new Headers(init?.headers).get('X-Session'))
          return json({ setupDone: true, authed: true, tasks: [] })
        }
        return null
      },
    ])
    const app = createApp({ env: {}, fetcher })
    const authed = await app.request('https://hues.flowers/api/volunteer/admin', {
      headers: { Cookie: 'vol_admin=sess' },
    })
    expect(authed.status).toBe(200)
    expect(sessions).toEqual(['sess'])
    const anon = await app.request('https://hues.flowers/api/volunteer/admin')
    expect(await anon.json()).toEqual({ setupDone: true, authed: false })
  })

  it('first-run setup state passes through', async () => {
    const fetcher = mockFetch([(url) => (url.endsWith('/auth/status') ? json({ setupDone: false }) : null)])
    const app = createApp({ env: {}, fetcher })
    const res = await app.request('https://hues.flowers/api/play/admin')
    expect(await res.json()).toEqual({ setupDone: false, authed: false })
  })

  it('login sets the host-only admin cookie; logout clears it', async () => {
    const fetcher = mockFetch([
      (url) => (url.endsWith('/auth/login') ? json({ ok: true, sessionToken: 'adm-1' }) : null),
    ])
    const app = createApp({ env: {}, fetcher })
    const login = await app.request(
      'https://hues.flowers/api/play/admin',
      postInit({ action: 'login', password: 'pw' }),
    )
    expect(login.status).toBe(200)
    const cookies = setCookies(login)
    expect(cookies).toHaveLength(1)
    expect(cookies[0]).toContain('play_admin=adm-1')
    expect(cookies[0]).toContain('HttpOnly')
    expect(cookies[0]).not.toContain('Domain=')
    const logout = await app.request(
      'https://hues.flowers/api/play/admin',
      postInit({ action: 'logout' }),
    )
    expect(setCookies(logout)[0]).toContain('play_admin=; Path=/; Max-Age=0')
  })

  it('admin actions require the session cookie', async () => {
    const app = createApp({ env: {}, fetcher: mockFetch([]) })
    const res = await app.request(
      'https://hues.flowers/api/volunteer/admin',
      postInit({ action: 'create_task', title: 'x' }),
    )
    expect(res.status).toBe(401)
  })

  it('plaques CSV needs auth and keeps its download headers', async () => {
    const fetcher = mockFetch([
      () => new Response('id,text\n', { status: 200, headers: { 'Content-Type': 'text/csv' } }),
    ])
    const app = createApp({ env: {}, fetcher })
    const anon = await app.request('https://hues.flowers/api/play/admin/plaques')
    expect(anon.status).toBe(401)
    const authed = await app.request('https://hues.flowers/api/play/admin/plaques', {
      headers: { Cookie: 'play_admin=sess' },
    })
    expect(authed.status).toBe(200)
    expect(authed.headers.get('Content-Disposition')).toContain('hues-play-plaques.csv')
  })
})

describe('guards + routing', () => {
  it('rejects writes without the CSRF header (403)', async () => {
    const app = createApp({ env: {}, fetcher: mockFetch([]) })
    const res = await app.request('https://hues.flowers/api/account/signout', { method: 'POST' })
    expect(res.status).toBe(403)
  })

  it('rejects forged origins and cross-site fetch metadata', async () => {
    const app = createApp({ env: {}, fetcher: mockFetch([]) })
    const badOrigin = await app.request(
      'https://hues.flowers/api/account/signout',
      postInit({}, { Origin: 'https://evil.example' }),
    )
    expect(badOrigin.status).toBe(403)
    const badSite = await app.request(
      'https://hues.flowers/api/account/signout',
      postInit({}, { 'Sec-Fetch-Site': 'cross-site' }),
    )
    expect(badSite.status).toBe(403)
    const sameOrigin = await app.request(
      'https://hues.flowers/api/account/signout',
      postInit({}, { Origin: 'https://hues.flowers', 'Sec-Fetch-Site': 'same-origin' }),
    )
    expect(sameOrigin.status).toBe(200)
  })

  it('rate-limits admin auth hardest: 5 per 15 minutes, then 429 + Retry-After', async () => {
    let now = 1_000_000
    const fetcher = mockFetch([(url) => (url.endsWith('/auth/login') ? json({ error: 'no' }, 401) : null)])
    const app = createApp({ env: {}, fetcher, clock: () => now })
    for (let i = 0; i < 5; i += 1) {
      const res = await app.request(
        'https://hues.flowers/api/play/admin',
        postInit({ action: 'login', password: 'wrong' }, { 'CF-Connecting-IP': '9.9.9.9' }),
      )
      expect(res.status).toBe(401)
    }
    const limited = await app.request(
      'https://hues.flowers/api/play/admin',
      postInit({ action: 'login', password: 'wrong' }, { 'CF-Connecting-IP': '9.9.9.9' }),
    )
    expect(limited.status).toBe(429)
    expect(limited.headers.get('Retry-After')).toBe('900')
    const data = (await limited.json()) as { error: string }
    expect(data.error).toContain('Too many attempts')
    // Another IP is unaffected; the window reset re-admits the first.
    const other = await app.request(
      'https://hues.flowers/api/play/admin',
      postInit({ action: 'login', password: 'wrong' }, { 'CF-Connecting-IP': '8.8.8.8' }),
    )
    expect(other.status).toBe(401)
    now += 901_000
    const reset = await app.request(
      'https://hues.flowers/api/play/admin',
      postInit({ action: 'login', password: 'wrong' }, { 'CF-Connecting-IP': '9.9.9.9' }),
    )
    expect(reset.status).toBe(401)
  })

  it('serves legacy redirects in one hop with the query dropped', async () => {
    const app = createApp({ env: {}, fetcher: mockFetch([]) })
    const res = await app.request('https://hues.flowers/m/visit?full=1')
    expect(res.status).toBe(301)
    expect(res.headers.get('Location')).toBe('/visit')
    const cross = await app.request('https://hues.flowers/m/arcade/match')
    expect(cross.status).toBe(302)
    expect(cross.headers.get('Location')).toBe('https://dahliamatch.hues.flowers')
  })

  it('canonicalizes scheme and host in one hop', async () => {
    const app = createApp({ env: {}, fetcher: mockFetch([]) })
    const scheme = await app.request('http://hues.flowers/visit')
    expect(scheme.status).toBe(301)
    expect(scheme.headers.get('Location')).toBe('https://hues.flowers/visit')
    const host = await app.request('https://www.hues.flowers/visit')
    expect(host.status).toBe(301)
    expect(host.headers.get('Location')).toBe('https://hues.flowers/visit')
  })

  it('404s /api misses as JSON, never the shell', async () => {
    const app = createApp({ env: {}, fetcher: mockFetch([]) })
    const res = await app.request('https://hues.flowers/api/nope')
    expect(res.status).toBe(404)
    expect((await res.json()) as unknown).toEqual({ error: 'Not found.' })
  })

  it('sets the security suite on worker responses', async () => {
    const fetcher = mockFetch([(url) => (url.endsWith('/public-state') ? json({ events: [] }) : null)])
    const app = createApp({ env: {}, fetcher })
    const res = await app.request('https://hues.flowers/api/play/public-state')
    const csp = res.headers.get('Content-Security-Policy') ?? ''
    expect(csp).toContain("default-src 'self'")
    expect(csp).toContain('https://challenges.cloudflare.com')
    // X1: the Worker path agrees with _headers — connect-src carries the
    // media origin so the worker's own fetch() calls are allowed it.
    expect(csp).toContain("connect-src 'self' https://media.hues.flowers")
    expect(res.headers.get('X-Content-Type-Options')).toBe('nosniff')
    expect(res.headers.get('X-Frame-Options')).toBe('DENY')
    expect(res.headers.get('Strict-Transport-Security')).toContain('max-age=300')
  })
})
