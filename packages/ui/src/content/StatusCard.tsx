import type { JSX } from 'react';
import { cx } from '../lib/cx';

export type StatusVariant = 'home' | 'hub' | 'visit';

export interface StatusCardProps {
  variant?: StatusVariant;
  headline: string;
  detail?: string;
  updated?: boolean;
  className?: string;
}

/**
 * Season status headline block (a live region): text swaps in place inside
 * the reserved status line on visibility return and the hour boundary.
 */
export function StatusCard({ variant = 'home', headline, detail, updated = false, className }: StatusCardProps): JSX.Element {
  return (
    <section aria-live="polite" data-variant={variant} data-updated={updated || undefined} className={cx('hues-status-card', className)}>
      <span className="hues-status-card__headline">{headline}</span>
      {detail !== undefined && <span className="hues-status-card__detail">{detail}</span>}
    </section>
  );
}
