import { useRef, useState } from 'react';
import type { FormHTMLAttributes, JSX, ReactNode } from 'react';
import { useAnnouncer } from '../lib/announce';
import { SubmitBar } from './SubmitBar';
import { cx } from '../lib/cx';

export interface InlineFormProps extends FormHTMLAttributes<HTMLFormElement> {
  /** Field groups (who you are, how to reach you, what you would like to do). */
  children: ReactNode;
  submitLabel?: string;
  /** Success replaces the action zone only (Peak-End: warm, specific, next step). */
  success?: ReactNode | null;
  pendingOffline?: boolean;
  pendingMessage?: string;
  /** Field-level errors keyed by input name; focus moves to the first. */
  fieldErrors?: Record<string, string>;
}

/**
 * Pattern-A public form shell: grouped single column, submit pinned in
 * thumb reach, form-beside-summary on desktop. A failed submit never clears
 * entered data; multi-error submits announce "N fields need attention"
 * while focus goes to the first error. Apps validate on submit (native
 * bubbles off so messages stay plain-language) and pass fieldErrors; after
 * submit the app shows success, pending, or errors.
 */
export function InlineForm({
  children,
  submitLabel = 'Submit',
  success = null,
  pendingOffline = false,
  pendingMessage = 'Saved on this device — will send when you are back online',
  fieldErrors = {},
  className,
  onSubmit,
  ...rest
}: InlineFormProps): JSX.Element {
  const formRef = useRef<HTMLFormElement | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const announce = useAnnouncer();
  const errorCount = Object.keys(fieldErrors).length;

  return (
    <form
      ref={formRef}
      noValidate
      className={cx('hues-inline-form', className)}
      onSubmit={(event) => {
        if (errorCount > 0) {
          event.preventDefault();
          if (errorCount > 1) announce(`${errorCount} fields need attention`);
          const first = formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]');
          first?.focus({ preventScroll: false });
          return;
        }
        setSubmitting(true);
        onSubmit?.(event);
        if (event.defaultPrevented) setSubmitting(false);
      }}
      {...rest}
    >
      <div className="hues-inline-form__groups">{children}</div>
      {success !== null ? (
        <div role="status" className="hues-inline-form__success">
          {success}
        </div>
      ) : pendingOffline ? (
        <p role="status" className="hues-inline-form__pending">
          {pendingMessage}
        </p>
      ) : (
        <SubmitBar submitLabel={submitLabel} submitting={submitting} />
      )}
    </form>
  );
}
