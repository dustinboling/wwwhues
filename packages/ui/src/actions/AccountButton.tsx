import type { ButtonHTMLAttributes, JSX } from 'react';
import { Icon } from '../media/Icon';
import { Spinner } from '../feedback/Spinner';
import { cx } from '../lib/cx';

export interface AccountButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Signed-out shows the person glyph; signed-in shows the account initial. */
  state?: 'signed-out' | 'signed-in';
  initial?: string;
  loading?: boolean;
}

/** Shell account round: icon to initial when signed in, live in the SPA. */
export function AccountButton({ state = 'signed-out', initial, loading = false, className, ...rest }: AccountButtonProps): JSX.Element {
  return (
    <button
      type="button"
      className={cx('hues-account-button', className)}
      aria-label={state === 'signed-in' ? `Account${initial !== undefined ? `, signed in as ${initial}` : ''}` : 'Account'}
      disabled={loading || undefined}
      {...rest}
    >
      {loading ? (
        <Spinner size="small" label="Loading account" />
      ) : state === 'signed-in' ? (
        <span className="hues-account-button__initial" aria-hidden="true">
          {initial ?? 'H'}
        </span>
      ) : (
        <Icon name="person" size={20} />
      )}
    </button>
  );
}
