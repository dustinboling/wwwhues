/**
 * Media layer client (plan §1d, Perf #4): Cloudflare Image Transformations
 * on the media domain with the fixed parameter contract. Originals in R2
 * are never referenced directly; media URLs are immutable (a replaced photo
 * publishes at a new key).
 *
 * The media domain itself is UNVERIFIED (plan §6 N15; Hue/Dustin confirm
 * whether it is a new subdomain or another host). Apps set it once via
 * setMediaBaseUrl; the Image component fails loudly when it is unset.
 */

import { tokens } from '@hues/tokens/tokens';

export const MEDIA_WIDTH_LADDER = [320, 480, 768, 1024, 1440, 1920] as const;
export type MediaWidth = (typeof MEDIA_WIDTH_LADDER)[number];

export const PHOTO_QUALITY = 80;
export const PLATE_QUALITY = 85;

/**
 * Component slots and their sizes values, taken from the components' slots
 * in Mina's system (plan §1d). The hero cap is the desktop content width;
 * card follows the phone 2-up grid; plate follows the season-plate cards.
 * Band is the one explicit full-bleed opt-in (photo bands are viewport-wide
 * by construction); nothing else defaults to 100vw.
 */
/* eslint-disable hues/no-raw-px -- §1d transformation contract: the closed
   sizes set for the media width ladder. Component-contract values, not
   styles (the drift check exempts sizes strings on the same basis). */
export const MEDIA_SLOT_SIZES = {
  hero: '(max-width: 768px) 100vw, 1280px',
  band: '100vw',
  card: '(max-width: 768px) 50vw, 400px',
  plate: '(max-width: 768px) 100vw, 560px',
} as const;
/* eslint-enable hues/no-raw-px */

/** Slot names for the §1d sizes contract (keys of MEDIA_SLOT_SIZES). */
export type MediaSlot = keyof typeof MEDIA_SLOT_SIZES;

let baseUrl: string | null = null;

/** Set once at app bootstrap from the confirmed media domain. */
export function setMediaBaseUrl(url: string): void {
  baseUrl = url.replace(/\/+$/, '');
}

/** Current media base URL, or null when unset. */
export function getMediaBaseUrl(): string | null {
  return baseUrl;
}

/**
 * True when a src resolves against the configured media base (Slice J):
 * those fetches run in CORS mode, so the service worker caches responses
 * with real statuses instead of poisoning the image route as opaque.
 * Relative and same-origin URLs are never media URLs.
 */
export function isMediaUrl(src: string): boolean {
  if (baseUrl === null || baseUrl.length === 0) return false;
  return src === baseUrl || src.startsWith(`${baseUrl}/`);
}

export interface TransformOptions {
  key: string;
  width: MediaWidth;
  quality?: number | undefined;
  /** Plates pad onto the paper ground, never crop. */
  fit?: 'pad' | 'cover' | undefined;
}

function padBackground(): string {
  return encodeURIComponent(tokens['color-bg']);
}

/** Build one immutable transform URL for an R2 key. */
export function transformUrl(options: TransformOptions, overrideBase?: string): string {
  const base = overrideBase ?? baseUrl;
  if (base === null || base === undefined || base.length === 0) {
    throw new Error('Media base URL is unset: call setMediaBaseUrl() at app bootstrap.');
  }
  if (options.key.startsWith('http://') || options.key.startsWith('https://')) {
    throw new Error('Media keys are R2 paths: originals are never referenced directly.');
  }
  const params = [`format=auto`, `width=${options.width}`, `quality=${options.quality ?? PHOTO_QUALITY}`];
  if (options.fit === 'pad') params.push('fit=pad', `background=${padBackground()}`);
  else if (options.fit === 'cover') params.push('fit=cover');
  const key = options.key.replace(/^\/+/, '');
  return `${base}/cdn-cgi/image/${params.join(',')}/${key}`;
}

/** srcset across the closed width ladder (no arbitrary widths). */
export function srcSetFor(key: string, options?: { quality?: number; fit?: 'pad' | 'cover'; baseUrl?: string }): string {
  return MEDIA_WIDTH_LADDER.map(
    (width) =>
      `${transformUrl({ key, width, quality: options?.quality, fit: options?.fit }, options?.baseUrl)} ${width}w`,
  ).join(', ');
}
