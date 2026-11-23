import type { JSX } from 'react';
import { cx } from '../lib/cx';

/** Age labelling for data that is stale rather than live ("checked 2h ago"). */
export function StaleLabel({ label, className }: { label: string; className?: string }): JSX.Element {
  return <span className={cx('hues-stale-label', className)}>{label}</span>;
}
