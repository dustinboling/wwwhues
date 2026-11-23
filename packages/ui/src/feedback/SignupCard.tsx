import type { JSX, ReactNode } from 'react';
import { cx } from '../lib/cx';

/** Phone form of a table row: the component swaps, the data and actions do not. */
export function SignupCard({
  title,
  lines,
  actions,
  updated = false,
  className,
}: {
  title: string;
  lines: ReactNode[];
  actions?: ReactNode;
  updated?: boolean;
  className?: string;
}): JSX.Element {
  return (
    <article data-updated={updated || undefined} className={cx('hues-signup-card', className)}>
      <span className="hues-signup-card__title">{title}</span>
      <ul className="hues-signup-card__lines">
        {lines.map((line, index) => (
          <li key={index} className="hues-signup-card__line">
            {line}
          </li>
        ))}
      </ul>
      {actions !== undefined && <div className="hues-signup-card__actions">{actions}</div>}
    </article>
  );
}
