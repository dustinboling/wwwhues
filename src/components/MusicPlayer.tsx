'use client'

import { useEffect, useReducer, useSyncExternalStore } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

/**
 * The Sound of Hues — site-wide shared player.
 *
 * One module-level <audio> element + a tiny external store. Because the
 * element and its state live OUTSIDE the React tree, client-side
 * navigation (which swaps page components but keeps the app alive)
 * never interrupts playback: start a song on the music page, wander
 * the site, and the music comes with you. A floating mini-player
 * (MusicFloater, mounted in both site shells) appears everywhere
 * except the music page itself.
 */

export type PlayerTrack = {
  title: string
  duration: string
  src: string
}

export type PlayerState = {
  groupKey: string | null
  groupLabel: string | null
  queue: PlayerTrack[]
  index: number
  playing: boolean
}

const IDLE: PlayerState = {
  groupKey: null,
  groupLabel: null,
  queue: [],
  index: -1,
  playing: false,
}

let state: PlayerState = IDLE
let audio: HTMLAudioElement | null = null
const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((l) => l())
}

function subscribe(cb: () => void) {
  listeners.add(cb)
  return () => {
    listeners.delete(cb)
  }
}

function getSnapshot() {
  return state
}

function getServerSnapshot() {
  return IDLE
}

export function usePlayerState() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

export function currentTrack(s: PlayerState): PlayerTrack | null {
  return s.index >= 0 ? (s.queue[s.index] ?? null) : null
}

function setState(patch: Partial<PlayerState>) {
  state = { ...state, ...patch }
  emit()
  syncMediaSession()
}

function syncMediaSession() {
  if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) {
    return
  }
  const song = currentTrack(state)
  try {
    if (!song) {
      navigator.mediaSession.metadata = null
      navigator.mediaSession.playbackState = 'none'
      return
    }
    navigator.mediaSession.metadata = new MediaMetadata({
      title: song.title,
      artist: 'Hues Floral Park',
      album: 'The Sound of Hues',
    })
    navigator.mediaSession.playbackState = state.playing ? 'playing' : 'paused'
  } catch {
    /* MediaSession is a progressive enhancement — never break playback */
  }
}

function step(delta: number) {
  if (!audio || state.queue.length === 0) return
  const next =
    (state.index + delta + state.queue.length) % state.queue.length
  loadAndPlay(next)
}

function loadAndPlay(index: number) {
  const el = getAudio()
  const song = state.queue[index]
  if (!song) return
  setState({ index })
  if (el.src !== new URL(song.src, window.location.origin).href) {
    el.src = song.src
  }
  el.currentTime = 0
  void el.play().catch(() => {})
}

function getAudio(): HTMLAudioElement {
  if (audio) return audio
  const el = new Audio()
  el.preload = 'auto'
  el.style.display = 'none'
  document.body.appendChild(el)
  el.addEventListener('ended', () => step(1))
  el.addEventListener('play', () => setState({ playing: true }))
  el.addEventListener('pause', () => setState({ playing: false }))
  audio = el

  if ('mediaSession' in navigator) {
    try {
      navigator.mediaSession.setActionHandler('play', () => togglePlay())
      navigator.mediaSession.setActionHandler('pause', () => togglePlay())
      navigator.mediaSession.setActionHandler('previoustrack', () => step(-1))
      navigator.mediaSession.setActionHandler('nexttrack', () => step(1))
    } catch {
      /* handlers are best-effort */
    }
  }
  return el
}

/** The shared element if it exists yet (never creates it). */
export function peekAudio(): HTMLAudioElement | null {
  return audio
}

/**
 * Start (or toggle) a song within its group. The group becomes the
 * queue: on ended, the next song in the group plays, wrapping at the
 * end — the same behaviour the per-row players had.
 */
export function playQueue(
  groupKey: string,
  groupLabel: string,
  songs: PlayerTrack[],
  index: number,
) {
  const el = getAudio()
  const sameSong = state.groupKey === groupKey && state.index === index
  if (sameSong && state.queue.length > 0) {
    togglePlay()
    return
  }
  state = { ...state, groupKey, groupLabel, queue: songs, index }
  emit()
  syncMediaSession()
  const song = songs[index]
  if (!song) return
  el.src = song.src
  el.currentTime = 0
  void el.play().catch(() => {})
}

export function togglePlay() {
  if (!audio || state.queue.length === 0) return
  if (audio.paused) {
    void audio.play().catch(() => {})
  } else {
    audio.pause()
  }
}

/** Stop playback entirely and put the player away. */
export function stopPlayer() {
  if (audio) {
    audio.pause()
    audio.removeAttribute('src')
    audio.load()
  }
  state = IDLE
  emit()
  syncMediaSession()
}

export function seekTo(seconds: number) {
  if (audio && Number.isFinite(seconds)) {
    audio.currentTime = Math.max(0, seconds)
  }
}

/** Live playback position for the current song's progress display. */
export function useAudioProgress(active: boolean) {
  const [, force] = useReducer((x: number) => x + 1, 0)
  const index = state.index
  const groupKey = state.groupKey
  useEffect(() => {
    if (!active) return
    const el = peekAudio()
    if (!el) return
    const update = () => force()
    update()
    el.addEventListener('timeupdate', update)
    el.addEventListener('loadedmetadata', update)
    el.addEventListener('durationchange', update)
    return () => {
      el.removeEventListener('timeupdate', update)
      el.removeEventListener('loadedmetadata', update)
      el.removeEventListener('durationchange', update)
    }
  }, [active, index, groupKey])
  const el = peekAudio()
  return {
    currentTime: el ? el.currentTime : 0,
    duration: el ? el.duration || 0 : 0,
  }
}

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M8 5.5v13l11-6.5-11-6.5Z" />
    </svg>
  )
}

function PauseIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <rect x="6.5" y="5" width="3.8" height="14" rx="1" />
      <rect x="13.7" y="5" width="3.8" height="14" rx="1" />
    </svg>
  )
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  )
}

/**
 * The floating mini-player. Mounted by both shells (desktop Layout and
 * the /m Shell2); each mount renders only its own variant. Shows when a
 * song is loaded and the visitor is somewhere other than the music
 * page; tapping the title area returns to the music page while the
 * song keeps playing.
 */
export function MusicFloater({ variant }: { variant: 'desktop' | 'print' }) {
  const player = usePlayerState()
  const pathname = usePathname()
  const song = currentTrack(player)

  const musicPath = variant === 'print' ? '/m/music' : '/music'
  if (!song || pathname === musicPath) return null

  const toggleLabel = player.playing
    ? `Pause ${song.title}`
    : `Play ${song.title}`

  if (variant === 'print') {
    return (
      <div
        className="fixed inset-x-3 z-50 mx-auto flex max-w-md items-center gap-2 rounded-[22px] bg-[#FAF6EC] py-2 pr-2 pl-4 shadow-[0_16px_40px_rgba(28,42,33,0.28)] ring-1 ring-[#e0d5b8]"
        style={{ bottom: 'calc(7.5rem + env(safe-area-inset-bottom))' }}
        role="region"
        aria-label="Now playing"
      >
        <span
          className={`h-2 w-2 shrink-0 rounded-full bg-[#D85434] ${
            player.playing ? 'animate-pulse' : 'opacity-40'
          }`}
          aria-hidden="true"
        />
        <Link
          href={musicPath}
          className="min-w-0 flex-1 py-1"
          aria-label={`${song.title} — back to the music page`}
        >
          <span className="p-display block truncate text-[15px] leading-tight font-[560] text-[#1E3A29]">
            {song.title}
          </span>
          <span className="block text-[10.5px] font-bold tracking-[0.14em] text-[#6f7f6e] uppercase">
            {player.groupLabel} · The Sound of Hues
          </span>
        </Link>
        <button
          type="button"
          onClick={togglePlay}
          aria-label={toggleLabel}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#D85434] text-white shadow-md transition active:scale-95"
        >
          {player.playing ? (
            <PauseIcon className="h-5 w-5" />
          ) : (
            <PlayIcon className="ml-0.5 h-5 w-5" />
          )}
        </button>
        <button
          type="button"
          onClick={stopPlayer}
          aria-label="Stop the music"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[#6f7f6e] transition active:scale-95"
        >
          <CloseIcon className="h-5 w-5" />
        </button>
      </div>
    )
  }

  return (
    <div
      className="fixed right-4 bottom-4 z-50 flex w-[min(92vw,24rem)] items-center gap-2 rounded-2xl bg-lime-900/95 py-2 pr-2 pl-4 shadow-2xl ring-1 ring-lime-700/60 backdrop-blur sm:right-6 sm:bottom-6 dark:bg-lime-950/95"
      role="region"
      aria-label="Now playing"
    >
      <span
        className={`h-2 w-2 shrink-0 rounded-full bg-yellow-400 ${
          player.playing ? 'animate-pulse' : 'opacity-40'
        }`}
        aria-hidden="true"
      />
      <Link
        href={musicPath}
        className="min-w-0 flex-1 py-1"
        aria-label={`${song.title} — back to the music page`}
      >
        <span className="block truncate text-[15px] leading-tight font-semibold text-lime-50">
          {song.title}
        </span>
        <span className="block text-[10.5px] font-bold tracking-[0.14em] text-lime-300 uppercase">
          {player.groupLabel} · The Sound of Hues
        </span>
      </Link>
      <button
        type="button"
        onClick={togglePlay}
        aria-label={toggleLabel}
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-yellow-400 text-lime-950 shadow-md transition hover:bg-yellow-300 active:scale-95"
      >
        {player.playing ? (
          <PauseIcon className="h-5 w-5" />
        ) : (
          <PlayIcon className="ml-0.5 h-5 w-5" />
        )}
      </button>
      <button
        type="button"
        onClick={stopPlayer}
        aria-label="Stop the music"
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-lime-300 transition hover:text-white active:scale-95"
      >
        <CloseIcon className="h-5 w-5" />
      </button>
    </div>
  )
}

export { formatTime }
