import { useId } from 'react';
import type { JSX, ReactNode, SelectHTMLAttributes } from 'react';
import { FieldError } from './FieldError';
import { FieldNote } from './FieldNote';
import { cx } from '../lib/cx';

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'id'> {
  label: string;
  note?: string;
  error?: string;
  children: ReactNode;
}

/** Filled select with the field-kit label, note, and error contract. */
export function Select({ label, note, error, required, className, children, ...rest }: SelectProps): JSX.Element {
  const baseId = useId();
  const fieldId = `${baseId}-field`;
  const noteId = `${baseId}-note`;
  const errorId = `${baseId}-error`;
  const describedBy = [note !== undefined ? noteId : null, error !== undefined ? errorId : null]
    .filter((id): id is string => id !== null)
    .join(' ');
  return (
    <div data-error={error !== undefined || undefined} className={cx('hues-field', className)}>
      <label htmlFor={fieldId} className="hues-field__label">
        {label}
        {required === true && <span className="hues-field__required"> (required)</span>}
      </label>
      <select
        id={fieldId}
        required={required}
        aria-invalid={error !== undefined || undefined}
        aria-describedby={describedBy === '' ? undefined : describedBy}
        className="hues-field__input"
        {...rest}
      >
        {children}
      </select>
      {note !== undefined && <FieldNote id={noteId}>{note}</FieldNote>}
      {error !== undefined && <FieldError id={errorId} message={error} />}
    </div>
  );
}
