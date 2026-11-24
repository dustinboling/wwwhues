import type { JSX } from 'react';
import { Link } from '../media/Link';
import { cx } from '../lib/cx';

export interface PaginationProps {
  /** Total pages (at least 1). */
  pages: number;
  /** Current page, 1-based. */
  page: number;
  /** Href builder for a page number (page 1 links the clean route). */
  hrefFor: (page: number) => string;
  onNavigate?: (page: number) => void;
  className?: string;
}

/**
 * Seeds lists pagination: real anchor links between prerendered paginated
 * URLs (Data #1.6), with the current page marked and out-of-range input
 * clamped by the app (the route itself 404s out of range).
 */
export function Pagination({ pages, page, hrefFor, onNavigate, className }: PaginationProps): JSX.Element {
  const current = Math.min(Math.max(page, 1), Math.max(pages, 1));
  const numbers = Array.from({ length: Math.max(pages, 1) }, (_, index) => index + 1);
  return (
    <nav aria-label="Pagination" className={cx('hues-pagination', className)}>
      <ul className="hues-pagination__list">
        {numbers.map((number) => {
          const isCurrent = number === current;
          return (
            <li key={number}>
              {isCurrent ? (
                <span aria-current="page" className="hues-pagination__current">
                  {number}
                </span>
              ) : (
                <Link
                  href={hrefFor(number)}
                  context="nav"
                  onClick={onNavigate === undefined ? undefined : (event) => {
                    event.preventDefault();
                    onNavigate(number);
                  }}
                  className="hues-pagination__link"
                >
                  {String(number)}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
