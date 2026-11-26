import type { JSX, ReactNode } from 'react';
import { Image } from './Image';
import { cx } from '../lib/cx';

/** Photo bands, each at its production fixed heights per breakpoint. */
export type PhotoBandKind = 'dusk' | 'meet-dusty';

export interface PhotoBandProps {
  band: PhotoBandKind;
  /** R2 key (never an original URL, never a remote URL). */
  src: string;
  alt: string;
  /** Caption over the band's lower edge (dusk); type stays with the route. */
  caption?: ReactNode;
  /** The route LCP image only. */
  priority?: boolean;
  /** Focal point preserved on crop, as object-position. */
  focalPoint?: string;
  className?: string;
}

/**
 * Full-bleed photo band at production's fixed slot heights (dusk 430px,
 * Meet Dusty 230/300px), cover-cropped with the production gradient
 * scrim. The slot carries no radius or shadow: phone bands run
 * full-bleed, and desktop compositions frame the band in the route.
 * Caption placement follows production; caption type stays with the
 * route copy, which varies per band.
 */
export function PhotoBand({ band, src, alt, caption, priority = false, focalPoint, className }: PhotoBandProps): JSX.Element {
  return (
    <figure className={cx('hues-photo-band', `hues-photo-band--${band}`, className)}>
      <div className="hues-photo-band__slot">
        <Image
          src={src}
          alt={alt}
          slot="band"
          kind="photo"
          priority={priority}
          {...(focalPoint === undefined ? {} : { focalPoint })}
        />
        <div aria-hidden="true" className="hues-photo-band__scrim" />
      </div>
      {caption !== undefined && <figcaption className="hues-photo-band__caption">{caption}</figcaption>}
    </figure>
  );
}
