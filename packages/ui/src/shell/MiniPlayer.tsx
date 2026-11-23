import { useEffect, useRef } from 'react';
import type { JSX } from 'react';
import { Link } from '../media/Link';
import { Icon } from '../media/Icon';
import { useAnnouncer } from '../lib/announce';
import { cx } from '../lib/cx';

export interface Track {
  title: string;
  setLabel: string;
  href?: string;
}

export interface MiniPlayerProps {
  /** Rendered only when a track is loaded; idle is absent, not collapsed. */
  track: Track | null;
  playing?: boolean;
  onPlayPause?: () => void;
  onStop?: () => void;
  onNext?: () => void;
  className?: string;
}

/**
 * Shell music mini-player, one component for both form factors: phone floats
 * above the tab bar, desktop docks bottom-right. Anatomy dot, title (linking
 * back to /music), next, play/pause, stop. Track changes crossfade the title
 * and announce politely without stealing focus; the bar never resizes.
 */
export function MiniPlayer({ track, playing = false, onPlayPause, onStop, onNext, className }: MiniPlayerProps): JSX.Element | null {
  const announce = useAnnouncer();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const lastTitle = useRef<string | null>(null);

  // The shell reserves the measured player height while present.
  useEffect(() => {
    const node = rootRef.current;
    if (node === null || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(() => {
      document.documentElement.style.setProperty('--shell-player-height', `${node.offsetHeight}px`);
    });
    observer.observe(node);
    return () => {
      observer.disconnect();
      document.documentElement.style.removeProperty('--shell-player-height');
    };
  }, [track !== null]);

  useEffect(() => {
    if (track !== null && track.title !== lastTitle.current) {
      lastTitle.current = track.title;
      announce(`Now playing: ${track.title}`);
    }
    if (track === null) lastTitle.current = null;
  }, [track, announce]);

  if (track === null) return null;
  return (
    <div ref={rootRef} className={cx('hues-player', className)} data-playing={playing || undefined}>
      <span className="hues-player__dot" aria-hidden="true" />
      <div key={track.title} className="hues-player__titles" data-track={track.title}>
        <Link href={track.href ?? '/music'} context="nav" className="hues-player__title">
          {track.title}
        </Link>
        <span className="hues-player__set">{track.setLabel}</span>
      </div>
      <button
        type="button"
        onClick={onNext}
        aria-label={onNext === undefined ? undefined : 'Next track'}
        disabled={onNext === undefined || undefined}
        className="hues-button hues-button--icon-round hues-player__next"
      >
        <Icon name="next" size={20} />
      </button>
      <button
        type="button"
        onClick={onPlayPause}
        aria-label={playing ? `Pause ${track.title}` : `Play ${track.title}`}
        className="hues-player__toggle"
      >
        <Icon name={playing ? 'pause' : 'play'} size={20} />
      </button>
      <button
        type="button"
        onClick={onStop}
        aria-label={`Stop ${track.title}`}
        className="hues-button hues-button--icon-round hues-player__stop"
      >
        <Icon name="close" size={20} />
      </button>
    </div>
  );
}
