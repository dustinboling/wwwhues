import type { JSX, ReactNode } from 'react';
import { Link } from '../media/Link';
import { Skeleton } from '../feedback/Skeleton';
import { cx } from '../lib/cx';

/** Stitched-packet corner radii, production-measured (22/24/26/28px). */
export type PacketCardRadius = 'sm' | 'md' | 'lg' | 'xl';

export interface PacketCardProps {
  title: string;
  href?: string;
  children?: ReactNode;
  loading?: boolean;
  updated?: boolean;
  /** Corner radius; default xl, the desktop flagship packet (28px). */
  radius?: PacketCardRadius;
  /** Flush-top art (season/info card image tops); the padded body follows. */
  art?: ReactNode;
  className?: string;
}

/**
 * Signature stitched seed-packet card (locked construction: surface stock,
 * line border, card elevation, stitched gold outline). Plain or linked;
 * loading renders the skeleton twin; updates wash. Radius follows the
 * production packets (xl default); art bleeds flush to the card top as on
 * the production season cards. Art height is intrinsic to the art node —
 * route compositions pin fixed heights in P6+ with measured tokens.
 */
export function PacketCard({
  title,
  href,
  children,
  loading = false,
  updated = false,
  radius = 'xl',
  art,
  className,
}: PacketCardProps): JSX.Element {
  if (loading) return <Skeleton shape="card" label={`Loading ${title}`} className={className} />;
  const body = (
    <>
      {art !== undefined && <div className="hues-packet-card__art">{art}</div>}
      <span className="hues-packet-card__title">{title}</span>
      {children}
    </>
  );
  return (
    <article
      data-updated={updated || undefined}
      className={cx('hues-packet-card', `hues-packet-card--radius-${radius}`, art !== undefined && 'hues-packet-card--art', className)}
    >
      {href === undefined ? (
        body
      ) : (
        <Link href={href} context="nav" className="hues-packet-card__link" aria-label={title}>
          {body}
        </Link>
      )}
    </article>
  );
}
