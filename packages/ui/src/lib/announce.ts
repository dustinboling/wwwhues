import { createContext, useCallback, useContext, useRef } from 'react';
import type { RefObject } from 'react';

/**
 * The shell's one polite announcer (A11y #2, #13). Route changes announce
 * "'<Title>' page"; in-place updates announce results; multi-error submits
 * announce "N fields need attention". Writes clear-then-write so repeats
 * fire. Nothing here steals focus.
 */

export type Announce = (message: string) => void;

const AnnounceContext = createContext<Announce | null>(null);

/** Announce through the nearest AppShell live region. */
export function useAnnouncer(): Announce {
  const announce = useContext(AnnounceContext);
  return useCallback(
    (message: string) => {
      announce?.(message);
    },
    [announce],
  );
}

export function useAnnounceProvider(): { context: typeof AnnounceContext; regionRef: RefObject<HTMLDivElement | null>; announce: Announce } {
  const regionRef = useRef<HTMLDivElement | null>(null);
  const announce = useCallback<Announce>((message: string) => {
    const region = regionRef.current;
    if (region === null) return;
    region.textContent = '';
    // A microtask between clear and write so repeated messages re-fire.
    queueMicrotask(() => {
      if (region.isConnected) region.textContent = message;
    });
  }, []);
  return { context: AnnounceContext, regionRef, announce };
}
