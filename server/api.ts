// The hues.flowers Worker app: Hono routes for canonicalization,
// legacy redirects, and the /api proxy (architecture-plan §1a.4, §2.1).
//
// Order inside +server.ts (vike(app) runs first, installing Vike's
// handler last, after these routes): scheme/host canonicalization →
// legacy 301/302s → /api proxy → Vike fallthrough (SPA shells / 404,
// never the shell with 200 for an /api miss — those 404 as JSON here).
//
// Pure factory: registerApp() takes an (optional) env + fetch + clock
// so the whole proxy is unit-testable in Node; +server.ts only binds
// worker bindings. Handlers merge injected env with c.env (worker
// bindings win), so tests inject and production reads wrangler vars.

import { Hono } from 'hono'
import type { Context } from 'hono'
import { buildSecurityHeaders } from '@hues/ui'
import {
  backendBase,
  backendGetJson,
  backendPostJson,
  forwardedPreconditions,
  type BackendEnv,
} from './backends'
import { checkCsrf } from './csrf'
import {
  ACCOUNT_COOKIE,
  PLAY_ADMIN_COOKIE,
  VOLUNTEER_ADMIN_COOKIE,
  accountSessionCookie,
  adminSessionCookie,
  appendSetCookie,
  expireAccountCookie,
  expireAdminCookie,
  expireGameVoterCookie,
  expireHostAccountCookie,
  readCookie,
} from './cookies'
import { RATE_LIMITS, RATE_LIMIT_MESSAGE, clientIp, createRateLimiter, type Clock } from './rate-limit'
import { resolveRedirect } from './redirects'
import { TURNSTILE_MESSAGE, verifyTurnstile } from './turnstile'

/** Production hosts: everything else canonicalizes to the apex. */
const CANONICAL_HOST = 'hues.flowers'

const CANONICAL_HOSTS = new Set([
  'hues.flowers',
  'huesflowers.com',
  'www.huesflowers.com',
  'www.hues.flowers',
])

function isLocal(request: Request): boolean {
  const host = new URL(request.url).hostname
  return host === 'localhost' || host === '127.0.0.1' || host === '[::1]'
}

export interface AppDeps {
  env: BackendEnv
  fetcher?: typeof fetch
  clock?: Clock
}

export function securityHeadersForWorker(): Record<string, string> {
  // Same suite as the static _headers file (generated from this same
  // module): one policy, two serving paths (SecOps #1). HSTS starts at
  // the 300-second ramp without includeSubDomains; Turnstile sources
  // are allowlisted because every public write carries its widget.
  return buildSecurityHeaders({
    mediaDomain: 'https://media.hues.flowers',
    allowTurnstile: true,
    // React sets presentation through style props (progress fills,
    // swatches, focal points); script-src stays strict.
    allowInlineStyles: true,
    hstsMaxAge: 300,
  })
}

function jsonError(message: string, status: number, extra?: Record<string, string>): Response {
  const headers = new Headers({ 'Content-Type': 'application/json' })
  for (const [name, value] of Object.entries(securityHeadersForWorker())) {
    headers.set(name, value)
  }
  headers.set('Cache-Control', 'no-store')
  if (extra !== undefined) {
    for (const [name, value] of Object.entries(extra)) headers.set(name, value)
  }
  return new Response(JSON.stringify({ error: message }), { status, headers })
}

function backendPassthrough(
  status: number,
  data: Record<string, unknown>,
  setCookies: string[],
  cache: string,
): Response {
  const headers = new Headers({ 'Content-Type': 'application/json' })
  for (const [name, value] of Object.entries(securityHeadersForWorker())) {
    headers.set(name, value)
  }
  headers.set('Cache-Control', cache)
  for (const cookie of setCookies) appendSetCookie(headers, cookie)
  return new Response(JSON.stringify(data), { status, headers })
}

type App = Hono<{ Bindings: BackendEnv }>

type ApiContext = Context<{ Bindings: BackendEnv }>

export function registerApp(app: App, deps: AppDeps): App {
  const fetcher = deps.fetcher ?? fetch
  const limiter = createRateLimiter(deps.clock)

  /** Worker bindings win over injected env (tests inject, prod binds). */
  function effEnv(c: ApiContext): BackendEnv {
    return { ...deps.env, ...c.env }
  }

  // Every Worker response carries the security suite + no-store unless
  // a route sets its own Cache-Control (public-state GETs below).
  app.use('*', async (c, next) => {
    await next()
    const headers = securityHeadersForWorker()
    for (const [name, value] of Object.entries(headers)) {
      c.res.headers.set(name, value)
    }
    if (!c.res.headers.has('Cache-Control')) {
      c.res.headers.set('Cache-Control', 'no-store')
    }
  })

  // Scheme/host canonicalization first (Bea §2: one hop at the edge).
  app.use('*', async (c, next) => {
    const url = new URL(c.req.url)
    if (!isLocal(c.req.raw)) {
      if (url.protocol === 'http:') {
        url.protocol = 'https:'
        return c.redirect(url.toString(), 301)
      }
      if (CANONICAL_HOSTS.has(url.hostname) && url.hostname !== CANONICAL_HOST) {
        url.hostname = CANONICAL_HOST
        return c.redirect(url.toString(), 301)
      }
    }
    await next()
  })

  // Legacy map as explicit Hono 301/302s (E1: never Vike +redirects).
  // Query strings drop (?… swallowed into the canonical target).
  app.use('*', async (c, next) => {
    if (c.req.method !== 'GET' && c.req.method !== 'HEAD') {
      await next()
      return
    }
    const resolved = resolveRedirect(new URL(c.req.url).pathname)
    if (resolved === null) {
      await next()
      return
    }
    if (resolved.status === 301) return c.redirect(resolved.to, 301)
    return c.redirect(resolved.to, 302)
  })

  const api = new Hono<{ Bindings: BackendEnv }>()

  // CSRF required custom header + Origin/Sec-Fetch-Site second layer.
  api.use('*', async (c, next) => {
    const check = checkCsrf(c.req.raw)
    if (!check.ok) {
      return c.json({ error: 'That request didn’t come from hues.flowers — please try again.' }, 403)
    }
    await next()
  })

  /** 429 response when the rule is spent, else null (request proceeds). */
  function checkLimit(c: ApiContext, rule: string): Response | null {
    const allowed = RATE_LIMITS[rule]
    if (allowed === undefined) return null
    const verdict = limiter.check(`${rule}:${clientIp(c.req.raw)}`, allowed)
    if (!verdict.allowed) {
      return jsonError(RATE_LIMIT_MESSAGE, 429, {
        'Retry-After': String(verdict.retryAfter),
      })
    }
    return null
  }

  async function readBody(c: ApiContext): Promise<Record<string, unknown> | null> {
    try {
      const data = (await c.req.raw.json()) as unknown
      if (typeof data !== 'object' || data === null || Array.isArray(data)) return null
      return data as Record<string, unknown>
    } catch {
      return null
    }
  }

  function turnstileToken(body: Record<string, unknown>): string | null {
    const token = body.turnstileToken
    return typeof token === 'string' && token !== '' ? token : null
  }

  async function turnstileGate(c: ApiContext, body: Record<string, unknown>): Promise<Response | null> {
    const verdict = await verifyTurnstile(
      turnstileToken(body),
      effEnv(c).TURNSTILE_SECRET_KEY ?? null,
      clientIp(c.req.raw),
      fetcher,
    )
    if (!verdict.ok) return jsonError(TURNSTILE_MESSAGE, 403)
    return null
  }

  // ---- account (signup/signin/me/update/signout) ----

  async function accountWrite(c: ApiContext, path: '/signup' | '/signin', rule: string): Promise<Response> {
    const limited = checkLimit(c, rule)
    if (limited !== null) return limited
    const body = await readBody(c)
    if (body === null) return jsonError('Invalid request.', 400)
    const gated = await turnstileGate(c, body)
    if (gated !== null) return gated
    const { status, data, setCookies } = await backendPostJson(
      backendBase(effEnv(c), 'ACCOUNTS_API_URL'),
      path,
      body,
      forwardedPreconditions(c.req.raw),
      fetcher,
    )
    if (status !== 200 || typeof data.sessionToken !== 'string') {
      return backendPassthrough(status, data, setCookies, 'no-store')
    }
    // Same responses as today's routes: SSO cookie on the parent domain,
    // legacy host-only duplicate expired, game voter session cleared so
    // picks follow the account (Nadia §4.1).
    const headers = new Headers({ 'Content-Type': 'application/json' })
    for (const [name, value] of Object.entries(securityHeadersForWorker())) {
      headers.set(name, value)
    }
    headers.set('Cache-Control', 'no-store')
    for (const cookie of setCookies) appendSetCookie(headers, cookie)
    appendSetCookie(headers, accountSessionCookie(data.sessionToken))
    appendSetCookie(headers, expireHostAccountCookie())
    appendSetCookie(headers, expireGameVoterCookie())
    return new Response(JSON.stringify({ ok: true, visitor: data.visitor }), {
      status: 200,
      headers,
    })
  }

  api.post('/account/signup', (c) => accountWrite(c, '/signup', 'account-public'))
  api.post('/account/signin', (c) => accountWrite(c, '/signin', 'account-signin'))

  api.post('/account/signout', async (c) => {
    const limited = checkLimit(c, 'account-authed')
    if (limited !== null) return limited
    const session = readCookie(c.req.raw.headers.get('Cookie'), ACCOUNT_COOKIE)
    if (session !== null) {
      await backendPostJson(
        backendBase(effEnv(c), 'ACCOUNTS_API_URL'),
        '/signout',
        {},
        { 'X-Account-Session': session },
        fetcher,
      )
    }
    const headers = new Headers({ 'Content-Type': 'application/json' })
    for (const [name, value] of Object.entries(securityHeadersForWorker())) {
      headers.set(name, value)
    }
    headers.set('Cache-Control', 'no-store')
    appendSetCookie(headers, expireAccountCookie())
    appendSetCookie(headers, expireHostAccountCookie())
    appendSetCookie(headers, expireGameVoterCookie())
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers })
  })

  api.get('/account/me', async (c) => {
    const limited = checkLimit(c, 'account-authed')
    if (limited !== null) return limited
    const session = readCookie(c.req.raw.headers.get('Cookie'), ACCOUNT_COOKIE)
    if (session === null) return jsonError('Not signed in.', 401)
    const { status, data, setCookies } = await backendGetJson(
      backendBase(effEnv(c), 'ACCOUNTS_API_URL'),
      '/me',
      { 'X-Account-Session': session },
      fetcher,
    )
    // Per-user read: private, no-cache (§1a.4).
    return backendPassthrough(status, data, setCookies, 'private, no-cache')
  })

  api.post('/account/update', async (c) => {
    const limited = checkLimit(c, 'account-authed')
    if (limited !== null) return limited
    const session = readCookie(c.req.raw.headers.get('Cookie'), ACCOUNT_COOKIE)
    if (session === null) return jsonError('Not signed in.', 401)
    const body = await readBody(c)
    if (body === null) return jsonError('Invalid request.', 400)
    const { status, data, setCookies } = await backendPostJson(
      backendBase(effEnv(c), 'ACCOUNTS_API_URL'),
      '/update',
      body,
      { 'X-Account-Session': session, ...forwardedPreconditions(c.req.raw) },
      fetcher,
    )
    return backendPassthrough(status, data, setCookies, 'no-store')
  })

  // ---- volunteer ----

  api.post('/volunteer/signup', async (c) => {
    const limited = checkLimit(c, 'public-write')
    if (limited !== null) return limited
    const body = await readBody(c)
    if (body === null) return jsonError('Invalid request.', 400)
    const gated = await turnstileGate(c, body)
    if (gated !== null) return gated
    const { status, data, setCookies } = await backendPostJson(
      backendBase(effEnv(c), 'VOLUNTEER_API_URL'),
      '/signup',
      body,
      forwardedPreconditions(c.req.raw),
      fetcher,
    )
    return backendPassthrough(status, data, setCookies, 'no-store')
  })

  api.get('/volunteer/public-state', async (c) => {
    const limited = checkLimit(c, 'public-state')
    if (limited !== null) return limited
    const { status, data, setCookies } = await backendGetJson(
      backendBase(effEnv(c), 'VOLUNTEER_API_URL'),
      '/public-state',
      {},
      fetcher,
    )
    // Public unauthenticated GET: edge TTLs are the freshness contract
    // (§1a.4 / Data #2.2).
    return backendPassthrough(status, data, setCookies, 'public, max-age=60, stale-while-revalidate=300')
  })

  // ---- play (sponsor, rsvp, interests) ----

  const PLAY_WRITES: Record<string, string> = {
    '/play/sponsor': '/sponsor',
    '/play/rsvp': '/rsvp',
    '/play/item-interest': '/item-interest',
    '/play/paver-interest': '/paver-interest',
    '/play/paver-order': '/paver-order',
  }

  for (const [route, backendPath] of Object.entries(PLAY_WRITES)) {
    api.post(route, async (c) => {
      const limited = checkLimit(c, 'public-write')
      if (limited !== null) return limited
      const body = await readBody(c)
      if (body === null) return jsonError('Invalid request.', 400)
      const gated = await turnstileGate(c, body)
      if (gated !== null) return gated
      const { status, data, setCookies } = await backendPostJson(
        backendBase(effEnv(c), 'PLAY_API_URL'),
        backendPath,
        body,
        forwardedPreconditions(c.req.raw),
        fetcher,
      )
      return backendPassthrough(status, data, setCookies, 'no-store')
    })
  }

  api.get('/play/public-state', async (c) => {
    const limited = checkLimit(c, 'public-state')
    if (limited !== null) return limited
    const { status, data, setCookies } = await backendGetJson(
      backendBase(effEnv(c), 'PLAY_API_URL'),
      '/public-state',
      {},
      fetcher,
    )
    return backendPassthrough(status, data, setCookies, 'public, max-age=60, stale-while-revalidate=300')
  })

  // ---- admin proxies (volunteer + arcade share the contract) ----

  function adminRoutes(
    prefix: '/volunteer/admin' | '/play/admin',
    cookie: string,
    backend: 'VOLUNTEER_API_URL' | 'PLAY_API_URL',
  ): void {
    api.get(prefix, async (c) => {
      const limited = checkLimit(c, 'admin-authed')
      if (limited !== null) return limited
      const base = backendBase(effEnv(c), backend)
      const statusRes = await backendGetJson(base, '/auth/status', {}, fetcher)
      const setupDone = (statusRes.data as { setupDone?: boolean }).setupDone
      if (setupDone !== true) {
        return backendPassthrough(200, { setupDone: false, authed: false }, statusRes.setCookies, 'no-store')
      }
      const session = readCookie(c.req.raw.headers.get('Cookie'), cookie)
      if (session === null) {
        return backendPassthrough(200, { setupDone: true, authed: false }, statusRes.setCookies, 'no-store')
      }
      const { status, data, setCookies } = await backendGetJson(
        base,
        '/admin/state',
        { 'X-Session': session },
        fetcher,
      )
      return backendPassthrough(status, data, [...statusRes.setCookies, ...setCookies], 'no-store')
    })

    api.post(prefix, async (c) => {
      const body = await readBody(c)
      if (body === null) return jsonError('Invalid request.', 400)
      const action = typeof body.action === 'string' ? body.action : ''
      const base = backendBase(effEnv(c), backend)

      if (action === 'setup' || action === 'login') {
        const limited = checkLimit(c, 'admin-auth')
        if (limited !== null) return limited
        const { status, data, setCookies } = await backendPostJson(
          base,
          action === 'setup' ? '/auth/setup' : '/auth/login',
          { code: body.code, password: body.password },
          {},
          fetcher,
        )
        if (status !== 200 || typeof data.sessionToken !== 'string') {
          return backendPassthrough(status, data, setCookies, 'no-store')
        }
        const headers = new Headers({ 'Content-Type': 'application/json' })
        for (const [name, value] of Object.entries(securityHeadersForWorker())) {
          headers.set(name, value)
        }
        headers.set('Cache-Control', 'no-store')
        for (const cookieValue of setCookies) appendSetCookie(headers, cookieValue)
        appendSetCookie(headers, adminSessionCookie(cookie, data.sessionToken))
        return new Response(JSON.stringify({ ok: true }), { status: 200, headers })
      }

      if (action === 'logout') {
        const headers = new Headers({ 'Content-Type': 'application/json' })
        for (const [name, value] of Object.entries(securityHeadersForWorker())) {
          headers.set(name, value)
        }
        headers.set('Cache-Control', 'no-store')
        appendSetCookie(headers, expireAdminCookie(cookie))
        return new Response(JSON.stringify({ ok: true }), { status: 200, headers })
      }

      const limited = checkLimit(c, 'admin-authed')
      if (limited !== null) return limited
      const session = readCookie(c.req.raw.headers.get('Cookie'), cookie)
      if (session === null) return jsonError('Not signed in.', 401)
      const { status, data, setCookies } = await backendPostJson(
        base,
        '/admin/action',
        body,
        { 'X-Session': session, ...forwardedPreconditions(c.req.raw) },
        fetcher,
      )
      return backendPassthrough(status, data, setCookies, 'no-store')
    })
  }

  adminRoutes('/volunteer/admin', VOLUNTEER_ADMIN_COOKIE, 'VOLUNTEER_API_URL')
  // N2: the page route moved /play/admin → /arcade/admin, but API paths
  // do NOT rename (§2.1) — the arcade admin posts to /api/play/admin.
  adminRoutes('/play/admin', PLAY_ADMIN_COOKIE, 'PLAY_API_URL')

  // Plaque CSV export (authed, same contract as today's route).
  api.get('/play/admin/plaques', async (c) => {
    const limited = checkLimit(c, 'admin-authed')
    if (limited !== null) return limited
    const session = readCookie(c.req.raw.headers.get('Cookie'), PLAY_ADMIN_COOKIE)
    if (session === null) return jsonError('Not signed in.', 401)
    let res: Response
    try {
      res = await fetcher(`${backendBase(effEnv(c), 'PLAY_API_URL')}/admin/plaques.csv`, {
        headers: { 'X-Session': session },
        cache: 'no-store',
      })
    } catch {
      return jsonError('The park’s board didn’t answer — please try again in a moment.', 502)
    }
    if (res.status !== 200) return jsonError('Not signed in.', res.status)
    const headers = new Headers({
      'Content-Type': res.headers.get('Content-Type') ?? 'text/plain',
      'Content-Disposition': 'attachment; filename="hues-play-plaques.csv"',
    })
    for (const [name, value] of Object.entries(securityHeadersForWorker())) {
      headers.set(name, value)
    }
    headers.set('Cache-Control', 'no-store')
    return new Response(await res.text(), { status: 200, headers })
  })

  // ---- thisorthat passthrough (game reads; same guards, no new paths) ----
  api.all('/thisorthat/*', async (c) => {
    const limited = checkLimit(c, c.req.method === 'GET' ? 'public-state' : 'public-write')
    if (limited !== null) return limited
    const suffix = new URL(c.req.url).pathname.slice('/api/thisorthat'.length) || '/'
    const base = backendBase(effEnv(c), 'THISORThat_API_URL')
    if (c.req.method === 'GET' || c.req.method === 'HEAD') {
      const cookie = c.req.raw.headers.get('Cookie')
      const { status, data, setCookies } = await backendGetJson(
        base,
        suffix,
        cookie === null ? {} : { Cookie: cookie },
        fetcher,
      )
      return backendPassthrough(status, data, setCookies, 'private, no-cache')
    }
    const body = await readBody(c)
    if (body === null) return jsonError('Invalid request.', 400)
    const { status, data, setCookies } = await backendPostJson(
      base,
      suffix,
      body,
      forwardedPreconditions(c.req.raw),
      fetcher,
    )
    return backendPassthrough(status, data, setCookies, 'no-store')
  })

  // /api misses 404 as JSON — never the app shell with 200 (§5).
  // An explicit catch-all route (not sub-app notFound, which the parent
  // swallows when mounted): non-/api misses still fall through to Vike.
  api.all('/*', (c) => c.json({ error: 'Not found.' }, 404))

  app.route('/api', api)
  return app
}

/** Standalone app for tests (production binds via +server.ts instead). */
export function createApp(deps: AppDeps): App {
  return registerApp(new Hono<{ Bindings: BackendEnv }>(), deps)
}
