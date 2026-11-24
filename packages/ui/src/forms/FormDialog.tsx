import { useState } from 'react';
import type { JSX, ReactNode } from 'react';
import { Dialog } from '../shell/Dialog';
import { Button } from '../actions/Button';
import { cx } from '../lib/cx';

export interface FormDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  submitLabel?: string;
  cancelLabel?: string;
  dirty?: boolean;
  submitting?: boolean;
  submitError?: string | null;
  onSubmit?: () => void;
  className?: string;
}

/**
 * Pattern-B pop-up form (pages show no visible form): the same field kit
 * inside a Dialog, actions at the foot (primary right, quiet cancel left),
 * dirty-guarded dismissal, submitting and error states.
 */
export function FormDialog({
  open,
  onClose,
  title,
  children,
  submitLabel = 'Save',
  cancelLabel = 'Cancel',
  dirty = false,
  submitting = false,
  submitError = null,
  onSubmit,
  className,
}: FormDialogProps): JSX.Element {
  const [touched, setTouched] = useState(false);
  return (
    <Dialog open={open} onClose={onClose} title={title} dirty={dirty && !touched} className={cx('hues-form-dialog', className)}>
      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          setTouched(true);
          onSubmit?.();
        }}
        className="hues-form-dialog__form"
      >
        <div className="hues-form-dialog__fields">{children}</div>
        {submitError !== null && (
          <p role="alert" className="hues-form-dialog__error">
            {submitError}
          </p>
        )}
        <div className="hues-form-dialog__actions">
          <Button variant="quiet" onClick={onClose}>
            {cancelLabel}
          </Button>
          <Button variant="primary" type="submit" loading={submitting}>
            {submitLabel}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
