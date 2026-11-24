import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  HUES_DEFAULT_OPTIONS,
  STALE_TIME,
  createHuesQueryClient,
  mutationOptionsFor,
  queryOptionsFor,
} from '../src/data/query-preset';
import { cacheControlFor, etagFor, etagMatches, notModified, withResponseCaching } from '../src/data/http-caching';
import { VersionConflictError, mutateVersioned, rowActionAllowed } from '../src/data/concurrency';
import {
  PROHIBITED_JSONLD_KEYS,
  PROHIBITED_JSONLD_TYPES,
  ProhibitedJsonLdError,
  assertNoProhibitedJsonLd,
} from '../src/data/jsonld-guard';
import { applySecurityHeaders, buildSecurityHeaders, contentSecurityPolicy, renderHeadersFile } from '../src/security/headers';
import { captureError, configureErrorReporter, scrubExtra, toErrorReport } from '../src/security/error-reporter';
import { DENIED_PATH_PREFIXES, carriesSession, classifyRequest } from '../src/sw/sw-policy';
import type { HuesWorkerConfig } from '../src/sw/sw-policy';
import { LEGACY_KILL_SWITCH_SOURCE, deregisterLegacyWorkers, purgeServiceWorkerCaches } from '../src/sw/kill-switch';

describe('query preset', () => {
  it('carries the written defaults and per-class stale windows', () => {
    expect(STALE_TIME).toMatchObject({ account: 30_000, session: 30_000, public: 300_000, catalog: 300_000 });
    expect(HUES_DEFAULT_OPTIONS.queries?.refetchOnWindowFocus).toBe(true);
    expect(HUES_DEFAULT_OPTIONS.queries?.refetchOnReconnect).toBe(true);
    expect(HUES_DEFAULT_OPTIONS.queries?.refetchOnMount).toBe(true);
    expect(HUES_DEFAULT_OPTIONS.queries?.retry).toBe(3);
    expect(HUES_DEFAULT_OPTIONS.mutations?.retry).toBe(0);
    expect(queryOptionsFor('account').staleTime).toBe(30_000);
    expect(queryOptionsFor('catalog').staleTime).toBe(300_000);
    const client = createHuesQueryClient();
    const invalidate = vi.spyOn(client, 'invalidateQueries').mockResolvedValue([]);
    const options = mutationOptionsFor(client, { invalidates: [[ 'account' ], ['board', 'signups']] });
    (options.onSuccess as () => void)();
    expect(invalidate).toHaveBeenCalledTimes(2);
  });
});

describe('response caching', () => {
  it('emits the per-class cache contract', () => {
    expect(cacheControlFor('public')).toBe('public, max-age=60, stale-while-revalidate=300');
    expect(cacheControlFor('per-user')).toBe('private, no-cache');
    expect(cacheControlFor('mutation')).toBe('no-store');
  });

  it('serves 304s on ETag match, 200s with headers otherwise', async () => {
    const etag = await etagFor('{"a":1}');
    expect(etag.startsWith('W/"')).toBe(true);
    const fresh = new Request('https://api.test/v1/state');
    const cached = new Request('https://api.test/v1/state', { headers: { 'If-None-Match': etag } });
    expect(etagMatches(cached, etag)).toBe(true);
    expect(etagMatches(fresh, etag)).toBe(false);
    expect(notModified(etag).status).toBe(304);
    const miss = await withResponseCaching(fresh, 'public', () => Promise.resolve({ a: 1 }));
    expect(miss.status).toBe(200);
    expect(miss.headers.get('Cache-Control')).toBe('public, max-age=60, stale-while-revalidate=300');
    const hit = await withResponseCaching(cached, 'public', () => Promise.resolve({ a: 1 }));
    expect(hit.status).toBe(304);
  });
});

describe('optimistic concurrency', () => {
  it('sends the version precondition and surfaces 409s with the current record', async () => {
    const seen: Record<string, string> = {};
    const result = await mutateVersioned(
      { version: 3, name: 'Ada' },
      (headers) => {
        Object.assign(seen, headers);
        return Promise.resolve(new Response(JSON.stringify({ ok: true }), { status: 200 }));
      },
      (response) => response.json() as Promise<{ ok: boolean }>,
    );
    expect(result).toEqual({ ok: true });
    expect(seen['If-Match']).toBe('"3"');
    await expect(
      mutateVersioned(
        { version: 3 },
        () => Promise.resolve(new Response(JSON.stringify({ current: { version: 4, name: 'Bea' } }), { status: 409 })),
        (response) => response.json(),
      ),
    ).rejects.toBeInstanceOf(VersionConflictError);
    expect(rowActionAllowed(3, 3)).toBe(true);
    expect(rowActionAllowed(3, 4)).toBe(false);
  });
});

describe('JSON-LD guard', () => {
  it('prohibits priced commerce types and price keys, deeply', () => {
    expect(PROHIBITED_JSONLD_TYPES).toContain('Product');
    expect(PROHIBITED_JSONLD_KEYS).toContain('price');
    assertNoProhibitedJsonLd({ '@type': 'ItemList', itemListElement: [] });
    expect(() => assertNoProhibitedJsonLd({ '@type': 'Product', name: 'Dahlia' })).toThrow(ProhibitedJsonLdError);
    expect(() => assertNoProhibitedJsonLd({ offers: { price: '4.00' } })).toThrow(/prohibited key price/);
    expect(() => assertNoProhibitedJsonLd({ '@type': 'Event', offers: { '@type': 'Offer' } }, { types: [] })).toThrow(
      ProhibitedJsonLdError,
    );
  });
});

describe('security headers', () => {
  it('builds the strict OWASP set with explicit allowlists', () => {
    const csp = contentSecurityPolicy({ mediaDomain: 'https://media.example.test', allowTurnstile: true });
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain('frame-ancestors \'none\'');
    expect(csp).toContain('https://media.example.test');
    expect(csp).toContain('https://challenges.cloudflare.com');
    expect(csp).not.toContain('unsafe-inline');
    const headers = buildSecurityHeaders({});
    expect(headers['Strict-Transport-Security']).toBe('max-age=31536000');
    expect(headers['X-Content-Type-Options']).toBe('nosniff');
    expect(headers['X-Frame-Options']).toBe('DENY');
    expect(renderHeadersFile({}).startsWith('/*\n')).toBe(true);
    const response = applySecurityHeaders(new Response('x'));
    expect(response.headers.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin');
  });
});

describe('error reporter', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('scrubs personal data and never throws', () => {
    expect(scrubExtra({ email: 'a@b.com', count: 3, note: 'call 555-0100' })).toEqual({
      email: '[redacted]',
      count: '3',
      note: 'call [redacted]',
    });
    const report = toErrorReport(new Error('signup failed for a@b.com'), { mobile: '555-0100' });
    expect(report.message).not.toContain('a@b.com');
    expect(report.extra).toEqual({ mobile: '[redacted]' });
    const beacon = vi.fn().mockReturnValue(true);
    vi.stubGlobal('navigator', { sendBeacon: beacon });
    configureErrorReporter('https://errors.example.test/intake');
    captureError(new Error('boom'));
    expect(beacon).toHaveBeenCalledTimes(1);
    configureErrorReporter('');
  });
});

describe('service-worker policy', () => {
  const config: HuesWorkerConfig = {
    publicApiPrefixes: ['/api/v1/public-state'],
    mediaHosts: ['media.example.test'],
    imageCacheEntries: 120,
    offlinePage: '/offline',
  };

  it('classifies route classes with deny-by-default for APIs', () => {
    expect(classifyRequest({ url: 'https://h.test/visit', mode: 'navigate' }, config)).toBe('navigation');
    expect(classifyRequest({ url: 'https://h.test/assets/app.js' }, config)).toBe('static-asset');
    expect(classifyRequest({ url: 'https://media.example.test/p/a.jpg' }, config)).toBe('media-image');
    expect(classifyRequest({ url: 'https://media.example.test/t/a.mp3' }, config)).toBe('media-audio');
    expect(classifyRequest({ url: 'https://h.test/api/v1/public-state' }, config)).toBe('public-api');
    expect(classifyRequest({ url: 'https://h.test/api/v1/me' }, config)).toBe('denied');
    expect(DENIED_PATH_PREFIXES).toContain('/account');
    for (const path of ['/account', '/volunteer/admin', '/arcade/admin', '/play/admin']) {
      expect(classifyRequest({ url: `https://h.test${path}/x` }, config)).toBe('denied');
    }
    expect(carriesSession({ credentials: 'include' })).toBe(true);
    expect(carriesSession({})).toBe(false);
  });
});

describe('legacy cutover', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('kill-switch source unregisters and clears caches', () => {
    expect(LEGACY_KILL_SWITCH_SOURCE).toContain('registration.unregister()');
    expect(LEGACY_KILL_SWITCH_SOURCE).toContain('caches.delete');
  });

  it('deregisters legacy scopes and purges caches on sign-out', async () => {
    const unregister = vi.fn().mockResolvedValue(true);
    vi.stubGlobal('navigator', {
      serviceWorker: {
        getRegistrations: () => Promise.resolve([{ scope: 'https://h.test/m/', unregister }]),
      },
    });
    await expect(deregisterLegacyWorkers()).resolves.toEqual(['https://h.test/m/']);
    expect(unregister).toHaveBeenCalledTimes(1);
    const deleted: string[] = [];
    vi.stubGlobal('caches', {
      keys: () => Promise.resolve(['hues-pages']),
      delete: (name: string) => {
        deleted.push(name);
        return Promise.resolve(true);
      },
    });
    await purgeServiceWorkerCaches();
    expect(deleted).toEqual(['hues-pages']);
  });
});
