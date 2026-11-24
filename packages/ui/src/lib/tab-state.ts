import { useEffect, useState } from 'react';

/**
 * Tab-state preservation store (Mina §4.4): each tab keeps scroll position,
 * filters, half-finished form input, and accordion state. Switching back
 * renders the preserved state instantly, exactly as left: no skeleton, no
 * fade, no scroll jump, no replay. Reveal animations fire once per mount,
 * never on a tab return.
 */

export interface TabSnapshot {
  scrollY: number;
  revealed: boolean;
  data: Record<string, unknown>;
}

const snapshots = new Map<string, TabSnapshot>();

function snapshotFor(tab: string): TabSnapshot {
  const existing = snapshots.get(tab);
  if (existing !== undefined) return existing;
  const fresh: TabSnapshot = { scrollY: 0, revealed: false, data: {} };
  snapshots.set(tab, fresh);
  return fresh;
}

/** Read a tab snapshot without subscribing (for instant synchronous render). */
export function readTabSnapshot(tab: string): TabSnapshot {
  const snapshot = snapshotFor(tab);
  return { scrollY: snapshot.scrollY, revealed: snapshot.revealed, data: { ...snapshot.data } };
}

/**
 * Bind a tab root to its snapshot: records scroll on unmount-or-switch and
 * restores it on mount. Returns [snapshot, patch] where patch merges data.
 */
export function useTabState(tab: string): [TabSnapshot, (patch: Record<string, unknown>) => void] {
  const [snapshot, setSnapshot] = useState<TabSnapshot>(() => readTabSnapshot(tab));
  useEffect(() => {
    const current = snapshotFor(tab);
    setSnapshot({ scrollY: current.scrollY, revealed: current.revealed, data: { ...current.data } });
    window.scrollTo({ top: current.scrollY, behavior: 'instant' as ScrollBehavior });
    return () => {
      current.scrollY = window.scrollY;
    };
  }, [tab ]);
  const patch = (update: Record<string, unknown>): void => {
    const current = snapshotFor(tab);
    current.data = { ...current.data, ...update };
    setSnapshot({ scrollY: current.scrollY, revealed: current.revealed, data: { ...current.data } });
  };
  return [snapshot, patch];
}

/** Mark a tab revealed so mount animations never replay on return. */
export function markTabRevealed(tab: string): void {
  snapshotFor(tab).revealed = true;
}
