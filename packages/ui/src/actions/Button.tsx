import type { ButtonHTMLAttributes, JSX, ReactNode, Ref } from 'react';
import { Icon } from '../media/Icon';
import type { IconName } from '../media/Icon';
import { Spinner } from '../feedback/Spinner';
import { cx } from '../lib/cx';

export type ButtonVariant = 'primary' | 'secondary' | 'quiet' | 'destructive' | 'icon-round';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  ref?: Ref<HTMLButtonElement>;
  variant?: ButtonVariant;
  /** Loading: label holds its width, a small spinner replaces the icon slot, disabled. */
  loading?: boolean;
  /** Destructive confirmation step: brick fill with paper-0 text. */
  filled?: boolean;
  icon?: IconName;
  children?: ReactNode;
}

/**
 * One primary, one secondary, one quiet, one destructive per surface; the
 * variant set is closed. Destructive is brick, always labeled, never
 * icon-only (Ada ruling 6b). Focus is the ground-following double signal.
 */
export function Button({ variant = 'primary', loading = false, filled = false, icon, type = 'button', disabled, className, children, ...rest }: ButtonProps): JSX.Element {
  const isDisabled = disabled === true || loading;
  return (
    <button
      type={type}
      disabled={isDisabled}
      aria-disabled={isDisabled || undefined}
      aria-busy={loading || undefined}
      className={cx('hues-button', `hues-button--${variant}`, loading && 'hues-button--loading', filled && 'hues-button--filled', className)}
      {...rest}
    >
      {loading ? (
        <Spinner size="small" label="Loading" className="hues-button__icon" />
      ) : (
        icon !== undefined && <Icon name={icon} size={20} className="hues-button__icon" />
      )}
      {children !== undefined && <span className="hues-button__label">{children}</span>}
    </button>
  );
}
