import type { JSX, ReactNode } from 'react';
import { Link } from '../media/Link';
import { cx } from '../lib/cx';

export interface RowLinkProps {
  href: string;
  current?: boolean;
  note?: ReactNode;
  children: ReactNode;
  className?: string;
}

/**
 * Link rows in the row-display role with an optional right-aligned note and
 * a current state (semibold + gold underline). FooterLink serves the footer;
 * SheetRow serves the More sheet (badge artwork slots into children).
 */
function RowLink({ href, current = false, note, children, className, rowClass }: RowLinkProps & { rowClass: string }): JSX.Element {
  return (
    <Link
      href={href}
      context="nav"
      aria-current={current ? 'page' : undefined}
      data-current={current || undefined}
      className={cx(rowClass, className)}
    >
      <span className={`${rowClass}__label`}>{children}</span>
      {note !== undefined && <span className={`${rowClass}__note`}>{note}</span>}
    </Link>
  );
}

export function FooterLink(props: RowLinkProps): JSX.Element {
  return <RowLink {...props} rowClass="hues-footer-link" />;
}

export function SheetRow(props: RowLinkProps): JSX.Element {
  return <RowLink {...props} rowClass="hues-sheet-row" />;
}
