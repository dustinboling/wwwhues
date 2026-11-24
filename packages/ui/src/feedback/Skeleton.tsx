import type { JSX } from 'react';
import { cx } from '../lib/cx';

export interface SkeletonProps {
  shape?: 'block' | 'card' | 'row' | 'list';
  label?: string;
  count?: number;
  className?: string | undefined;
}

/**
 * First-load twins of real components: same boxes, same heights, same grid.
 * Surface blocks with a slow opacity breathe (no shimmer sweep); static
 * under reduced motion. First genuine loads only, never filters or returns.
 */
export function Skeleton({ shape = 'block', label = 'Loading', count = 1, className }: SkeletonProps): JSX.Element {
  const units = Array.from({ length: Math.max(count, 1) }, (_, index) => index);
  return (
    <div role="status" aria-label={label} className={cx('hues-skeleton', `hues-skeleton--${shape}`, className)}>
      {units.map((index) => (
        <span key={index} aria-hidden="true" className="hues-skeleton__unit">
          <span className="hues-skeleton__media" />
          <span className="hues-skeleton__line" />
          <span className="hues-skeleton__line hues-skeleton__line--short" />
          <span className="hues-skeleton__action" />
        </span>
      ))}
      <span className="hues-visually-hidden">{label}</span>
    </div>
  );
}
