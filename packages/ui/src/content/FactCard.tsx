import type { JSX } from 'react';
import { cx } from '../lib/cx';

export type FactKind = 'hours' | 'status' | 'admission' | 'animals';

export interface FactCardProps {
  kind: FactKind;
  label: string;
  value: string;
  updated?: boolean;
  className?: string;
}

/** Single-sourced park facts; live swaps crossfade inside the reserved line. */
export function FactCard({ kind, label, value, updated = false, className }: FactCardProps): JSX.Element {
  return (
    <article data-kind={kind} data-updated={updated || undefined} className={cx('hues-fact-card', className)}>
      <span className="hues-fact-card__label">{label}</span>
      <span className="hues-fact-card__value" aria-live={updated ? 'polite' : undefined}>
        {value}
      </span>
    </article>
  );
}
