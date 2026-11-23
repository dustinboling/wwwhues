import { useId } from 'react';
import type { InputHTMLAttributes, JSX } from 'react';
import { FieldError } from './FieldError';
import { FieldNote } from './FieldNote';
import { cx } from '../lib/cx';

export interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  label: string;
  note?: string;
  error?: string;
}

/**
 * Filled text input: surface fill, ink-soft border, label above (required
 * marked in the label text itself, never asterisk-alone), note and error
 * below with aria-describedby, aria-invalid while errored.
 */
export function TextField({ label, note, error, required, className, ...rest }: TextFieldProps): JSX.Element {
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
      <input
        id={fieldId}
        required={required}
        aria-invalid={error !== undefined || undefined}
        aria-describedby={describedBy === '' ? undefined : describedBy}
        className="hues-field__input"
        {...rest}
      />
      {note !== undefined && <FieldNote id={noteId}>{note}</FieldNote>}
      {error !== undefined && <FieldError id={errorId} message={error} />}
    </div>
  );
}
