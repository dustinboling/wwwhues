import type { JSX, ReactNode } from 'react';
import { cx } from '../lib/cx';

export interface SiteFooterProps {
  sitemap: ReactNode;
  accountLink?: ReactNode;
  socials?: ReactNode;
  className?: string;
}

/** Shell footer contract: full sitemap, account link, socials; themed per property. */
export function SiteFooter({ sitemap, accountLink, socials, className }: SiteFooterProps): JSX.Element {
  return (
    <footer className={cx('hues-site-footer', className)}>
      <nav aria-label="Footer" className="hues-site-footer__sitemap">
        {sitemap}
      </nav>
      <div className="hues-site-footer__meta">
        {accountLink}
        {socials}
      </div>
    </footer>
  );
}
