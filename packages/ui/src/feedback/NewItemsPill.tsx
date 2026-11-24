import type { JSX } from 'react';
import { cx } from '../lib/cx';

/** Admin "n new" marker in the reserved board-header slot. Tapping inserts the new rows. */
export function NewItemsPill({ count, onInsert, className }: { count: number; onInsert?: () => void; className?: string }): JSX.Element | null {
  if (count <= 0) return null;
  return (
    <button type="button" onClick={onInsert} className={cx('hues-new-items-pill', className)} aria-label={`Show ${count} new items`}>
      {count} new
    </button>
  );
}
