import { useEffect, useRef } from 'react';

/**
 * Overlay history semantics (A11y #6): opening a Sheet or Dialog pushes
 * exactly one history entry. Back (popstate) closes the overlay and consumes
 * that entry without navigating the route; Escape and backdrop dismissal pop
 * the same entry; other closes (route change, submit success) remove it
 * silently.
 *
 * Ordering rule for apps: close overlays before client-side navigation, so
 * the silent removal lands on the current page instead of stepping back
 * through the new entry.
 */
export function useOverlayHistory(open: boolean, onClose: () => void): void {
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  const pushedRef = useRef(false);

  useEffect(() => {
    if (!open) {
      if (pushedRef.current) {
        pushedRef.current = false;
        // Silent removal: already closed by another path; drop our entry.
        window.history.back();
      }
      return;
    }
    pushedRef.current = true;
    window.history.pushState({ huesOverlay: true }, '');
    const onPopState = (): void => {
      pushedRef.current = false;
      closeRef.current();
    };
    window.addEventListener('popstate', onPopState);
    return () => {
      window.removeEventListener('popstate', onPopState);
    };
  }, [open ]);

  // Escape and backdrop dismissal route through this same close: callers
  // invoke onClose, and the effect above removes the entry silently.
}
