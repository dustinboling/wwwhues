import type { JSX, MouseEvent } from 'react'
import { Icon, Image, PhoneHero } from '@hues/ui'
import { PARK_SIGNOFF } from '../../content/site'
import {
  MUSIC_HERO,
  MUSIC_SETS,
  MUSIC_SIGNOFF,
  MUSIC_STAY_TUNED,
  SOUND_OF_HUES,
  type MusicSet,
  type MusicTrack,
} from '../../content/music'
import {
  formatTime,
  playQueue,
  seekTo,
  useAudioProgress,
  usePlayerState,
} from '../../renderer/player'
import '../../renderer/content.css'
import './music.css'

function Eyebrow({ children }: { children: string }): JSX.Element {
  return <p className="c-eyebrow">{children}</p>
}

/** Progress + seek for whichever song is loaded in the shell player. */
function Progress(): JSX.Element {
  const { currentTime, duration } = useAudioProgress(true)
  const pct = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0

  const handleSeek = (event: MouseEvent<HTMLDivElement>): void => {
    if (duration <= 0) return
    const rect = event.currentTarget.getBoundingClientRect()
    const ratio = (event.clientX - rect.left) / rect.width
    seekTo(ratio * duration)
  }

  return (
    <div className="music-progress">
      <div
        className="music-progress__bar"
        onClick={handleSeek}
        role="slider"
        aria-label="Seek"
        aria-valuemin={0}
        aria-valuemax={Math.round(duration)}
        aria-valuenow={Math.round(currentTime)}
        aria-valuetext={`${formatTime(currentTime)} of ${formatTime(duration)}`}
      >
        <div className="music-progress__fill" style={{ width: `${pct}%` }} />
      </div>
      <p className="music-progress__times">
        {formatTime(currentTime)} / {formatTime(duration)}
      </p>
    </div>
  )
}

function SongRow({ set, song, index }: { set: MusicSet; song: MusicTrack; index: number }): JSX.Element {
  const player = usePlayerState()
  const isCurrent = player.groupKey === set.key && player.index === index
  const isPlaying = isCurrent && player.playing

  return (
    <li className="music-row" data-audio-src={song.src}>
      <div className="music-row__line">
        <button
          type="button"
          onClick={() => playQueue(set.key, set.label, set.tracks, index)}
          aria-label={
            isPlaying
              ? `Pause ${song.title}`
              : isCurrent
                ? `Resume ${song.title}`
                : `Play ${song.title}`
          }
          aria-pressed={isCurrent}
          className="music-row__play"
          data-current={isCurrent || undefined}
        >
          <Icon name={isPlaying ? 'pause' : 'play'} size={20} />
        </button>
        <div className="music-row__names">
          <p className="music-row__title">{song.title}</p>
          {isCurrent && (
            <p className="music-row__state">{isPlaying ? 'Now playing' : 'Paused'}</p>
          )}
        </div>
        <p className="music-row__duration">{song.duration}</p>
      </div>
      {isCurrent && <Progress />}
    </li>
  )
}

function SongSet({ set }: { set: MusicSet }): JSX.Element {
  return (
    <div className="music-set hues-packet-card">
      <h3 className="music-set__title">{set.label}</h3>
      <p className="music-set__note">{set.note}</p>
      <ul className="music-set__songs">
        {set.tracks.map((song, index) => (
          <SongRow key={song.src} set={set} song={song} index={index} />
        ))}
      </ul>
    </div>
  )
}

// Music (/music): the shell player's full view (P8). Phone gains
// production's hero band treatment — the deep-green band with the /m
// heading (Q1), the soft intro, and the dusk painting inside it —
// while desktop keeps its Slice B packet hero. Only the hero splits
// by breakpoint: the Sound packet, both set lists, Stay Tuned, and
// the sign-off are identical at both widths and render once, so the
// served HTML carries every song exactly once and the shell player
// keeps a single row per track. The phone hero carries the page h1
// (the /m words) and the desktop title renders as h2 (same styling),
// keeping the one-h1 prerender contract. Both heroes share the one
// painting key, so the single image preload serves both.
export default function Page(): JSX.Element {
  return (
    <div className="music">
      <div className="music-hero-m">
        <PhoneHero
          eyebrow={MUSIC_HERO.eyebrow}
          title={MUSIC_HERO.tagline}
          intro={MUSIC_HERO.intro}
          introTone="soft"
          art={
            <Image
              src={MUSIC_HERO.artKey}
              alt={MUSIC_HERO.artAlt}
              kind="photo"
              slot="band"
              ratio="3/2"
              priority
            />
          }
          routeTitle
        />
      </div>

      <div className="c-page">
        <div className="music-hero-d">
          <section className="c-head" aria-labelledby="music-title">
            <Eyebrow>{MUSIC_HERO.eyebrow}</Eyebrow>
            {/* h2, not h1: the phone hero already carries the page h1 and
                the prerender contract is one h1 per page. Same id, class,
                and text, so the desktop rendering is unchanged. */}
            <h2 id="music-title" className="c-title">
              {MUSIC_HERO.heading}
            </h2>
            <p className="c-tagline">{MUSIC_HERO.tagline}</p>
            <p className="c-lede">{MUSIC_HERO.intro}</p>
          </section>

          <figure className="c-plate hues-packet-card">
            <Image
              src={MUSIC_HERO.artKey}
              alt={MUSIC_HERO.artAlt}
              slot="hero"
              ratio="21/9"
              focalPoint="50% 35%"
              priority
            />
          </figure>
        </div>

        <div className="music-body">
          <section className="c-section" aria-labelledby="sound-of-hues">
            <div className="music-sound hues-packet-card">
              <p className="music-sound__badge">
                <span aria-hidden="true" className="music-sound__dot" />
                {SOUND_OF_HUES.badge}
              </p>
              <h2 id="sound-of-hues" className="c-section__title">
                {SOUND_OF_HUES.heading}
              </h2>
              <p className="c-lede c-lede--left">{SOUND_OF_HUES.copy}</p>
              <p className="music-sound__tagline">{SOUND_OF_HUES.tagline}</p>
            </div>
            <div className="music-sets">
              {MUSIC_SETS.map((set) => (
                <SongSet key={set.key} set={set} />
              ))}
            </div>
          </section>

          <section className="c-section" aria-labelledby="stay-tuned">
            <Eyebrow>{MUSIC_STAY_TUNED.eyebrow}</Eyebrow>
            <h2 id="stay-tuned" className="c-section__title">
              {MUSIC_STAY_TUNED.heading}
            </h2>
            <p className="c-lede c-lede--left">{MUSIC_STAY_TUNED.body}</p>
          </section>

          <section className="c-section" aria-label="Sign-off">
            <div className="music-signoff hues-packet-card">
              <p className="c-lede c-lede--left">{MUSIC_SIGNOFF.body}</p>
              <p className="music-signoff__park">{PARK_SIGNOFF}</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
