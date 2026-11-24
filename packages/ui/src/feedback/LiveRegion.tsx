import type { JSX, RefObject } from 'react';

/** The shell's one polite announcer. Invisible; AppShell owns it. */
export function LiveRegion({ regionRef }: { regionRef: RefObject<HTMLDivElement | null> }): JSX.Element {
  return <div ref={regionRef} role="status" aria-live="polite" aria-atomic="true" className="hues-visually-hidden" />;
}
