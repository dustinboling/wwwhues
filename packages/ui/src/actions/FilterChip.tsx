import type { ButtonHTMLAttributes, JSX, ReactNode } from 'react';
import { cx } from '../lib/cx';

export interface FilterChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
  /** Single-select chips render in a radiogroup; see SingleFilterGroup. */
  role?: 'button' | 'radio';
  checked?: boolean;
  count?: number;
  children: ReactNode;
}

/**
 * In-place filters. Multi-select: button + aria-pressed. Single-select: use
 * SingleFilterGroup (radiogroup + aria-checked). Selection renders in the
 * same frame as the tap; counts sit in a fixed-width tabular slot.
 */
export function FilterChip({ selected = false, role, checked, count, className, children, ...rest }: FilterChipProps): JSX.Element {
  const radio = role === 'radio';
  return (
    <button
      type="button"
      role={radio ? 'radio' : undefined}
      aria-pressed={radio ? undefined : selected}
      aria-checked={radio ? (checked ?? selected) : undefined}
      data-selected={selected || undefined}
      className={cx('hues-chip', className)}
      {...rest}
    >
      <span className="hues-chip__label">{children}</span>
      {count !== undefined && (
        <span className="hues-chip__count" aria-label={`${count} results`}>
          {count}
        </span>
      )}
    </button>
  );
}

/** Single-select chip group: radiogroup semantics per A11y #5. */
export function SingleFilterGroup({ label, className, children }: { label: string; className?: string; children: ReactNode }): JSX.Element {
  return (
    <div role="radiogroup" aria-label={label} className={cx('hues-chip-group', className)}>
      {children}
    </div>
  );
}
