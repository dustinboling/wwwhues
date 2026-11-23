import type { JSX } from 'react';
import { cx } from '../lib/cx';

/** Packet tear line. Static dress, hidden from assistive tech. */
export function PerforationDivider({ className }: { className?: string }): JSX.Element {
  return <div aria-hidden="true" className={cx('hues-perforation', className)} />;
}

/** Gold rule with center diamond. Static dress, hidden from assistive tech. */
export function GoldRule({ className }: { className?: string }): JSX.Element {
  return (
    <div aria-hidden="true" className={cx('hues-gold-rule', className)}>
      <span className="hues-gold-rule__diamond" />
    </div>
  );
}
