import type { JSX } from 'react';
import { cx } from '../lib/cx';

/** Track lists load metadata only: none by default (Perf #14 byte policy). */
export const TRACK_LIST_PRELOAD = 'none' as const;

export interface TrackRowProps {
  title: string;
  duration?: string;
  playing?: boolean;
  paused?: boolean;
  onPlay?: () => void;
  className?: string;
}

/**
 * One song in a set list. The playing row carries the live dot plus
 * aria-current; paused keeps its place without the dot pulse.
 */
export function TrackRow({ title, duration, playing = false, paused = false, onPlay, className }: TrackRowProps): JSX.Element {
  return (
    <div data-playing={playing || undefined} data-paused={paused || undefined} className={cx('hues-track-row', className)}>
      <button
        type="button"
        onClick={onPlay}
        aria-current={playing ? true : undefined}
        aria-label={playing ? `Playing: ${title}` : `Play ${title}`}
        className="hues-track-row__play"
      >
        <span aria-hidden="true" className="hues-track-row__dot" />
        <span className="hues-track-row__title">{title}</span>
        {duration !== undefined && <span className="hues-track-row__duration">{duration}</span>}
      </button>
    </div>
  );
}
