// Per-endpoint per-IP rate limits for the /api proxy
// (architecture-plan §2.1(d), SecOps #3).
//
// Thresholds are this build's choice where §2.1 leaves them open:
//   - public writes (signup/signin, volunteer signup, sponsor, rsvp,
//     interests): 20 requests / 10 minutes / IP — generous for humans
//     behind NAT, tight enough to blunt stuffing scripts.
//   - account signin: 10 / 10 min (credential probing costs more).
//   - admin setup/login: 5 / 15 min — rate-limited hardest per §2.1(d).
//   - authed admin actions + account reads: 60 / 10 min.
//   - public-state GETs: 300 / 10 min (page revalidation traffic).
//
// Enforcement is best-effort per isolate (an in-memory table; a new
// isolate starts empty). That is the documented limit of worker-local
// limiting — Cloudflare's edge absorbs floods before they arrive, and
// this layer stops casual scripts and runaway clients. Breaches return
// 429 + Retry-After with the designed JSON error body; the client
// renders the designed error state with entered data intact.

export interface RateLimit {
  /** Requests allowed per window. */
  limit: number
  /** Window length in seconds. */
  windowSeconds: number
}

export const RATE_LIMITS: Record<string, RateLimit> = {
  'account-signin': { limit: 10, windowSeconds: 600 },
  'account-public': { limit: 20, windowSeconds: 600 },
  'account-authed': { limit: 60, windowSeconds: 600 },
  'public-write': { limit: 20, windowSeconds: 600 },
  'admin-auth': { limit: 5, windowSeconds: 900 },
  'admin-authed': { limit: 60, windowSeconds: 600 },
  'public-state': { limit: 300, windowSeconds: 600 },
}

export const RATE_LIMIT_MESSAGE =
  'Too many attempts — please wait a little and try again.'

interface Bucket {
  count: number
  resetAt: number
}

/** Injectable clock so tests control time. */
export type Clock = () => number

export function createRateLimiter(clock: Clock = Date.now): {
  check: (key: string, rule: RateLimit) => { allowed: boolean; retryAfter: number }
  reset: () => void
} {
  const buckets = new Map<string, Bucket>()
  return {
    check(key: string, rule: RateLimit): { allowed: boolean; retryAfter: number } {
      const now = clock()
      const bucket = buckets.get(key)
      if (bucket === undefined || now >= bucket.resetAt) {
        buckets.set(key, { count: 1, resetAt: now + rule.windowSeconds * 1000 })
        return { allowed: true, retryAfter: 0 }
      }
      if (bucket.count < rule.limit) {
        bucket.count += 1
        return { allowed: true, retryAfter: 0 }
      }
      return {
        allowed: false,
        retryAfter: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
      }
    },
    reset(): void {
      buckets.clear()
    },
  }
}

export type RateLimiter = ReturnType<typeof createRateLimiter>

/** Client IP: the edge's connecting-IP header, else first forwarded hop. */
export function clientIp(request: Request): string {
  const direct = request.headers.get('CF-Connecting-IP')
  if (direct !== null && direct !== '') return direct
  const forwarded = request.headers.get('X-Forwarded-For')
  if (forwarded !== null && forwarded !== '') {
    return forwarded.split(',')[0]?.trim() ?? 'unknown'
  }
  return 'unknown'
}
