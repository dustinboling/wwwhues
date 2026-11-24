/**
 * Test double for the `virtual:pwa-register/react` module, which only exists
 * inside property builds (vite-plugin-pwa provides it). Wired via the alias
 * in vitest.config.mts. Registration never fires under test: no pending
 * refresh, no offline-ready, and update resolves immediately.
 */
export function useRegisterSW(): {
  needRefresh: [boolean, (value: boolean) => void];
  offlineReady: [boolean, (value: boolean) => void];
  updateServiceWorker: (reloadPage?: boolean) => Promise<void>;
} {
  return {
    needRefresh: [false, () => undefined],
    offlineReady: [false, () => undefined],
    updateServiceWorker: () => Promise.resolve(),
  };
}
