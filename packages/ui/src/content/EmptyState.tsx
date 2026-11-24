import type { JSX, ReactNode } from 'react';
import { cx } from '../lib/cx';

export type EmptyStateVariant = 'gather-none' | 'sponsor-none' | 'board-none' | 'no-results' | 'offline' | 'signed-out';

export interface EmptyStateProps {
  variant: EmptyStateVariant;
  title: string;
  body: string;
  action?: ReactNode;
  illustration?: ReactNode;
  className?: string;
}

/**
 * Designed empty screens (primary screens, not exceptions): illustration
 * slot, display title, one plain line, one optional action.
 */
export function EmptyState({ variant, title, body, action, illustration, className }: EmptyStateProps): JSX.Element {
  return (
    <section data-variant={variant} className={cx('hues-empty-state', className)}>
      {illustration !== undefined && <div className="hues-empty-state__art">{illustration}</div>}
      <h2 className="hues-empty-state__title">{title}</h2>
      <p className="hues-empty-state__body">{body}</p>
      {action !== undefined && <div className="hues-empty-state__action">{action}</div>}
    </section>
  );
}
