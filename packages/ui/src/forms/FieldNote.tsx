import type { JSX } from 'react';
import { cx } from '../lib/cx';

/** Field note below the input, in the caption role. */
export function FieldNote({ id, children, className }: { id: string; children: string; className?: string }): JSX.Element {
  return (
    <p id={id} className={cx('hues-field-note', className)}>
      {children}
    </p>
  );
}
