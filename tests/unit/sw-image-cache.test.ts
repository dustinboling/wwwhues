import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

// Slice J reload fix, pinned at the source level: the worker only runs in
// worker scope (compiled by vite-plugin-pwa injectManifest), so — like the
// kit's sw-template test in @hues/ui — these assertions read sw/sw.ts and
// pin its policy wiring: the image route serves a 200-only v2 cache, the
// audio route carries the same 200-only gate, and activate evicts the
// poisoned v1 image cache.

const ROOT = new URL('../..', import.meta.url)
const source = readFileSync(new URL('sw/sw.ts', ROOT), 'utf8')

/** Strategy block registered for a route class. */
function routeBlock(routeClass: 'media-image' | 'media-audio'): string {
  const marker = `=== '${routeClass}'`
  const start = source.indexOf(marker)
  if (start === -1) throw new Error(`route class ${routeClass} not registered`)
  const end = source.indexOf('registerRoute(', start + marker.length)
  return source.slice(start, end === -1 ? undefined : end)
}

describe('service worker media caching (Slice J)', () => {
  it('serves images stale-while-revalidate from a 200-only v2 cache', () => {
    const block = routeBlock('media-image')
    expect(block).toContain('new StaleWhileRevalidate({')
    expect(block).toContain("cacheName: 'hues-images-v2'")
    expect(block).toContain('new CacheableResponsePlugin({ statuses: [200] })')
  })

  it('keeps audio cache-first with the same 200-only gate', () => {
    const block = routeBlock('media-audio')
    expect(block).toContain('new CacheFirst({')
    expect(block).toContain("cacheName: 'hues-audio'")
    expect(block).toContain('new CacheableResponsePlugin({ statuses: [200] })')
    expect(block).toContain('new RangeRequestsPlugin()')
  })

  it('evicts the poisoned legacy image cache on activate', () => {
    expect(source).toContain("addEventListener('activate'")
    expect(source).toContain("caches.delete('hues-images')")
    expect(source).not.toContain("cacheName: 'hues-images'")
  })
})
