import { useEffect, useId, useRef } from 'react';
import type { JSX, ReactNode } from 'react';
import { useOverlayHistory } from '../lib/overlay-history';
import { useFocusTrap, useReturnFocus } from '../lib/focus';
import { Button } from '../actions/Button';
import { cx } from '../lib/cx';

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  /** Dirty forms guard dismissal with a confirm step. */
  dirty?: boolean;
  dirtyMessage?: string;
  className?: string;
}

/**
 * Centered modal (desktop/iPad Pattern-B forms, account gate): focus traps
 * inside and returns to the invoking control, Escape and backdrop dismiss
 * (guarded when dirty), Back closes through the overlay history entry.
 */
export function Dialog({ open, onClose, title, children, dirty = false, dirtyMessage = 'Discard unsaved changes?', className }: DialogProps): JSX.Element | null {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement | null>(null);
  useOverlayHistory(open, onClose);
  useReturnFocus(open);
  useFocusTrap(open, dialogRef);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        if (!dirty || window.confirm(dirtyMessage)) onClose();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onClose, dirty, dirtyMessage]);

  if (!open) return null;
  const dismiss = (): void => {
    if (!dirty || window.confirm(dirtyMessage)) onClose();
  };
  return (
    <div className={cx('hues-dialog-root', className)}>
      <button type="button" tabIndex={-1} aria-label="Close dialog" onClick={dismiss} className="hues-dialog__backdrop" />
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby={titleId} className="hues-dialog">
        <div className="hues-dialog__header">
          <h2 id={titleId} className="hues-dialog__title">
            {title}
          </h2>
          <Button variant="icon-round" onClick={dismiss} aria-label="Close" icon="close" />
        </div>
        <div className="hues-dialog__body">{children}</div>
      </div>
    </div>
  );
}
