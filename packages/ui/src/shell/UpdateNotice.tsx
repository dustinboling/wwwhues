import { useState } from 'react';
import type { JSX } from 'react';
import { Button } from '../actions/Button';
import { cx } from '../lib/cx';

export interface UpdateNoticeProps {
  /** Apply arms the waiting worker (skipWaiting on user tap, never automatic). */
  onApply?: () => void;
  onDismiss?: () => void;
  className?: string;
}

/**
 * Quiet new-version pill above the tab bar. Never a forced reload, never
 * mid-form or mid-game: the app shows it at route boundaries while the
 * player is absent (player wins, notice waits).
 */
export function UpdateNotice({ onApply, onDismiss, className }: UpdateNoticeProps): JSX.Element | null {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;
  return (
    <div role="status" className={cx('hues-update-notice', className)}>
      <span>A fresh version of Hues is ready</span>
      <Button variant="quiet" onClick={onApply}>
        Apply
      </Button>
      <Button
        variant="icon-round"
        icon="close"
        aria-label="Dismiss update notice"
        onClick={() => {
          setDismissed(true);
          onDismiss?.();
        }}
        className="hues-update-notice__dismiss"
      />
    </div>
  );
}
