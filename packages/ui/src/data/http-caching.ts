/**
 * Response-caching helpers (Data #2.2, Perf #5): the seeds lib/api/http.ts
 * pattern (envelope, ETag/304, cache headers) ported to the shared package.
 * Additive headers on the unchanged Workers: no endpoint changes.
 */

export type ApiClass = 'public' | 'per-user' | 'mutation';

export interface PublicCacheOptions {
  /** Freshness contract for request-time regions (default 60s, Perf #5). */
  maxAge?: number;
  /** Stale-while-revalidate window (default 300s, Perf #5). */
  staleWhileRevalidate?: number;
}

/** Cache-Control value per API class. */
export function cacheControlFor(apiClass: ApiClass, options: PublicCacheOptions = {}): string {
  if (apiClass === 'mutation') return 'no-store';
  if (apiClass === 'per-user') return 'private, no-cache';
  const maxAge = options.maxAge ?? 60;
  const swr = options.staleWhileRevalidate ?? 300;
  return `public, max-age=${maxAge}, stale-while-revalidate=${swr}`;
}

/** Weak ETag for a response body (SubtleCrypto: Workers, browsers, Node 22). */
export async function etagFor(body: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(body));
  const bytes = [...new Uint8Array(digest)].slice(0, 16);
  return `W/"${bytes.map((byte) => byte.toString(16).padStart(2, '0')).join('')}"`;
}

/** True when the request ETags match (304 territory). */
export function etagMatches(request: Request, etag: string): boolean {
  const sent = request.headers.get('if-none-match');
  if (sent === null) return false;
  return sent.split(',').map((tag) => tag.trim()).includes(etag) || sent.trim() === '*';
}

/** 304 response carrying the ETag back. */
export function notModified(etag: string): Response {
  return new Response(null, { status: 304, headers: { ETag: etag } });
}

/**
 * Wrap a JSON GET handler with ETag/304 + Cache-Control. Mutations and
 * per-user reads still get their ETag; only the header differs by class.
 */
export async function withResponseCaching(
  request: Request,
  apiClass: ApiClass,
  produce: () => Promise<unknown>,
  options: PublicCacheOptions = {},
): Promise<Response> {
  const body = JSON.stringify(await produce());
  const etag = await etagFor(body);
  if (etagMatches(request, etag)) return notModified(etag);
  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      ETag: etag,
      'Cache-Control': cacheControlFor(apiClass, options),
    },
  });
}
