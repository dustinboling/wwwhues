import type { JSX, ReactNode } from 'react';
import { cx } from '../lib/cx';

export interface StepNumeralProps {
  /** The step number (usually 1-based). */
  value: ReactNode;
  className?: string;
}

/**
 * Round deep-green step numeral from How U-Cut Works: a 32px deep disc
 * carrying a paper numeral at the label size and semibold weight.
 */
export function StepNumeral({ value, className }: StepNumeralProps): JSX.Element {
  return <span className={cx('hues-step-numeral', className)}>{value}</span>;
}
