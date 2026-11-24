import { useEffect, useRef } from 'react';
import type { AnchorHTMLAttributes, JSX, MouseEvent } from 'react';
import { tokens } from '@hues/tokens/tokens';
import { cx } from '../lib/cx';

export interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  /** Prose links carry the standing underline; navigation is dressed by position. */
  context?: 'prose' | 'nav';
  /**
   * Document prefetch hint (Perf #8 companion; Vike chunk prefetch stays in
   * app config). Disabled under Save-Data or 2G/slow-2G, and never for
   * media-heavy routes until their data loads (pass prefetch="off" there).
   */
  prefetch?: 'hover' | 'viewport' | 'off';
}

/**
 * Real <a href>, client-routing aware: internal clicks flow to the client
 * router untouched (no preventDefault, no click-handler navigation), while
 * modifiers, new-tab intent, and external URLs keep native behavior.
 */
export function Link({ href, context = 'prose', prefetch = 'off', className, onMouseEnter, ...rest }: LinkProps): JSX.Element {
  const ref = useRef<HTMLAnchorElement | null>(null);
  const prefetched = useRef(false);

  useEffect(() => {
    prefetched.current = false;
  }, [href]);

  useEffect(() => {
    if (prefetch !== 'viewport' || ref.current === null || typeof IntersectionObserver === 'undefined') return;
    const node = ref.current;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          prefetchDocument(href, prefetched);
          observer.disconnect();
        }
      },
      { rootMargin: tokens['link-prefetch-margin'] },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [prefetch, href]);

  const handleMouseEnter = (event: MouseEvent<HTMLAnchorElement>): void => {
    onMouseEnter?.(event);
    if (prefetch === 'hover') prefetchDocument(href, prefetched);
  };

  return (
    <a
      ref={ref}
      href={href}
      onMouseEnter={prefetch === 'hover' ? handleMouseEnter : onMouseEnter}
      className={cx('hues-link', context === 'prose' ? 'hues-link--prose' : 'hues-link--nav', className)}
      {...rest}
    />
  );
}

function prefetchDocument(href: string, done: { current: boolean }): void {
  if (done.current || typeof document === 'undefined') return;
  if (href.startsWith('#')) return;
  try {
    const url = new URL(href, window.location.href);
    if (url.origin !== window.location.origin) return;
  } catch {
    return;
  }
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
  if (connection?.saveData === true) return;
  if (connection?.effectiveType === '2g' || connection?.effectiveType === 'slow-2g') return;
  done.current = true;
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = href;
  link.setAttribute('data-hues-prefetch', 'true');
  document.head.appendChild(link);
}
