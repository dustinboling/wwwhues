import type { JSX, ReactNode } from 'react';
import { Link } from '../media/Link';
import { Icon } from '../media/Icon';
import { BackPill } from '../actions/BackPill';
import { cx } from '../lib/cx';

export interface GameHeaderProps {
  backHref?: string;
  backLabel?: string;
  logo: ReactNode;
  /** Sound toggle frame rendered by the shell and bound by each game (v3 contract). */
  soundToggle?: boolean;
  soundOn?: boolean;
  onSoundChange?: (on: boolean) => void;
  account?: ReactNode;
  className?: string;
}

/** Absorbed Shell Kit v3 header: back pill, absolutely centered logo, sound and account rounds. */
export function GameHeader({ backHref = '/arcade', backLabel = 'Arcade', logo, soundToggle = true, soundOn = true, onSoundChange, account, className }: GameHeaderProps): JSX.Element {
  return (
    <header className={cx('hues-game-header', className)}>
      <BackPill href={backHref}>{backLabel}</BackPill>
      <Link href="/" context="nav" aria-label="Hues home" className="hues-game-header__logo">
        {logo}
      </Link>
      <div className="hues-game-header__cluster">
        {soundToggle && (
          <button
            type="button"
            aria-pressed={soundOn}
            aria-label={soundOn ? 'Mute game sound' : 'Unmute game sound'}
            onClick={() => onSoundChange?.(!soundOn)}
            className="hues-button hues-button--icon-round hues-game-header__sound"
          >
            <Icon name={soundOn ? 'speaker-on' : 'speaker-off'} size={20} />
          </button>
        )}
        {account}
      </div>
    </header>
  );
}
