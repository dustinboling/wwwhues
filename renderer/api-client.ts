// Typed client for the /api proxy: every mutation carries the required
// CSRF header (§2.1(b)), record versions travel as If-Match (§2.1(e)),
// and proxy failures surface as typed errors the forms render with
// entered data intact (429 → designed rate-limit state, 409+current →
// the concurrency conflict pattern, everything else → plain language).

import { VersionConflictError } from '@hues/ui'
import type { VersionedRecord } from '@hues/ui'
import { CSRF_HEADER, CSRF_VALUE } from '../server/csrf'

/** Plain API failure: the proxy's own message, status preserved. */
export class ApiError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

/** 429: slow down. retryAfter seconds when the proxy sent one. */
export class RateLimitError extends ApiError {
  readonly retryAfter: number | null

  constructor(message: string, retryAfter: number | null) {
    super(message, 429)
    this.name = 'RateLimitError'
    this.retryAfter = retryAfter
  }
}

export { VersionConflictError }
export type { VersionedRecord }

function isVersionedRecord(value: unknown): value is VersionedRecord {
  if (typeof value !== 'object' || value === null) return false
  return typeof (value as { version?: unknown }).version === 'number'
}

async function readError(res: Response): Promise<string> {
  try {
    const data = (await res.json()) as { error?: unknown }
    if (typeof data.error === 'string' && data.error !== '') return data.error
  } catch {
    // Fall through to the generic message.
  }
  return 'Something went wrong — please try again.'
}

async function throwForStatus(res: Response): Promise<void> {
  if (res.ok) return
  if (res.status === 429) {
    const raw = res.headers.get('Retry-After')
    const parsed = raw === null ? NaN : Number.parseInt(raw, 10)
    throw new RateLimitError(
      await readError(res),
      Number.isNaN(parsed) ? null : parsed,
    )
  }
  if (res.status === 409) {
    // §2.1(e): a version conflict carries the current record; the
    // caller keeps the operator input and offers re-apply. Other 409s
    // (the account split-pair case) are plain-language errors.
    let current: unknown = null
    try {
      current = ((await res.clone().json()) as { current?: unknown }).current ?? null
    } catch {
      current = null
    }
    if (isVersionedRecord(current)) throw new VersionConflictError(current)
  }
  throw new ApiError(await readError(res), res.status)
}

export interface MutationInit {
  /** Record version the caller rendered (§2.1(e): sent as If-Match). */
  version?: number
  /** Idempotency key for queued/offline replays (Data #2.5). */
  idempotencyKey?: string
  /** Turnstile Managed token for public writes (SecOps #3). */
  turnstileToken?: string | null
  signal?: AbortSignal
}

/** POST JSON against the proxy; throws ApiError/RateLimitError/VersionConflictError. */
export async function postApi<T>(url: string, body: Record<string, unknown>, init: MutationInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    [CSRF_HEADER]: CSRF_VALUE,
  }
  if (init.version !== undefined) headers['If-Match'] = `"${init.version}"`
  if (init.idempotencyKey !== undefined) headers['Idempotency-Key'] = init.idempotencyKey
  const payload =
    init.turnstileToken === undefined || init.turnstileToken === null
      ? body
      : { ...body, turnstileToken: init.turnstileToken }
  let res: Response
  try {
    res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      signal: init.signal,
    })
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') throw error
    throw new ApiError('Can’t reach Hues right now — check your connection and try again.', 0)
  }
  await throwForStatus(res)
  return (await res.json()) as T
}

/** GET JSON against the proxy (reads carry no CSRF header by design). */
export async function getApi<T>(url: string, init: { signal?: AbortSignal } = {}): Promise<T> {
  let res: Response
  try {
    res = await fetch(url, { cache: 'no-store', signal: init.signal })
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') throw error
    throw new ApiError('Can’t reach Hues right now — check your connection and try again.', 0)
  }
  await throwForStatus(res)
  return (await res.json()) as T
}

/** Friendly wait text for a 429 ("a minute", "2 minutes"). */
export function retryWaitLabel(retryAfter: number | null): string {
  if (retryAfter === null) return 'a little while'
  if (retryAfter < 90) return 'about a minute'
  const minutes = Math.round(retryAfter / 60)
  return `${minutes} minutes`
}
