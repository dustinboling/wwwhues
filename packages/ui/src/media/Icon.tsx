import type { JSX } from 'react';
import { cx } from '../lib/cx';

export type IconName =
  | 'person'
  | 'speaker-on'
  | 'speaker-off'
  | 'chevron-up'
  | 'chevron-down'
  | 'chevron-left'
  | 'chevron-right'
  | 'play'
  | 'pause'
  | 'stop'
  | 'next'
  | 'close'
  | 'check'
  | 'info'
  | 'warning'
  | 'error'
  | 'share'
  | 'external'
  | 'plus'
  | 'search'
  | 'home'
  | 'calendar'
  | 'pin'
  | 'menu';

/**
 * Formalized interface glyph set (Mina §1.8): 24px grid, stroke-based, round
 * caps and joins, 1.8 stroke at 20-24px sizes, content in the 20px live
 * area. Sizes 16/20/24. Cloisonné medallions, MenuBadges, the Seasons disc,
 * and illustration are Elena's artwork, never glyphs. Per-network social
 * brand glyphs are UNVERIFIED (no ruling names the networks); the generic
 * share glyph ships and brand marks arrive as artwork slots.
 */
const PATHS: Record<IconName, string> = {
  person: 'M12 11.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM5.5 20c1.2-3.2 3.6-4.8 6.5-4.8s5.3 1.6 6.5 4.8',
  'speaker-on': 'M4 9.5v5h3.5L12 18.5v-13L7.5 9.5H4Zm12.5 2.5a3.5 3.5 0 0 0-2-3.2M16.5 15.2a3.5 3.5 0 0 0-2-3.2',
  'speaker-off': 'M4 9.5v5h3.5L12 18.5v-13L7.5 9.5H4Zm12 1 4 4m0-4-4 4',
  'chevron-up': 'm6 14.5 6-6 6 6',
  'chevron-down': 'm6 9.5 6 6 6-6',
  'chevron-left': 'm14.5 6-6 6 6 6',
  'chevron-right': 'm9.5 6 6 6-6 6',
  play: 'M8 5.5v13l10-6.5-10-6.5Z',
  pause: 'M8 5.5v13M16 5.5v13',
  stop: 'M7.5 7.5h9v9h-9v-9Z',
  next: 'M7 5.5v13l7.5-6.5L7 5.5Zm9.5 0v13',
  close: 'm7 7 10 10M17 7 7 17',
  check: 'm5 12.5 4.5 4.5L19 7.5',
  info: 'M12 11v5.5M12 7.5v.5M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z',
  warning: 'M12 5 3.5 19.5h17L12 5Zm0 6v4m0 2.5v.5',
  error: 'M12 8v5m0 3v.5M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z',
  share: 'M9 12.5a2.5 2.5 0 1 0 0-.1M15.5 6.5a2.5 2.5 0 1 0 0-.1M15.5 17.5a2.5 2.5 0 1 0 0-.1M11 11l4.5-2.8M11 13l4.5 2.8',
  external: 'M10 5H5v14h14v-5m0-9h-6m6 0v6m0-6L11 13',
  plus: 'M12 5.5v13M5.5 12h13',
  search: 'M11 17.5a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13Zm4.8 1.3 3.7 3.7',
  home: 'M4.5 11 12 4.5 19.5 11M6.5 9.5V19.5h11V9.5',
  calendar: 'M5 6.5h14V19.5H5V6.5Zm0 4.5h14M9 4v3.5M15 4v3.5',
  pin: 'M12 20s6.5-6 6.5-10.5A6.5 6.5 0 0 0 5.5 9.5C5.5 14 12 20 12 20Zm0-7.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z',
  menu: 'M5 7.5h14M5 12h14M5 16.5h14',
};

export interface IconProps {
  name: IconName;
  /** Optical size ladder step. */
  size?: 16 | 20 | 24;
  /** Accessible label; omit only for redundant decoration (aria-hidden). */
  label?: string;
  className?: string;
}

export function Icon({ name, size = 20, label, className }: IconProps): JSX.Element {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={label === undefined ? true : undefined}
      role={label === undefined ? undefined : 'img'}
      aria-label={label}
      className={cx('hues-icon', className)}
      focusable="false"
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
