import { describe, expect, it } from 'vitest'
import {
  backendBase,
  forwardedPreconditions,
  splitSetCookie,
} from '../../server/backends'
import { checkCsrf, isAllowedOrigin } from '../../server/csrf'
import {
  accountSessionCookie,
  adminSessionCookie,
  expireAccountCookie,
  expireAdminCookie,
  expireGameVoterCookie,
  expireHostAccountCookie,
  readCookie,
} from '../../server/cookies'
import { clientIp, createRateLimiter } from '../../server/rate-limit'
import { verifyTurnstile } from '../../server/turnstile'

// Guard-unit coverage: cookies, CSRF, rate limits, Turnstile, backends.

function request(url: string, init?: RequestInit): Request {
  return new Request(url, init)
}

describe('cookies', () => {
  it('builds the documented inventory', () => {
    expect(accountSessionCookie('t')).toBe(
      'hues_account=t; Path=/; Domain=.hues.flowers; Max-Age=7776000; HttpOnly; Secure; SameSite=Lax',
    )
    expect(expireHostAccountCookie()).toBe(
      'hues_account=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax',
    )
    expect(expireAccountCookie()).toContain('Domain=.hues.flowers; Max-Age=0')
    expect(expireGameVoterCookie()).toBe(
      'tot_voter=; Path=/; Domain=.hues.flowers; Max-Age=0; HttpOnly; Secure; SameSite=Lax',
    )
    expect(adminSessionCookie('vol_admin', 't')).toBe(
      'vol_admin=t; Path=/; Max-Age=2592000; HttpOnly; Secure; SameSite=Lax',
    )
    expect(expireAdminCookie('play_admin')).toBe(
      'play_admin=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax',
    )
  })

  it('reads exact cookie names only', () => {
    expect(readCookie('a=1; hues_account=tok; b=2', 'hues_account')).toBe('tok')
    expect(readCookie('hues_account_other=x', 'hues_account')).toBe(null)
    expect(readCookie('hues_account=', 'hues_account')).toBe(null)
    expect(readCookie(null, 'hues_account')).toBe(null)
  })
})

describe('csrf', () => {
  const post = (headers: Record<string, string> = {}) =>
    request('https://hues.flowers/api/x', { method: 'POST', headers })

  it('requires the custom header on writes, never on safe methods', () => {
    expect(checkCsrf(post()).ok).toBe(false)
    expect(checkCsrf(post({ 'X-Hues-CSRF': '1' })).ok).toBe(true)
    expect(checkCsrf(post({ 'X-Hues-CSRF': '2' })).reason).toBe('missing-header')
    expect(checkCsrf(request('https://hues.flowers/api/x')).ok).toBe(true)
  })

  it('screens Origin and Sec-Fetch-Site as the second layer', () => {
    expect(
      checkCsrf(post({ 'X-Hues-CSRF': '1', Origin: 'https://hues.flowers' })).ok,
    ).toBe(true)
    expect(checkCsrf(post({ 'X-Hues-CSRF': '1', Origin: 'https://evil.example' })).reason).toBe(
      'bad-origin',
    )
    expect(
      checkCsrf(post({ 'X-Hues-CSRF': '1', 'Sec-Fetch-Site': 'cross-site' })).reason,
    ).toBe('bad-fetch-site')
    // Preview/staging hosts pass by matching the request host itself.
    expect(
      checkCsrf(
        request('https://preview-1.huesflowers-spa.workers.dev/api/x', {
          method: 'POST',
          headers: {
            'X-Hues-CSRF': '1',
            Origin: 'https://preview-1.huesflowers-spa.workers.dev',
          },
        }),
      ).ok,
    ).toBe(true)
  })

  it('only allows https origins (localhost excepted)', () => {
    expect(isAllowedOrigin('http://hues.flowers', 'hues.flowers')).toBe(false)
    expect(isAllowedOrigin('https://hues.flowers', 'hues.flowers')).toBe(true)
    expect(isAllowedOrigin('http://localhost:8787', 'localhost:8787')).toBe(true)
    expect(isAllowedOrigin('not-a-url', 'hues.flowers')).toBe(false)
  })
})

describe('rate limiter', () => {
  it('admits to the limit, then refuses until the window resets', () => {
    let now = 10_000
    const limiter = createRateLimiter(() => now)
    const rule = { limit: 2, windowSeconds: 60 }
    expect(limiter.check('k', rule).allowed).toBe(true)
    expect(limiter.check('k', rule).allowed).toBe(true)
    const spent = limiter.check('k', rule)
    expect(spent.allowed).toBe(false)
    expect(spent.retryAfter).toBe(60)
    now += 60_000
    expect(limiter.check('k', rule).allowed).toBe(true)
  })

  it('keys callers independently', () => {
    const limiter = createRateLimiter(() => 0)
    const rule = { limit: 1, windowSeconds: 60 }
    expect(limiter.check('a', rule).allowed).toBe(true)
    expect(limiter.check('a', rule).allowed).toBe(false)
    expect(limiter.check('b', rule).allowed).toBe(true)
  })

  it('prefers the edge connecting-IP header', () => {
    expect(
      clientIp(request('https://hues.flowers/', { headers: { 'CF-Connecting-IP': '1.2.3.4' } })),
    ).toBe('1.2.3.4')
    expect(
      clientIp(request('https://hues.flowers/', { headers: { 'X-Forwarded-For': '5.6.7.8, 9.9.9.9' } })),
    ).toBe('5.6.7.8')
    expect(clientIp(request('https://hues.flowers/'))).toBe('unknown')
  })
})

describe('turnstile', () => {
  const siteverify = (success: boolean): typeof fetch =>
    (async () =>
      new Response(JSON.stringify({ success }), {
        headers: { 'Content-Type': 'application/json' },
      })) as typeof fetch

  it('passes unenforced without a secret (dev path)', async () => {
    const verdict = await verifyTurnstile(null, null, '1.2.3.4', siteverify(true))
    expect(verdict).toEqual({ ok: true, unenforced: true })
  })

  it('fails closed on missing tokens and failed verifications', async () => {
    expect((await verifyTurnstile(null, 's', null, siteverify(true))).ok).toBe(false)
    expect((await verifyTurnstile('t', 's', null, siteverify(false))).ok).toBe(false)
    expect((await verifyTurnstile('t', 's', null, siteverify(true))).ok).toBe(true)
  })

  it('fails closed when Siteverify is unreachable', async () => {
    const down = (async () => {
      throw new Error('down')
    }) as typeof fetch
    expect((await verifyTurnstile('t', 's', null, down)).ok).toBe(false)
  })
})

describe('backends', () => {
  it('resolves the live workers.dev origins by default', () => {
    expect(backendBase({}, 'ACCOUNTS_API_URL')).toBe(
      'https://hues-accounts-api.dustin-boling.workers.dev',
    )
    expect(backendBase({}, 'PLAY_API_URL')).toBe('https://hues-play-api.dustin-boling.workers.dev')
    expect(backendBase({}, 'VOLUNTEER_API_URL')).toBe(
      'https://hues-volunteers-api.dustin-boling.workers.dev',
    )
    expect(backendBase({}, 'THISORThat_API_URL')).toBe(
      'https://hues-thisorthat-api.dustin-boling.workers.dev',
    )
    expect(backendBase({ PLAY_API_URL: 'https://staging.example/' }, 'PLAY_API_URL')).toBe(
      'https://staging.example',
    )
  })

  it('forwards preconditions and idempotency keys verbatim', () => {
    const req = request('https://hues.flowers/api/x', {
      headers: { 'If-Match': '"7"', 'Idempotency-Key': 'k-1' },
    })
    expect(forwardedPreconditions(req)).toEqual({ 'If-Match': '"7"', 'Idempotency-Key': 'k-1' })
    expect(forwardedPreconditions(request('https://hues.flowers/api/x'))).toEqual({})
  })

  it('splits backend Set-Cookie values', () => {
    const headers = new Headers()
    headers.append('Set-Cookie', 'a=1')
    headers.append('Set-Cookie', 'b=2')
    expect(splitSetCookie(headers)).toEqual(['a=1', 'b=2'])
    expect(splitSetCookie(new Headers())).toEqual([])
  })
})
