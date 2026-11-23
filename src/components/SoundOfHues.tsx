'use client'

import {
  formatTime,
  playQueue,
  seekTo,
  useAudioProgress,
  usePlayerState,
  type PlayerTrack,
} from '@/components/MusicPlayer'

export type SongTrack = PlayerTrack

const t = (file: string, title: string, duration: string): SongTrack => ({
  title,
  duration,
  src: `/music/tracks/${file}`,
})

export const vocalSongs: SongTrack[] = [
  t('01-petals-open.mp3', 'Petals Open, Pale and New', '3:34'),
  t('03-petal-opener.mp3', 'Petal Opener', '3:22'),
  t('05-clippers-in-hand.mp3', 'Clippers in Hand', '3:23'),
  t('07-hummin-with-the-bees.mp3', 'Hummin’ with the Bees', '2:52'),
  t('09-zinnia-sky.mp3', 'Zinnia Sky', '3:22'),
  t('11-september-at-hues.mp3', 'September at Hues', '4:35'),
  t('13-sunflower-smile.mp3', 'Sunflower Smile', '3:12'),
  t('15-the-creek-beside.mp3', 'The Creek Beside', '2:58'),
  t('17-butterfly-waltz.mp3', 'Butterfly Waltz', '3:07'),
  t('19-imagine-a-place.mp3', 'Imagine a Place', '5:53'),
  t('21-petals-on-the-breeze.mp3', 'Petals on the Breeze', '3:22'),
  t('23-somewhere-in-the-rows.mp3', 'Somewhere in the Rows', '3:32'),
  t('25-colors-i-cant-name.mp3', 'Colors I Can’t Name', '3:10'),
  t(
    '27-pickin-flowers-dancin-for-hours.mp3',
    'Pickin’ Flowers, Dancin’ for Hours',
    '2:12',
  ),
  t('29-slow-wanderer.mp3', 'Slow Wanderer', '3:23'),
  t('31-the-quiet-corner.mp3', 'The Quiet Corner', '3:06'),
  t('33-rain-kissed-petals.mp3', 'Rain-Kissed Petals', '2:57'),
  t('35-bloom-where-youre-planted.mp3', 'Bloom Where You’re Planted', '3:33'),
  t('37-soft-light-serenade.mp3', 'Soft Light Serenade', '3:33'),
]

export const instrumentalSongs: SongTrack[] = [
  t('02-petal-opener.mp3', 'Petal Opener', '2:58'),
  t('04-clippers-in-hand.mp3', 'Clippers in Hand', '3:17'),
  t('06-rows-of-color.mp3', 'Rows of Color', '2:53'),
  t('08-hummin-with-the-bees.mp3', 'Hummin’ with the Bees', '3:00'),
  t('10-zinnia-sky.mp3', 'Zinnia Sky', '3:10'),
  t('12-dancin-in-the-dirt.mp3', 'Dancin’ in the Dirt', '2:47'),
  t('14-sunflower-smile.mp3', 'Sunflower Smile', '3:04'),
  t('16-the-creek-beside.mp3', 'The Creek Beside', '2:23'),
  t('18-butterfly-waltz.mp3', 'Butterfly Waltz', '2:45'),
  t('20-petals-on-the-breeze.mp3', 'Petals on the Breeze', '3:34'),
  t('22-somewhere-in-the-rows.mp3', 'Somewhere in the Rows', '3:16'),
  t('24-colors-i-cant-name.mp3', 'Colors I Can’t Name', '2:58'),
  t('26-slow-wanderer.mp3', 'Slow Wanderer', '3:24'),
  t('28-the-quiet-corner.mp3', 'The Quiet Corner', '3:02'),
  t('30-rain-kissed-petals.mp3', 'Rain-Kissed Petals', '3:13'),
  t('32-bloom-where-youre-planted.mp3', 'Bloom Where You’re Planted', '3:02'),
  t('34-soft-light-serenade.mp3', 'Soft Light Serenade', '3:08'),
  t('36-thank-you-garden.mp3', 'Thank You Garden', '2:58'),
  t('38-a-little-world-apart.mp3', 'A Little World Apart', '2:52'),
]

function PlayGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="ml-0.5 h-5 w-5" aria-hidden="true">
      <path d="M8 5.5v13l11-6.5-11-6.5Z" />
    </svg>
  )
}

function PauseGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
      <rect x="6.5" y="5" width="3.8" height="14" rx="1" />
      <rect x="13.7" y="5" width="3.8" height="14" rx="1" />
    </svg>
  )
}

/** Progress + seek for whichever song is loaded in the shared player. */
function Progress({ variant }: { variant: 'desktop' | 'print' }) {
  const { currentTime, duration } = useAudioProgress(true)
  const pct = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (duration <= 0) return
    const rect = e.currentTarget.getBoundingClientRect()
    const ratio = (e.clientX - rect.left) / rect.width
    seekTo(ratio * duration)
  }

  return (
    <div className="mt-2.5 pr-1 pl-14">
      <div
        className={`h-1.5 w-full cursor-pointer rounded-full ${
          variant === 'print' ? 'bg-[#f0e9d6]' : 'bg-lime-100 dark:bg-lime-800'
        }`}
        onClick={handleSeek}
        role="slider"
        aria-label="Seek"
        aria-valuemin={0}
        aria-valuemax={Math.round(duration)}
        aria-valuenow={Math.round(currentTime)}
        aria-valuetext={`${formatTime(currentTime)} of ${formatTime(duration)}`}
      >
        <div
          className={`h-full rounded-full ${
            variant === 'print' ? 'bg-[#D85434]' : 'bg-yellow-500'
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p
        className={`mt-1 text-[11px] tabular-nums ${
          variant === 'print'
            ? 'text-[#6f7f6e]'
            : 'text-lime-600 dark:text-lime-400'
        }`}
      >
        {formatTime(currentTime)} / {formatTime(duration)}
      </p>
    </div>
  )
}

function SongRow({
  groupKey,
  groupLabel,
  songs,
  index,
  variant,
}: {
  groupKey: string
  groupLabel: string
  songs: SongTrack[]
  index: number
  variant: 'desktop' | 'print'
}) {
  const player = usePlayerState()
  const song = songs[index]
  const isCurrent = player.groupKey === groupKey && player.index === index
  const isPlaying = isCurrent && player.playing

  const print = variant === 'print'
  return (
    <li className={print ? 'py-3' : 'px-6 py-4 sm:px-8'}>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => playQueue(groupKey, groupLabel, songs, index)}
          aria-label={
            isPlaying
              ? `Pause ${song.title}`
              : isCurrent
                ? `Resume ${song.title}`
                : `Play ${song.title}`
          }
          aria-pressed={isCurrent}
          className={
            print
              ? `flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition active:scale-95 ${
                  isCurrent
                    ? 'bg-[#D85434] text-white shadow-md'
                    : 'bg-[#f7f1de] text-[#23362b] ring-1 ring-[#e0d5b8]'
                }`
              : `flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition active:scale-95 ${
                  isCurrent
                    ? 'bg-yellow-400 text-lime-950 shadow-md ring-1 ring-yellow-400'
                    : 'bg-white text-lime-800 ring-1 ring-lime-200 hover:bg-lime-50 dark:bg-lime-900 dark:text-lime-100 dark:ring-lime-700 dark:hover:bg-lime-800'
                }`
          }
        >
          {isPlaying ? <PauseGlyph /> : <PlayGlyph />}
        </button>
        <div className="min-w-0 flex-1">
          <p
            className={
              print
                ? 'text-[15.5px] font-semibold'
                : 'font-semibold text-lime-800 dark:text-lime-100'
            }
          >
            {song.title}
          </p>
          {isCurrent && (
            <p
              className={
                print
                  ? 'text-[11px] font-bold tracking-[0.12em] text-[#D85434] uppercase'
                  : 'text-[11px] font-bold tracking-[0.12em] text-yellow-600 uppercase dark:text-yellow-400'
              }
            >
              {isPlaying ? 'Now playing' : 'Paused'}
            </p>
          )}
        </div>
        <p
          className={
            print
              ? 'shrink-0 text-[12.5px] text-[#6f7f6e] tabular-nums'
              : 'shrink-0 text-sm text-lime-600 tabular-nums dark:text-lime-400'
          }
        >
          {song.duration}
        </p>
      </div>
      {isCurrent && <Progress variant={variant} />}
    </li>
  )
}

function SongGroup({
  groupKey,
  groupLabel,
  heading,
  note,
  songs,
  variant,
}: {
  groupKey: string
  groupLabel: string
  heading: string
  note: string
  songs: SongTrack[]
  variant: 'desktop' | 'print'
}) {
  if (variant === 'print') {
    return (
      <div className="rounded-[28px] bg-white p-6 shadow-[0_14px_36px_rgba(28,42,33,0.08)] ring-1 ring-[#e0d5b8]">
        <h3 className="p-display text-[20px] font-[560]">{heading}</h3>
        <p className="mt-1 text-[13px] leading-relaxed text-[#6f7f6e]">
          {note}
        </p>
        <ul className="mt-2 divide-y divide-[#f0e9d6]">
          {songs.map((song, i) => (
            <SongRow
              key={song.src}
              groupKey={groupKey}
              groupLabel={groupLabel}
              songs={songs}
              index={i}
              variant={variant}
            />
          ))}
        </ul>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-lime-100 dark:border-lime-700/40">
      <div className="px-6 pt-6 sm:px-8">
        <h3 className="text-xl font-bold tracking-tight text-lime-800 dark:text-lime-100">
          {heading}
        </h3>
        <p className="mt-1 text-sm text-lime-600 dark:text-lime-400">
          {note}
        </p>
      </div>
      <ul className="divide-y divide-lime-100 dark:divide-lime-700/40">
        {songs.map((song, i) => (
          <SongRow
            key={song.src}
            groupKey={groupKey}
            groupLabel={groupLabel}
            songs={songs}
            index={i}
            variant={variant}
          />
        ))}
      </ul>
    </div>
  )
}

export function SoundOfHues({ variant }: { variant: 'desktop' | 'print' }) {
  return (
    <div className={variant === 'print' ? 'space-y-5' : 'space-y-8'}>
      <SongGroup
        groupKey="vocals"
        groupLabel="With Vocals"
        heading="With Vocals"
        note="The park, singing — the songs as you’d hear them under the string lights."
        songs={vocalSongs}
        variant={variant}
      />
      <SongGroup
        groupKey="instrumentals"
        groupLabel="Instrumentals"
        heading="Instrumentals"
        note="The same tunes, wordless — made for wandering."
        songs={instrumentalSongs}
        variant={variant}
      />
    </div>
  )
}
