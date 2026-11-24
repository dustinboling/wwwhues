import type { JSX, ReactNode } from 'react';
import { Button } from '../actions/Button';
import { cx } from '../lib/cx';

export interface SubmitBarProps {
  submitLabel?: string;
  submitting?: boolean;
  cancelLabel?: string;
  onCancel?: () => void;
  children?: ReactNode;
  className?: string;
}

/** Sticky phone submit zone above the tab bar (primary right, quiet cancel left). */
export function SubmitBar({ submitLabel = 'Submit', submitting = false, cancelLabel = 'Cancel', onCancel, children, className }: SubmitBarProps): JSX.Element {
  return (
    <div className={cx('hues-submit-bar', className)}>
      {onCancel !== undefined && (
        <Button variant="quiet" onClick={onCancel}>
          {cancelLabel}
        </Button>
      )}
      {children}
      <Button variant="primary" type="submit" loading={submitting}>
        {submitLabel}
      </Button>
    </div>
  );
}
