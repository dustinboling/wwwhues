import { useId } from 'react';
import type { InputHTMLAttributes, JSX } from 'react';
import { FieldError } from './FieldError';
import { cx } from '../lib/cx';

export interface CheckProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id' | 'type'> {
  label: string;
  error?: string;
}

/**
 * Leaf-accent selection controls: 20px boxes, 44px-minimum rows. Native
 * inputs with the leaf accent so name, role, and value stay platform-true.
 */
function CheckRow({ label, error, type, className, ...rest }: CheckProps & { type: 'checkbox' | 'radio' }): JSX.Element {
  const fieldId = useId();
  const errorId = `${fieldId}-error`;
  return (
    <div data-error={error !== undefined || undefined} className={cx('hues-check', className)}>
      <input id={fieldId} type={type} aria-invalid={error !== undefined || undefined} aria-describedby={error === undefined ? undefined : errorId} {...rest} />
      <label htmlFor={fieldId} className="hues-check__label">
        {label}
      </label>
      {error !== undefined && <FieldError id={errorId} message={error} />}
    </div>
  );
}

export function Checkbox(props: CheckProps): JSX.Element {
  return <CheckRow {...props} type="checkbox" />;
}

export function Radio(props: CheckProps): JSX.Element {
  return <CheckRow {...props} type="radio" />;
}
