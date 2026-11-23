import type { ImgHTMLAttributes, JSX } from 'react';
import { MEDIA_SLOT_SIZES, PHOTO_QUALITY, PLATE_QUALITY, srcSetFor } from '../lib/media';
import type { MediaSlot } from '../lib/media';
import { cx } from '../lib/cx';

export interface ImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet' | 'sizes' | 'alt'> {
  /** R2 key (never an original URL, never a remote URL). */
  src: string;
  /** Required. Empty only with decorative: true. */
  alt: string;
  /** Marks art-only imagery (lettering decorative, focal point preserved). */
  decorative?: boolean;
  /** Slot drives the sizes value. */
  slot?: MediaSlot;
  /** Explicit sizes override (must still come from the component slot). */
  sizes?: string;
  /** The route LCP image: eager, high priority, the template's only preload. */
  priority?: boolean;
  /** Plates pad onto paper, never crop; photos crop only where the current site crops. */
  kind?: 'photo' | 'plate';
  /** Aspect-ratio reservation, e.g. "16/9", "1/1", "1120/2240". */
  ratio?: string;
  /** Focal point preserved on crop, as object-position. */
  focalPoint?: string;
  className?: string;
  imageClassName?: string;
}

/**
 * Image component contract (plan §1d, Perf #4, Data #1.4e): srcset from the
 * closed width ladder, sizes from the component slot, LCP priority for the
 * hero only, lazy everything else, required alt reviewed like copy.
 */
export function Image({
  src,
  alt,
  decorative = false,
  slot = 'card',
  sizes,
  priority = false,
  kind = 'photo',
  ratio,
  focalPoint = '50% 50%',
  className,
  imageClassName,
  ...rest
}: ImageProps): JSX.Element {
  if (!decorative && alt === '' && typeof process !== 'undefined' && process.env.NODE_ENV !== 'production') {
    console.error('Hues Image: content images require non-empty alt text (or decorative={true}).');
  }
  const resolvedSizes = sizes ?? MEDIA_SLOT_SIZES[slot];
  const srcSet = srcSetFor(src, {
    quality: kind === 'plate' ? PLATE_QUALITY : PHOTO_QUALITY,
    fit: kind === 'plate' ? 'pad' : 'cover',
  });
  return (
    <span
      className={cx('hues-image', kind === 'plate' ? 'hues-image--plate' : 'hues-image--photo', className)}
      style={ratio === undefined ? undefined : { aspectRatio: ratio }}
    >
      <img
        src={srcSet.split(' ')[0]}
        srcSet={srcSet}
        sizes={resolvedSizes}
        alt={decorative ? '' : alt}
        aria-hidden={decorative ? true : undefined}
        fetchPriority={priority ? 'high' : 'auto'}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        style={{ objectPosition: focalPoint }}
        className={cx('hues-image__img', imageClassName)}
        {...rest}
      />
    </span>
  );
}

/** Preload link props for the LCP hero, for the template +Head (the only image preload allowed). */
export function heroPreloadLink(props: Pick<ImageProps, 'src' | 'slot' | 'sizes' | 'kind'>): {
  rel: 'preload';
  as: 'image';
  imageSrcSet: string;
  imageSizes: string;
} {
  const slot = props.slot ?? 'card';
  return {
    rel: 'preload',
    as: 'image',
    imageSrcSet: srcSetFor(props.src, {
      quality: props.kind === 'plate' ? PLATE_QUALITY : PHOTO_QUALITY,
      fit: props.kind === 'plate' ? 'pad' : 'cover',
    }),
    imageSizes: props.sizes ?? MEDIA_SLOT_SIZES[slot],
  };
}
