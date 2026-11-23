import { useEffect, useState } from 'react';
import type { JSX, ReactNode } from 'react';
import { tokens } from '@hues/tokens/tokens';
import { Link } from '../media/Link';
import { cx } from '../lib/cx';

export interface TopBarProps {
  variant?: 'park' | 'family';
  logo: ReactNode;
  planHref?: string;
  planLabel?: string;
  account?: ReactNode;
  /** Force the scrolled state in tests and stories. */
  scrolled?: boolean;
  className?: string;
}

/**
 * Phone top bar: fixed, logo left, Plan-a-visit pill plus account round
 * right. Rests at paper 85% + blur; past 28px it goes 94% + elevation +
 * border. Short landscape goes fully clear (locked exception).
 */
export function TopBar({ variant = 'park', logo, planHref = '/visit', planLabel = 'Plan a visit', account, scrolled, className }: TopBarProps): JSX.Element {
  const [past, setPast] = useState(false);
  useEffect(() => {
    if (scrolled !== undefined) return;
    const threshold = Number.parseInt(tokens['header-topbar-scroll'], 10);
    const onScroll = (): void => setPast(window.scrollY > threshold);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [scrolled]);
  const isScrolled = scrolled ?? past;
  return (
    <header data-variant={variant} data-scrolled={isScrolled || undefined} className={cx('hues-topbar', className)}>
      <div className="hues-topbar__inner">
        <Link href="/" context="nav" aria-label="Hues home" className="hues-topbar__logo">
          {logo}
        </Link>
        <div className="hues-topbar__cluster">
          <Link href={planHref} context="nav" className="hues-button hues-button--primary hues-topbar__plan">
            {planLabel}
          </Link>
          {account}
        </div>
      </div>
    </header>
  );
}
