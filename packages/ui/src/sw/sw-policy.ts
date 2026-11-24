/**
 * Service-worker route-class policy table (plan §1b, Perf #6, SecOps #13):
 * the template implements the policy; it does not choose one. Pure matcher
 * module so the policy is unit-testable in Node; sw-template.ts wires it to
 * Workbox. Per-property route lists plug in through HuesWorkerConfig.
 */

export type RouteClass =
  | 'navigation'
  | 'static-asset'
  | 'media-image'
  | 'media-audio'
  | 'public-api'
  | 'denied';

/** Negative rule (SecOps #13, no exceptions): never cached. */
export const DENIED_PATH_PREFIXES: ReadonlyArray<string> = [
  '/account',
  '/volunteer/admin',
  '/arcade/admin',
  '/play/admin',
];

export interface HuesWorkerConfig {
  /** Paths that are always network-only, beyond the denied prefixes. */
  extraDeniedPrefixes?: string[];
  /** Public, unauthenticated API GET paths allowed NetworkFirst (default-deny otherwise). */
  publicApiPrefixes?: string[];
  /** Media domain host for image/audio classification. */
  mediaHosts?: string[];
  /** Runtime image cache entry budget, sized per property under 50 MB. */
  imageCacheEntries: number;
  /** Offline page URL for navigation fallback. */
  offlinePage: string;
}

/** Classify a same-worker request. Denied wins over every other class. */
export function classifyRequest(request: { url: string; mode?: string }, config: HuesWorkerConfig): RouteClass {
  const url = new URL(request.url);
  const denied = [...DENIED_PATH_PREFIXES, ...(config.extraDeniedPrefixes ?? [])];
  if (denied.some((prefix) => url.pathname === prefix || url.pathname.startsWith(prefix.endsWith('/') ? prefix : `${prefix}/`))) {
    return 'denied';
  }
  if (url.pathname === '/api' || url.pathname.startsWith('/api/')) {
    const allowed = config.publicApiPrefixes ?? [];
    const isPublic = allowed.some((prefix) => url.pathname === prefix || url.pathname.startsWith(prefix.endsWith('/') ? prefix : `${prefix}/`));
    return isPublic ? 'public-api' : 'denied';
  }
  const mediaHosts = config.mediaHosts ?? [];
  if (mediaHosts.includes(url.hostname)) {
    if (/\.(mp3|m4a|ogg|wav|opus|weba)$/i.test(url.pathname)) return 'media-audio';
    return 'media-image';
  }
  if (request.mode === 'navigate') return 'navigation';
  if (/\.(js|css|woff2?)$/i.test(url.pathname)) return 'static-asset';
  if (/\.(png|jpe?g|gif|webp|avif|svg|ico)$/i.test(url.pathname)) return 'media-image';
  if (/\.(mp3|m4a|ogg|wav|opus|weba)$/i.test(url.pathname)) return 'media-audio';
  return 'navigation';
}

/** Session-carrying requests are never cacheable (route deny list + credentials heuristic). */
export function carriesSession(request: { credentials?: string }): boolean {
  return request.credentials === 'include';
}
