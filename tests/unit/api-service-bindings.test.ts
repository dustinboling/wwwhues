import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp } from '../../server/api'
import { backendFetcher, type Fetcher } from '../../server/backends'
import { CSRF_HEADER, CSRF_VALUE } from '../../server/csrf'

// Slice K: service-binding dispatch for the /api proxy. When the env
// carries a backend's binding, that backend's calls go through
// binding.fetch() with the SAME full URL; otherwise the previous
// global-fetch behaviour stands, and the injected fetcher keeps
// winning outright (the test seam stays as it is).

afterEach(() => {
  vi.unstubAllGlobals()
})

/** Global fetch that fails loudly: integration tests below must never reach it. */
function forbidGlobalFetch(): void {
  vi.stubGlobal(
    'fetch',
    (() => {
      throw new Error('test bug: request escaped to global fetch')
    }) as typeof fetch,
  )
}

function bindingStub(handler: (url: string, init?: RequestInit) => Response): {
  binding: Fetcher
  seen: Array<{ url: string; init?: RequestInit }>
} {
  const seen: Array<{ url: string; init?: RequestInit }> = []
  const fetchImpl = (async (input: string | URL | Request, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url
    seen.push({ url, init })
    return handler(url, init)
  }) as typeof fetch
  return { binding: { fetch: fetchImpl }, seen }
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('backendFetcher', () => {
  it('returns the fallback untouched when the env has no binding', () => {
    const fallback = (async () => new Response('x')) as typeof fetch
    expect(backendFetcher({}, 'PLAY_API_URL', fallback)).toBe(fallback)
    // A binding for a DIFFERENT backend does not route this one.
    const { binding } = bindingStub(() => json({}))
    expect(backendFetcher({ VOLUNTEER_API: binding }, 'PLAY_API_URL', fallback)).toBe(fallback)
  })

  it('dispatches through binding.fetch with the same URL and init', async () => {
    const { binding, seen } = bindingStub(() => json({ ok: true }))
    const routed = backendFetcher({ PLAY_API: binding }, 'PLAY_API_URL')
    const res = await routed('https://hues-play-api.dustin-boling.workers.dev/public-state', {
      headers: { 'X-Session': 's' },
    })
    expect(res.status).toBe(200)
    expect(seen).toHaveLength(1)
    expect(seen[0]?.url).toBe('https://hues-play-api.dustin-boling.workers.dev/public-state')
    expect(new Headers(seen[0]?.init?.headers).get('X-Session')).toBe('s')
  })
})

describe('proxy service-binding dispatch', () => {
  it('serves volunteer public-state through VOLUNTEER_API with the same full URL', async () => {
    forbidGlobalFetch()
    const { binding, seen } = bindingStub((url) =>
      url.endsWith('/public-state') ? json({ tasks: ['t1'] }) : json({ error: 'no route' }, 500),
    )
    const app = createApp({ env: { VOLUNTEER_API: binding } })
    const res = await app.request('https://hues.flowers/api/volunteer/public-state')
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ tasks: ['t1'] })
    expect(res.headers.get('Cache-Control')).toBe('public, max-age=60, stale-while-revalidate=300')
    expect(seen).toHaveLength(1)
    expect(seen[0]?.url).toBe('https://hues-volunteers-api.dustin-boling.workers.dev/public-state')
  })

  it('routes each backend to its own binding and no other', async () => {
    forbidGlobalFetch()
    const play = bindingStub(() => json({ events: [] }))
    const volunteer = bindingStub(() => json({ tasks: [] }))
    const app = createApp({ env: { PLAY_API: play.binding, VOLUNTEER_API: volunteer.binding } })
    const res = await app.request('https://hues.flowers/api/play/public-state')
    expect(res.status).toBe(200)
    expect(play.seen).toHaveLength(1)
    expect(play.seen[0]?.url).toBe('https://hues-play-api.dustin-boling.workers.dev/public-state')
    expect(volunteer.seen).toHaveLength(0)
  })

  it('sends writes through the binding with method, body, and JSON content type', async () => {
    forbidGlobalFetch()
    const { binding, seen } = bindingStub((url) =>
      url.endsWith('/signup') ? json({ ok: true }) : json({ error: 'no route' }, 500),
    )
    const app = createApp({ env: { VOLUNTEER_API: binding } })
    const body = { taskId: 't', slotId: 's', name: 'Bo', email: 'bo@x.com' }
    const res = await app.request('https://hues.flowers/api/volunteer/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', [CSRF_HEADER]: CSRF_VALUE },
      body: JSON.stringify(body),
    })
    expect(res.status).toBe(200)
    expect(seen).toHaveLength(1)
    expect(seen[0]?.url).toBe('https://hues-volunteers-api.dustin-boling.workers.dev/signup')
    expect(seen[0]?.init?.method).toBe('POST')
    expect(JSON.parse(String(seen[0]?.init?.body))).toEqual(body)
  })

  it('keeps the injected fetcher winning outright when both it and a binding exist', async () => {
    forbidGlobalFetch()
    const { binding, seen: bindingSeen } = bindingStub(() => json({ via: 'binding' }))
    const injectedSeen: string[] = []
    const injected = (async (input: string | URL | Request) => {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url
      injectedSeen.push(url)
      return json({ via: 'injected' })
    }) as typeof fetch
    const app = createApp({ env: { PLAY_API: binding }, fetcher: injected })
    const res = await app.request('https://hues.flowers/api/play/public-state')
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ via: 'injected' })
    expect(injectedSeen).toEqual(['https://hues-play-api.dustin-boling.workers.dev/public-state'])
    expect(bindingSeen).toHaveLength(0)
  })
})
