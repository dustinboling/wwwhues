import type { JSX } from 'react';
import { Icon } from '../media/Icon';
import { cx } from '../lib/cx';

/** Per-field plain-language message. Messages name the correction. */
export function FieldError({ id, message, className }: { id: string; message: string; className?: string }): JSX.Element {
  return (
    <p id={id} className={cx('hues-field-error', className)}>
      <Icon name="error" size={16} />
      <span>{message}</span>
    </p>
  );
}
