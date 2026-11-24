import type { JSX } from 'react';
import { Image } from '../media/Image';
import { Skeleton } from '../feedback/Skeleton';
import { cx } from '../lib/cx';

export interface CultivarCardProps {
  name: string;
  latinName?: string;
  photoSrc?: string;
  photoAlt?: string;
  loading?: boolean;
  className?: string;
}

/** Dahlia collection card for the grid densities. Latin names set italic. */
export function CultivarCard({ name, latinName, photoSrc, photoAlt, loading = false, className }: CultivarCardProps): JSX.Element {
  if (loading) return <Skeleton shape="card" label={`Loading ${name}`} className={className} />;
  return (
    <article className={cx('hues-cultivar-card', className)}>
      {photoSrc !== undefined && (
        <Image src={photoSrc} alt={photoAlt ?? name} slot="card" ratio="4/3" className="hues-cultivar-card__photo" />
      )}
      <span className="hues-cultivar-card__name">{name}</span>
      {latinName !== undefined && (
        <span className="hues-cultivar-card__latin" lang="la">
          {latinName}
        </span>
      )}
    </article>
  );
}
