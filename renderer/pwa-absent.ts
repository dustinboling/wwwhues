// Absence double for virtual:pwa-register/react (mirrors the kit's own
// test double): vite-plugin-pwa is a later slice, so no virtual module
// exists in this build. Registration never fires: no pending refresh, no
// offline-ready, update resolves immediately. The PWA slice deletes this
// file and its vite.config.mts alias when the real plugin lands.
export function useRegisterSW(): {
  needRefresh: [boolean, (value: boolean) => void]
  offlineReady: [boolean, (value: boolean) => void]
  updateServiceWorker: (reloadPage?: boolean) => Promise<void>
} {
  return {
    needRefresh: [false, () => undefined],
    offlineReady: [false, () => undefined],
    updateServiceWorker: () => Promise.resolve(),
  }
}
