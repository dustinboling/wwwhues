import type { JSX, ReactNode } from 'react';
import { Image } from '../media/Image';
import { cx } from '../lib/cx';

export interface PhoneHeroPhoto {
  /** R2 key (never an original URL, never a remote URL). */
  src: string;
  alt: string;
  /** The route LCP image only. */
  priority?: boolean;
}

export interface PhoneHeroProps {
  /** Gold tracked-caps eyebrow over the title. */
  eyebrow: ReactNode;
  /** Hero title; production heroes carry the page h1. */
  title: ReactNode;
  /** Short intro under the title. */
  intro?: ReactNode;
  /** Intro tone: default, or soft (Music). */
  introTone?: 'default' | 'soft';
  /** In-band art plate (Music gold frame, Season frost frame). */
  art?: ReactNode;
  /** In-band art frame; default gold. */
  artFrame?: 'gold' | 'frost';
  /** Photo-top hero: the photo the title plate overlaps. */
  photo?: PhoneHeroPhoto;
  /** Photo-hero preset: standard (Visit) or tall (Dahlias). */
  photoSize?: 'standard' | 'tall';
  className?: string;
}

/**
 * Phone hero band opening the Print Edition pages: the deep-green band
 * with its gold eyebrow and display title, optionally an in-band art
 * plate, or — with photo — the photo-top hero whose title plate overlaps
 * the photo's lower edge. Spot art belongs to the sections below the
 * hero (SpotArt), as in production; packet-style heroes (Volunteer,
 * Help) compose from PacketCard, SpotArt, and PlateFrame in the routes.
 */
export function PhoneHero({
  eyebrow,
  title,
  intro,
  introTone = 'default',
  art,
  artFrame = 'gold',
  photo,
  photoSize = 'standard',
  className,
}: PhoneHeroProps): JSX.Element {
  if (photo !== undefined) {
    return (
      <section className={cx('hues-phone-hero', 'hues-phone-hero--photo', photoSize === 'tall' && 'hues-phone-hero--tall', className)}>
        <div className="hues-phone-hero__slot">
          <Image src={photo.src} alt={photo.alt} slot="band" kind="photo" priority={photo.priority ?? false} />
          <div aria-hidden="true" className="hues-phone-hero__scrim" />
        </div>
        <div className="hues-phone-hero__plate">
          <p className="hues-phone-hero__eyebrow">{eyebrow}</p>
          <h1 className="hues-phone-hero__title">{title}</h1>
          {intro !== undefined && (
            <p className={cx('hues-phone-hero__intro', introTone === 'soft' && 'hues-phone-hero__intro--soft')}>{intro}</p>
          )}
        </div>
      </section>
    );
  }
  return (
    <section className={cx('hues-phone-hero', className)}>
      <p className="hues-phone-hero__eyebrow">{eyebrow}</p>
      <h1 className="hues-phone-hero__title">{title}</h1>
      {intro !== undefined && (
        <p className={cx('hues-phone-hero__intro', introTone === 'soft' && 'hues-phone-hero__intro--soft')}>{intro}</p>
      )}
      {art !== undefined && (
        <div className={cx('hues-phone-hero__art', artFrame === 'frost' && 'hues-phone-hero__art--frost')}>{art}</div>
      )}
    </section>
  );
}
