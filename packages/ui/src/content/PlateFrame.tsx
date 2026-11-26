import type { JSX, ReactNode } from 'react';
import { cx } from '../lib/cx';

/**
 * Plate sizes, each a production-measured treatment: tile is the dahlia
 * strip (gold ring, 6px mat); frame is the phone Procession figure (gold
 * ring, 8px mat, below-art caption); plate is the desktop hero plate
 * (stitched packet mat, 12px mat, on-art caption chip).
 */
export type PlateFrameSize = 'tile' | 'frame' | 'plate';

export interface PlateFrameProps {
  size?: PlateFrameSize;
  /** Below-art caption (the phone framed-figure treatment). */
  caption?: ReactNode;
  /** On-art caption chip (the desktop hero-plate treatment). */
  overlay?: ReactNode;
  /** The art itself (an Image, usually kind plate or photo). */
  children: ReactNode;
  className?: string;
}

/**
 * Framed-plate treatment for paintings and hero figures: a paper mat with
 * a gold ring (tile, frame) or the stitched packet mat (plate), the art
 * clipped to the production inner radius. Art sizing is intrinsic to the
 * art node (Image ratio/aspect); fixed rail tile dimensions arrive with
 * the route compositions in P6+.
 */
export function PlateFrame({ size = 'frame', caption, overlay, children, className }: PlateFrameProps): JSX.Element {
  return (
    <figure className={cx('hues-plate-frame', `hues-plate-frame--${size}`, className)}>
      <span className="hues-plate-frame__art">{children}</span>
      {overlay !== undefined && <span className="hues-plate-frame__overlay">{overlay}</span>}
      {caption !== undefined && <figcaption className="hues-plate-frame__caption">{caption}</figcaption>}
    </figure>
  );
}
