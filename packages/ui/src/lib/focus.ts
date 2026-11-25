import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';

/**
 * Focus management primitives (A11y programmatic layer). Dialog focus traps
 * inside and returns to the invoking control; sheets start on the close
 * control and return to the More tab; route changes focus the route h1.
 */

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), ' +
  'textarea:not([disabled]), [tabindex]:not([tabindex="-1"]), audio[controls], video[controls]';

/** Focusable, visible elements inside a container, in tab order. */
export function focusableIn(container: HTMLElement): HTMLElement[] {
  const nodes = [...container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)];
  return nodes.filter((node) => !node.hasAttribute('disabled') && node.getClientRects().length > 0);
}

/**
 * Move focus to the route target: the route h1 (given tabindex -1), falling
 * back to main. Never body or the router wrapper (A11y #1). Home carries
 * one route h1 per breakpoint (Slice H), so the rendered one wins; the
 * no-layout fallback keeps the first, preserving the single-h1 contract.
 */
export function focusRouteTarget(root: ParentNode = document): HTMLElement | null {
  const headings = [...root.querySelectorAll<HTMLElement>('h1[data-route-title]')];
  const heading =
    headings.find((candidate) => candidate.getClientRects().length > 0) ?? headings[0] ?? null;
  const target = heading ?? root.querySelector<HTMLElement>('main[data-route-main]');
  if (target === null) return null;
  if (target.tabIndex < 0 || target.getAttribute('tabindex') === null) {
    target.setAttribute('tabindex', '-1');
  }
  target.focus({ preventScroll: true });
  return target;
}

/**
 * Trap Tab inside a container while active. Returns a release function.
 * Used by Dialog and FormDialog (Pattern B); sheets keep the lighter
 * start/return contract plus Escape handling.
 */
export function trapFocus(container: HTMLElement): () => void {
  const onKeyDown = (event: KeyboardEvent): void => {
    if (event.key !== 'Tab') return;
    const focusable = focusableIn(container);
    if (focusable.length === 0) {
      event.preventDefault();
      return;
    }
    const first = focusable[0] as HTMLElement;
    const last = focusable[focusable.length - 1] as HTMLElement;
    const active = document.activeElement;
    if (event.shiftKey && (active === first || !container.contains(active))) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  };
  container.addEventListener('keydown', onKeyDown);
  return () => container.removeEventListener('keydown', onKeyDown);
}

/** React binding for trapFocus. */
export function useFocusTrap(active: boolean, ref: RefObject<HTMLElement | null>): void {
  useEffect(() => {
    if (!active || ref.current === null) return;
    return trapFocus(ref.current);
  }, [active, ref]);
}

/**
 * Remember the invoking control while an overlay is open and return focus
 * to it on close.
 */
export function useReturnFocus(open: boolean): void {
  const trigger = useRef<Element | null>(null);
  useEffect(() => {
    if (open) {
      trigger.current = document.activeElement;
      return;
    }
    const node = trigger.current;
    trigger.current = null;
    if (node instanceof HTMLElement && node.isConnected) node.focus({ preventScroll: true });
  }, [open ]);
}
