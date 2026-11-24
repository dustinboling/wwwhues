import type { JSX } from 'react';
import { Link } from '../media/Link';
import { Button } from '../actions/Button';
import { cx } from '../lib/cx';

export interface ErrorRegionProps {
  title: string;
  body: string;
  stillTrue?: string;
  onRetry?: () => void;
  retryLabel?: string;
  /** Page-level 404: packet card with Home + Visit actions. */
  page404?: boolean;
  className?: string;
}

/**
 * Inline plain-language error with retry: what happened, what is still
 * true (place, entered data), one Try again button. Never a bare spinner,
 * never a blank region, never a technical code.
 */
export function ErrorRegion({ title, body, stillTrue, onRetry, retryLabel = 'Try again', page404 = false, className }: ErrorRegionProps): JSX.Element {
  return (
    <div role="alert" data-page404={page404 || undefined} className={cx('hues-error-region', className)}>
      <h2 className="hues-error-region__title">{title}</h2>
      <p className="hues-error-region__body">{body}</p>
      {stillTrue !== undefined && <p className="hues-error-region__still">{stillTrue}</p>}
      {page404 ? (
        <div className="hues-error-region__actions">
          <Link href="/" context="nav" className="hues-button hues-button--secondary">
            Home
          </Link>
          <Link href="/visit" context="nav" className="hues-button hues-button--primary">
            Visit
          </Link>
        </div>
      ) : (
        onRetry !== undefined && (
          <Button variant="secondary" onClick={onRetry}>
            {retryLabel}
          </Button>
        )
      )}
    </div>
  );
}
