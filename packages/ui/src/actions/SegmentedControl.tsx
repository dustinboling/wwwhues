import { useId } from 'react';
import type { JSX } from 'react';
import { cx } from '../lib/cx';

export interface Segment {
  value: string;
  label: string;
}

export interface SegmentedControlProps {
  label: string;
  segments: Segment[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

/**
 * Two-to-four segment switch: radiogroup + aria-checked (A11y #5). The
 * selected segment slides at motion.state; segments never resize.
 */
export function SegmentedControl({ label, segments, value, onChange, className }: SegmentedControlProps): JSX.Element {
  const groupId = useId();
  return (
    <div role="radiogroup" aria-label={label} className={cx('hues-segmented', className)}>
      {segments.map((segment) => {
        const selected = segment.value === value;
        return (
          <button
            key={segment.value}
            type="button"
            role="radio"
            id={`${groupId}-${segment.value}`}
            aria-checked={selected}
            data-selected={selected || undefined}
            onClick={() => onChange(segment.value)}
            className="hues-segmented__segment"
          >
            {segment.label}
          </button>
        );
      })}
    </div>
  );
}
