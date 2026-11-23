import type { JSX } from 'react';
import { Image } from '../media/Image';
import { Skeleton } from '../feedback/Skeleton';
import { cx } from '../lib/cx';

export interface FlowerCardProps {
  name: string;
  group: string;
  plateSrc?: string;
  plateAlt?: string;
  /** U-pick versus look-and-linger mark. */
  pick?: 'u-pick' | 'linger';
  layout?: 'grid' | 'stack';
  loading?: boolean;
  className?: string;
}

/** Season flower-type card: padded plate, type name, group, pick mark. */
export function FlowerCard({ name, group, plateSrc, plateAlt, pick, layout = 'grid', loading = false, className }: FlowerCardProps): JSX.Element {
  if (loading) return <Skeleton shape="card" label={`Loading ${name}`} className={className} />;
  return (
    <article data-layout={layout} className={cx('hues-flower-card', className)}>
      {plateSrc !== undefined && (
        <Image src={plateSrc} alt={plateAlt ?? `${name} plate`} kind="plate" slot="plate" ratio="1/1" className="hues-flower-card__plate" />
      )}
      <span className="hues-flower-card__name">{name}</span>
      <span className="hues-flower-card__group">{group}</span>
      {pick !== undefined && <span className="hues-flower-card__pick">{pick === 'u-pick' ? 'U-pick' : 'Look and linger'}</span>}
    </article>
  );
}
