import { useEffect, useId, useRef } from 'react';
import type { JSX, ReactNode } from 'react';
import { useOverlayHistory } from '../lib/overlay-history';
import { useReturnFocus } from '../lib/focus';
import { Button } from '../actions/Button';
import { cx } from '../lib/cx';

export interface SheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  /** Where focus returns on close (defaults to the invoking control). */
  className?: string;
}

/**
 * Bottom sheet container (More sheet, account gate, phone form sheet).
 * Dialog semantics with history behavior: Back closes without navigating.
 * Focus starts on the close control; closing returns focus to the trigger.
 */
export function Sheet({ open, onClose, title, children, className }: SheetProps): JSX.Element | null {
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement | null>(null);
  useOverlayHistory(open, onClose);
  useReturnFocus(open);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus({ preventScroll: true });
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className={cx('hues-sheet-root', className)}>
      <button type="button" tabIndex={-1} aria-label="Close dialog" onClick={onClose} className="hues-sheet__backdrop" />
      <div role="dialog" aria-modal="true" aria-labelledby={titleId} className="hues-sheet">
        <div className="hues-sheet__header">
          <h2 id={titleId} className="hues-sheet__title">
            {title}
          </h2>
          <Button ref={closeRef} variant="icon-round" onClick={onClose} aria-label="Close" icon="close" className="hues-sheet__close" />
        </div>
        <div className="hues-sheet__body">{children}</div>
      </div>
    </div>
  );
}
