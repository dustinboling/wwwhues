import type { JSX } from 'react';
import { cx } from '../lib/cx';

export interface OfflineBannerProps {
  /** Saved-data age label, e.g. "from 8:04 AM". Always labelled, never posing as live. */
  ageLabel: string;
  className?: string;
}

/** Slim offline strip under the top bar: saved facts plus their age. Never blocks content. */
export function OfflineBanner({ ageLabel, className }: OfflineBannerProps): JSX.Element {
  return (
    <div role="status" className={cx('hues-offline-banner', className)}>
      You are offline — showing saved park facts {ageLabel}
    </div>
  );
}
