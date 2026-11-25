import type { JSX, ReactNode } from 'react';
import { cx } from '../lib/cx';

export interface SiteFooterProps {
  /**
   * Desktop: the rounded deep-green card (lockup, Follow-along chips,
   * link rows, address block, copyright). Phone: the compact Print
   * Edition ending (procession art, script logo, sign-off, contact
   * line, short link row). The app renders both and shows exactly one
   * per breakpoint, like the TopBar/SiteHeader pair.
   */
  variant: 'desktop' | 'phone';
  /** Script logo artwork. */
  logo: ReactNode;
  /** Desktop FLORAL PARK overline; unused on phone. */
  overline?: ReactNode;
  /** Italic brand sign-off line. */
  signoff?: ReactNode;
  /** Desktop Follow-along label; unused on phone. */
  socialsLabel?: ReactNode;
  /** Desktop chip row; unused on phone. */
  socials?: ReactNode;
  /** Link inventory: full sitemap on desktop, short row on phone. */
  sitemap: ReactNode;
  /** Desktop address block, phone single contact line. */
  address?: ReactNode;
  /** Desktop copyright line; unused on phone. */
  copyright?: ReactNode;
  /** Phone procession art; unused on desktop. */
  art?: ReactNode;
  className?: string;
}

/**
 * Shell footer contract, in two compositions ported from production
 * (desktop: src/components/Footer.tsx; phone: src/app/m/page.tsx, minus
 * "Full website" and "The print edition" per Q5). Neither composition
 * carries headings — the footer closes the page, it never outlines it.
 */
export function SiteFooter({
  variant,
  logo,
  overline,
  signoff,
  socialsLabel,
  socials,
  sitemap,
  address,
  copyright,
  art,
  className,
}: SiteFooterProps): JSX.Element {
  if (variant === 'phone') {
    return (
      <footer className={cx('hues-site-footer', 'hues-site-footer--phone', className)}>
        {art !== undefined && <div className="hues-site-footer__art">{art}</div>}
        <span className="hues-site-footer__logo">{logo}</span>
        {signoff !== undefined && <p className="hues-site-footer__signoff">{signoff}</p>}
        {address !== undefined && <p className="hues-site-footer__contact">{address}</p>}
        <nav aria-label="Footer" className="hues-site-footer__links">
          {sitemap}
        </nav>
      </footer>
    );
  }
  return (
    <footer className={cx('hues-site-footer', 'hues-site-footer--desktop', className)}>
      <div className="hues-site-footer__card">
        <div className="hues-site-footer__inner">
          <div className="hues-site-footer__top">
            <div className="hues-site-footer__brand">
              <span className="hues-site-footer__logo">{logo}</span>
              {overline !== undefined && <span className="hues-site-footer__overline">{overline}</span>}
              {signoff !== undefined && <p className="hues-site-footer__signoff">{signoff}</p>}
            </div>
            {socials !== undefined && (
              <div className="hues-site-footer__socials">
                {socialsLabel !== undefined && <p className="hues-site-footer__socials-label">{socialsLabel}</p>}
                <div className="hues-site-footer__chips">{socials}</div>
              </div>
            )}
          </div>
          <div className="hues-site-footer__rule" aria-hidden="true">
            <i />
          </div>
          <div className="hues-site-footer__bottom">
            <nav aria-label="Footer" className="hues-site-footer__nav">
              {sitemap}
            </nav>
            {address !== undefined && <address className="hues-site-footer__address">{address}</address>}
          </div>
          {copyright !== undefined && <p className="hues-site-footer__copyright">{copyright}</p>}
        </div>
      </div>
    </footer>
  );
}
