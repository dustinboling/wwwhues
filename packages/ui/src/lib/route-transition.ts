import { useCallback } from 'react';
import { useAnnouncer } from './announce';
import { focusRouteTarget } from './focus';
import { notifyRouteChange } from './scroll';

/**
 * Route-transition wiring (A11y #1, #2): on every client-side route change
 * the router sets document.title from the route metadata, moves focus to the
 * route h1 (fallback: main), and announces "'<Title>' page" through the
 * shell live region. Route changes are page views; in-place updates keep
 * the results-only rule. No View Transitions in v1: swaps are instant.
 */
export function useRouteTransition(): (title: string, options?: { tabSwitch?: boolean }) => void {
  const announce = useAnnouncer();
  return useCallback(
    (title: string, options: { tabSwitch?: boolean } = {}) => {
      document.title = title;
      notifyRouteChange({ tabSwitch: options.tabSwitch });
      // Focus after the new view renders; callers invoke post-commit.
      focusRouteTarget(document);
      announce(`${title} page`);
    },
    [announce],
  );
}
