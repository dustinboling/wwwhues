import type { JSX, ReactNode } from 'react';
import { Link } from '../media/Link';
import { Icon } from '../media/Icon';
import { Skeleton } from '../feedback/Skeleton';
import { cx } from '../lib/cx';

export interface ContentCardProps {
  eyebrow?: string;
  title: string;
  description?: string;
  cta?: string;
  href?: string;
  children?: ReactNode;
  loading?: boolean;
  updated?: boolean;
  className?: string;
}

/**
 * Plain raised card: eyebrow, title, description, gold-ink CTA row. When
 * linked, the whole card is the link with the title's stretched hit area;
 * the name comes from the card content (a shorter override would fail
 * label-in-name, WCAG 2.5.3).
 */
export function ContentCard({ eyebrow, title, description, cta, href, children, loading = false, updated = false, className }: ContentCardProps): JSX.Element {
  if (loading) return <Skeleton shape="card" label={`Loading ${title}`} className={className} />;
  const body = (
    <>
      {eyebrow !== undefined && <span className="hues-content-card__eyebrow">{eyebrow}</span>}
      <span className="hues-content-card__title">{title}</span>
      {description !== undefined && <span className="hues-content-card__description">{description}</span>}
      {children}
      {cta !== undefined && (
        <span className="hues-content-card__cta">
          {cta}
          <Icon name="chevron-right" size={16} />
        </span>
      )}
    </>
  );
  return (
    <article data-updated={updated || undefined} className={cx('hues-content-card', className)}>
      {href === undefined ? (
        body
      ) : (
        <Link href={href} context="nav" className="hues-content-card__link">
          {body}
        </Link>
      )}
    </article>
  );
}
