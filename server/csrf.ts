// CSRF posture for the /api proxy (architecture-plan §2.1(b), SecOps #2).
//
// Layer 1 (required): every state-changing request must carry the
// custom header `X-Hues-CSRF: 1`, validated server-side. Cross-site
// forms and plain <form> posts cannot set custom headers, so a forged
// request fails closed with 403. No state change on GET, ever.
// Layer 2 (defense in depth): Origin / Sec-Fetch-Site verification.
// When the browser sends Origin it must match an allowed origin
// (same host or a known Hues host); when it sends Sec-Fetch-Site it
// must be same-origin/same-site. Requests with neither header (curl,
// health checks, older clients) pass this layer — layer 1 still
// applies to every write.

import { HUES_CSRF_HEADER, HUES_CSRF_VALUE } from '@hues/ui'

// Single source in the kit (shared with the fetch layer + queue replay).
export const CSRF_HEADER = HUES_CSRF_HEADER

export const CSRF_VALUE = HUES_CSRF_VALUE

const KNOWN_HOSTS = new Set([
  'hues.flowers',
  'www.hues.flowers',
  'huesflowers.com',
  'www.huesflowers.com',
  'staging.hues.flowers',
])

function isLocalHost(hostname: string): boolean {
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]'
}

export function isAllowedOrigin(origin: string, requestHost: string): boolean {
  let url: URL
  try {
    url = new URL(origin)
  } catch {
    return false
  }
  if (url.protocol !== 'https:' && !isLocalHost(url.hostname)) return false
  if (url.host === requestHost) return true
  if (KNOWN_HOSTS.has(url.hostname)) return true
  if (isLocalHost(url.hostname) && isLocalHost(requestHost.split(':')[0] ?? '')) return true
  return false
}

export interface CsrfCheck {
  ok: boolean
  /** Machine-readable reason for the 403 body (never echoed raw). */
  reason: 'missing-header' | 'bad-origin' | 'bad-fetch-site' | null
}

/**
 * Validate a state-changing request. Safe methods (GET/HEAD/OPTIONS)
 * never mutate, so they skip the custom-header requirement — but the
 * second layer still screens them for consistency.
 */
export function checkCsrf(request: Request): CsrfCheck {
  const method = request.method.toUpperCase()
  const mutating = method !== 'GET' && method !== 'HEAD' && method !== 'OPTIONS'

  if (mutating && request.headers.get(CSRF_HEADER) !== CSRF_VALUE) {
    return { ok: false, reason: 'missing-header' }
  }

  const requestHost = new URL(request.url).host
  const origin = request.headers.get('Origin')
  if (origin !== null && !isAllowedOrigin(origin, requestHost)) {
    return { ok: false, reason: 'bad-origin' }
  }

  const site = request.headers.get('Sec-Fetch-Site')
  if (site !== null) {
    const normalized = site.toLowerCase()
    if (normalized !== 'same-origin' && normalized !== 'same-site' && normalized !== 'none') {
      return { ok: false, reason: 'bad-fetch-site' }
    }
  }

  return { ok: true, reason: null }
}
