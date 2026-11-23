import type { JSX } from 'react';
import { Link } from '../media/Link';
import { cx } from '../lib/cx';

export interface GameCardProps {
  name: string;
  href: string;
  description?: string;
  medallionSrc?: string;
  layout?: 'phone' | 'desktop';
  className?: string;
}

/** Arcade entry card: medallion art plus name, phone 2-up, desktop wide. */
export function GameCard({ name, href, description, medallionSrc, layout = 'phone', className }: GameCardProps): JSX.Element {
  return (
    <article data-layout={layout} className={cx('hues-game-card', className)}>
      <Link href={href} context="nav" className="hues-game-card__link" aria-label={name}>
        {medallionSrc !== undefined && (
          <img src={medallionSrc} alt="" aria-hidden="true" className="hues-game-card__medallion" />
        )}
        <span className="hues-game-card__name">{name}</span>
        {description !== undefined && <span className="hues-game-card__description">{description}</span>}
      </Link>
    </article>
  );
}
