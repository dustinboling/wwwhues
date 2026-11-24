/**
 * Route scroll contract (A11y #7): forward navigation to a new route starts
 * at the top instantly; Back/Forward restores the recorded position; tab
 * preservation outranks both; filter and query changes never move scroll.
 *
 * Apps call initRouteScroll once at bootstrap and notifyRouteChange on every
 * client-side navigation (after render). Positions record per history entry
 * automatically.
 */

interface ScrollState {
  positions: Map<string, number>;
  currentKey: string;
  tabActive: boolean;
}

function entryKey(): string {
  return `${window.history.state?.huesScroll ?? window.history.length}:${window.location.pathname}${window.location.search}`;
}

const state: ScrollState = { positions: new Map(), currentKey: '', tabActive: false };

function recordCurrent(): void {
  state.positions.set(state.currentKey, window.scrollY);
}

/** Call once at app bootstrap. Returns a teardown function. */
export function initRouteScroll(): () => void {
  if (typeof window === 'undefined') return () => {};
  if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual';
  state.currentKey = entryKey();
  const onPopState = (): void => {
    const next = entryKey();
    // Same-path query changes (filters, pagination) never move scroll.
    const samePath =
      state.currentKey.split(':').slice(1).join(':').split('?')[0] ===
      next.split(':').slice(1).join(':').split('?')[0];
    state.currentKey = next;
    if (state.tabActive || samePath) return;
    const y = state.positions.get(next) ?? 0;
    window.scrollTo({ top: y, behavior: 'instant' as ScrollBehavior });
  };
  const onScroll = (): void => {
    recordCurrent();
  };
  window.addEventListener('popstate', onPopState);
  window.addEventListener('scroll', onScroll, { passive: true });
  return () => {
    window.removeEventListener('popstate', onPopState);
    window.removeEventListener('scroll', onScroll);
  };
}

/**
 * Notify the manager of a client-side navigation. Tab switches pass
 * tabSwitch: true so preservation outranks the top jump.
 */
export function notifyRouteChange(options: { tabSwitch?: boolean | undefined } = {}): void {
  recordCurrent();
  state.currentKey = entryKey();
  state.tabActive = options.tabSwitch === true;
  if (!state.tabActive) window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
}
