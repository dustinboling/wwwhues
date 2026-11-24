import type { JSX, ReactNode } from 'react';
import { Link } from '../media/Link';
import { Skeleton } from '../feedback/Skeleton';
import { cx } from '../lib/cx';

export interface PacketCardProps {
  title: string;
  href?: string;
  children?: ReactNode;
  loading?: boolean;
  updated?: boolean;
  className?: string;
}

/**
 * Signature stitched seed-packet card (locked construction: surface stock,
 * line border, card elevation, stitched gold outline). Plain or linked;
 * loading renders the skeleton twin; updates wash.
 */
export function PacketCard({ title, href, children, loading = false, updated = false, className }: PacketCardProps): JSX.Element {
  if (loading) return <Skeleton shape="card" label={`Loading ${title}`} className={className} />;
  const body = (
    <>
      <span className="hues-packet-card__title">{title}</span>
      {children}
    </>
  );
  return (
    <article data-updated={updated || undefined} className={cx('hues-packet-card', className)}>
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
