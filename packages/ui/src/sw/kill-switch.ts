/**
 * Legacy cutover utilities (plan §1b, Perf #6): installed Print Edition PWA
 * users strand on the stale worker after the /m URLs become 301s unless
 * the cutover deregisters it. Each property's cutover checklist carries
 * "legacy service workers deregistered".
 */

/** Kill-switch worker source, served once at the old /m scope. */
export const LEGACY_KILL_SWITCH_SOURCE = `// Hues legacy kill-switch worker: unregisters itself and clears old caches.
self.addEventListener('install', () => {
  self.skipWaiting();
});
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(names.map((name) => caches.delete(name)));
      await self.registration.unregister();
    })(),
  );
});
`;

/**
 * Client-side sweep: unregister workers whose scope falls under legacy
 * prefixes (default: the old /m scope). Run once at cutover.
 */
export async function deregisterLegacyWorkers(legacyPrefixes: string[] = ['/m']): Promise<string[]> {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return [];
  const registrations = await navigator.serviceWorker.getRegistrations();
  const removed: string[] = [];
  for (const registration of registrations) {
    const scope = new URL(registration.scope).pathname;
    if (legacyPrefixes.some((prefix) => scope === prefix || scope.startsWith(prefix.endsWith('/') ? prefix : `${prefix}/`))) {
      if (await registration.unregister()) removed.push(registration.scope);
    }
  }
  return removed;
}

/**
 * Sign-out purge (SecOps #13): sign-out purges the app's caches so no
 * personal data survives for the next holder of a shared device. Quinn's
 * gate: sign in, view account, sign out, reload offline — nothing renders.
 */
export async function purgeServiceWorkerCaches(): Promise<void> {
  if (typeof caches === 'undefined') return;
  const names = await caches.keys();
  await Promise.all(names.map((name) => caches.delete(name)));
}
