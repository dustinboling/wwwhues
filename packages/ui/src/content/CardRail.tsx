import type { JSX, ReactNode } from 'react';
import { Link } from '../media/Link';
import { cx } from '../lib/cx';

export interface CardRailProps {
  /** Rail gap: roomy (season cards) or tight (dahlia photos). */
  gap?: 'roomy' | 'tight';
  /** Rail cards (real links) plus, last, a RailEndCard. */
  children: ReactNode;
  className?: string;
}

/**
 * Phone swipe rail for card rows: horizontal scroll with a hidden
 * scrollbar, phone-gutter edge padding, and proximity snap so a settled
 * rail rests on a card boundary with a peek of the next card. (Production
 * rails have no snap classes; proximity snap is the P5 package spec and
 * changes no static layout.) Children keep their intrinsic widths; every
 * card stays a real link, so Tab reaches each stop and scroll follows.
 */
export function CardRail({ gap = 'roomy', children, className }: CardRailProps): JSX.Element {
  return <div className={cx('hues-card-rail', gap === 'tight' && 'hues-card-rail--tight', className)}>{children}</div>;
}

export type RailEndCardVariant = 'center' | 'stack';

export interface RailEndCardProps {
  href: string;
  /** End-card layout: centred (season rail) or stacked (dahlia rail). */
  variant?: RailEndCardVariant;
  /** Gold kicker line (stacked layout only). */
  kicker?: string;
  title: string;
  className?: string;
}

/**
 * Deep-green typographic end card closing a rail (no artwork on the
 * green): centred arrow-over-title, or the stacked kicker, heading, and
 * gold arrow. Always a real link; the arrow is decorative.
 */
export function RailEndCard({ href, variant = 'center', kicker, title, className }: RailEndCardProps): JSX.Element {
  return (
    <Link
      href={href}
      context="nav"
      aria-label={title}
      className={cx('hues-rail-end', variant === 'stack' ? 'hues-rail-end--stack' : 'hues-rail-end--center', className)}
    >
      {variant === 'center' ? (
        <>
          <span aria-hidden="true" className="hues-rail-end__arrow">
            →
          </span>
          <span className="hues-rail-end__title">{title}</span>
        </>
      ) : (
        <>
          {kicker !== undefined && <span className="hues-rail-end__kicker">{kicker}</span>}
          <span className="hues-rail-end__body">
            <span className="hues-rail-end__heading">{title}</span>
            <span aria-hidden="true" className="hues-rail-end__arrow">
              →
            </span>
          </span>
        </>
      )}
    </Link>
  );
}
