import { useId, useState } from 'react';
import type { JSX, ReactNode } from 'react';
import { Link } from '../media/Link';
import { Icon } from '../media/Icon';
import { cx } from '../lib/cx';

export interface NavItem {
  href: string;
  label: string;
}

export interface SiteHeaderProps {
  variant?: 'park' | 'seeds';
  logo: ReactNode;
  lockup?: ReactNode;
  items: NavItem[];
  currentHref?: string;
  planHref?: string;
  planLabel?: string;
  account?: ReactNode;
  /** Force the Menu popover in tests and stories. */
  menuOpen?: boolean;
  onMenuChange?: (open: boolean) => void;
  className?: string;
}

/**
 * Desktop sticky header: logo plus wordmark lockup, nav pill at 1280px and
 * up (active item gold-ink with the gold underline bar), Menu popover below
 * that width, Plan-a-visit pill plus account round right.
 */
export function SiteHeader({
  variant = 'park',
  logo,
  lockup,
  items,
  currentHref,
  planHref = '/visit',
  planLabel = 'Plan a visit',
  account,
  menuOpen,
  onMenuChange,
  className,
}: SiteHeaderProps): JSX.Element {
  const [internalOpen, setInternalOpen] = useState(false);
  const baseId = useId();
  const open = menuOpen ?? internalOpen;
  const setOpen = (next: boolean): void => {
    onMenuChange?.(next);
    if (menuOpen === undefined) setInternalOpen(next);
  };
  const menuId = `${baseId}-menu`;
  return (
    <header data-variant={variant} className={cx('hues-site-header', className)}>
      <div className="hues-site-header__inner">
        <Link href="/" context="nav" aria-label="Hues Floral Park home" className="hues-site-header__brand">
          <span className="hues-site-header__logo">{logo}</span>
          {lockup !== undefined && <span className="hues-site-header__lockup">{lockup}</span>}
        </Link>
        <nav aria-label="Primary" className="hues-site-header__pill">
          <ul>
            {items.map((item) => {
              const current = item.href === currentHref;
              return (
                <li key={item.href}>
                  <Link href={item.href} context="nav" aria-current={current ? 'page' : undefined} data-current={current || undefined}>
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="hues-site-header__cluster">
          <Link href={planHref} context="nav" className="hues-button hues-button--primary hues-site-header__plan">
            {planLabel}
          </Link>
          {account}
        </div>
        <div className="hues-site-header__menu">
          <button
            type="button"
            aria-expanded={open}
            aria-controls={menuId}
            onClick={() => setOpen(!open)}
            className="hues-site-header__menu-button"
          >
            Menu
            <Icon name={open ? 'chevron-up' : 'chevron-down'} size={16} />
          </button>
          {open && (
            <div id={menuId} className="hues-site-header__panel">
              <nav aria-label="Primary">
                <ul>
                  {items.map((item) => {
                    const current = item.href === currentHref;
                    return (
                      <li key={item.href}>
                        <Link href={item.href} context="nav" aria-current={current ? 'page' : undefined} onClick={() => setOpen(false)}>
                          {item.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>
              <Link href={planHref} context="nav" className="hues-button hues-button--primary hues-site-header__panel-plan">
                {planLabel}
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
