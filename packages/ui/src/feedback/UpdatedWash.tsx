import type { JSX, ReactNode } from 'react';
import { cx } from '../lib/cx';

/**
 * Gold 12% highlight fade over motion.highlight on changed cards and rows:
 * visible, gentle, gone. Wraps the changed item; data-updated drives it.
 */
export function UpdatedWash({ updated = false, children, className }: { updated?: boolean; children: ReactNode; className?: string }): JSX.Element {
  return (
    <span data-updated={updated || undefined} className={cx('hues-updated-wash', className)}>
      {children}
    </span>
  );
}
