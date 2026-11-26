import type { JSX } from 'react';
import { Image } from './Image';
import { cx } from '../lib/cx';

/** Spot-art widths, production-measured (48/80/176/208px). */
export type SpotArtSize = 'xs' | 'sm' | 'md' | 'lg';

export interface SpotArtProps {
  /** R2 key (never an original URL, never a remote URL). */
  src: string;
  size?: SpotArtSize;
  /**
   * Placement: beside (shrink-proof flex-row companion to a heading) or
   * above (centred block over a heading or packet). Flow spacing stays
   * with the route composition, which varies per section in production.
   */
  placement?: 'beside' | 'above';
  className?: string;
}

/**
 * Watercolor spot-illustration placement/sizing wrapper: always
 * decorative (empty alt, hidden from assistive tech), at one of the four
 * production widths, either beside a heading or centred above one.
 */
export function SpotArt({ src, size = 'sm', placement = 'beside', className }: SpotArtProps): JSX.Element {
  return (
    <span className={cx('hues-spot-art', `hues-spot-art--${size}`, placement === 'above' && 'hues-spot-art--above', className)}>
      <Image src={src} alt="" decorative slot="card" kind="photo" />
    </span>
  );
}
