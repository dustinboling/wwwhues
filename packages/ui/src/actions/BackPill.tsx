import type { JSX } from 'react';
import { Link } from '../media/Link';
import { Icon } from '../media/Icon';
import { cx } from '../lib/cx';

/** Game header return pill ("‹ Arcade"), a real link with its label. */
export function BackPill({ href, children, className }: { href: string; children: string; className?: string }): JSX.Element {
  return (
    <Link href={href} context="nav" aria-label={`Back to ${children}`} className={cx('hues-back-pill', className)}>
      <Icon name="chevron-left" size={16} />
      <span>{children}</span>
    </Link>
  );
}
