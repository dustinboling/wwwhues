import type { JSX, ReactNode } from 'react';
import { cx } from '../lib/cx';

export interface AdminShellProps {
  variant?: 'dashboard' | 'seeds-admin' | 'board-admin';
  wordmark: ReactNode;
  sectionTitle: string;
  account?: ReactNode;
  children: ReactNode;
  className?: string;
}

/**
 * Admin chrome, iPad-first: compact top bar (wordmark, section title,
 * account/sign-out), compact density, no tab bar. No visible forms anywhere:
 * creation and editing open in Dialog from a button or + control.
 */
export function AdminShell({ variant = 'board-admin', wordmark, sectionTitle, account, children, className }: AdminShellProps): JSX.Element {
  return (
    <div className={cx('hues-admin-shell', className)} data-variant={variant} data-density="compact">
      <header className="hues-admin-shell__bar">
        <span className="hues-admin-shell__wordmark">{wordmark}</span>
        <h1 className="hues-admin-shell__title">{sectionTitle}</h1>
        <div className="hues-admin-shell__account">{account}</div>
      </header>
      <div className="hues-admin-shell__body">{children}</div>
    </div>
  );
}
