import type { JSX } from 'react';

/**
 * Genuine waits only: button loading and first loads. Region variant for
 * loading regions; small for the button icon slot.
 */
export function Spinner({ size = 'small', label = 'Loading', className }: { size?: 'small' | 'region'; label?: string; className?: string }): JSX.Element {
  return (
    <span className={className ?? 'hues-spinner'} data-size={size} role="status">
      <span className="hues-spinner__ring" aria-hidden="true" />
      <span className="hues-visually-hidden">{label}</span>
    </span>
  );
}
