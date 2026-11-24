import type { JSX, ReactNode } from 'react';
import { Image } from '../media/Image';
import { Skeleton } from '../feedback/Skeleton';
import { StaleLabel } from '../feedback/StaleLabel';
import { cx } from '../lib/cx';

export type SponsorStatus = 'active' | 'filled' | 'interest-only';

export interface SponsorItemCardProps {
  name: string;
  status: SponsorStatus;
  imageSrc?: string;
  imageAlt?: string;
  /** Reserve entry (button or light interest form). */
  action?: ReactNode;
  /** Stale availability carries its age rather than posing as live. */
  checkedLabel?: string;
  loading?: boolean;
  updated?: boolean;
  className?: string;
}

/** Sponsor item with status line and reserve entry; refetches on focus return. */
export function SponsorItemCard({ name, status, imageSrc, imageAlt, action, checkedLabel, loading = false, updated = false, className }: SponsorItemCardProps): JSX.Element {
  if (loading) return <Skeleton shape="card" label={`Loading ${name}`} className={className} />;
  return (
    <article data-status={status} data-updated={updated || undefined} className={cx('hues-sponsor-card', className)}>
      {imageSrc !== undefined && <Image src={imageSrc} alt={imageAlt ?? name} slot="card" ratio="4/3" className="hues-sponsor-card__image" />}
      <span className="hues-sponsor-card__name">{name}</span>
      <span className="hues-sponsor-card__status">
        {status === 'active' ? 'Available to sponsor' : status === 'filled' ? 'Sponsored' : 'Join the interest list'}
      </span>
      {checkedLabel !== undefined && <StaleLabel label={checkedLabel} />}
      {action}
    </article>
  );
}
