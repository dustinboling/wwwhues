import type { JSX, ReactNode } from 'react';
import { Skeleton } from '../feedback/Skeleton';
import { cx } from '../lib/cx';

export interface EventCardProps {
  title: string;
  when?: string;
  scheduled?: boolean;
  /** Inline RSVP form or action; success confirms on the card itself. */
  rsvp?: ReactNode;
  loading?: boolean;
  updated?: boolean;
  className?: string;
}

/** Gather event with inline RSVP; the unscheduled variant is the warm empty state. */
export function EventCard({ title, when, scheduled = true, rsvp, loading = false, updated = false, className }: EventCardProps): JSX.Element {
  if (loading) return <Skeleton shape="card" label={`Loading ${title}`} className={className} />;
  return (
    <article data-scheduled={scheduled || undefined} data-updated={updated || undefined} className={cx('hues-event-card', className)}>
      <span className="hues-event-card__title">{title}</span>
      {when !== undefined && <span className="hues-event-card__when">{when}</span>}
      {scheduled && rsvp}
    </article>
  );
}
