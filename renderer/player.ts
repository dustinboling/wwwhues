import { useEffect, useReducer, useSyncExternalStore } from 'react'
import { musicSetByKey, type MusicTrack } from '../content/music'

/**
 * The Sound of Hues — the shell's one audio engine (Nadia §4.4).
 *
 * Ported from src/components/MusicPlayer.tsx: one module-level <audio>
 * element plus a tiny external store. The element and its state live
 * OUTSIDE the React tree, so client-side navigation (which swaps route
 * components but keeps the shell alive) never interrupts playback.
 * Player state is shell state, never route state: /music is a view
 * onto this engine, and the MiniPlayer is its shell bar.
 *
 * Carried over: sets as queues, auto-advance within a set (wrapping),
 * per-song play, Media Session integration. New with the shell:
 * an interrupted session restores paused at the same song (never
 * auto-playing) from the persisted set key + index — the queue itself
 * rebuilds from content/music.ts, never from storage.
 *
 * No volume or mute controls: the current site's player has none, and
 * neither does Mina's MiniPlayer anatomy — parity is the absence.
 */

export type PlayerTrack = MusicTrack

export interface PlayerState {
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

const STORAGE_KEY = 'hues.player'

let state: PlayerState = IDLE
let audio: HTMLAudioElement | null = null
const listeners = new Set<() => void>()

function emit(): void {
  listeners.forEach((listener) => listener())
}

function subscribe(callback: () => void): () => void {
  listeners.add(callback)
  return () => {
    listeners.delete(callback)
  }
}

function getSnapshot(): PlayerState {
  return state
}

function getServerSnapshot(): PlayerState {
  return IDLE
}

export function usePlayerState(): PlayerState {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

export function currentTrack(player: PlayerState): PlayerTrack | null {
  return player.index >= 0 ? (player.queue[player.index] ?? null) : null
}

function setState(patch: Partial<PlayerState>): void {
  state = { ...state, ...patch }
  persist()
  emit()
  syncMediaSession()
}

function syncMediaSession(): void {
  if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) {
    return
  }
  const song = currentTrack(state)
  try {
    if (song === null) {
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

/** Wrap-around queue step (pure: unit-tested). */
export function stepIndex(index: number, delta: number, length: number): number {
  if (length <= 0) return -1
  return (index + delta + length) % length
}

function step(delta: number): void {
  if (audio === null || state.queue.length === 0) return
  loadAndPlay(stepIndex(state.index, delta, state.queue.length))
}

/** The next song in the set, wrapping — the MiniPlayer's next control. */
export function nextTrack(): void {
  step(1)
}

/** The previous song in the set, wrapping (Media Session only). */
export function previousTrack(): void {
  step(-1)
}

function loadAndPlay(index: number): void {
  const el = getAudio()
  const song = state.queue[index]
  if (song === undefined) return
  setState({ index })
  if (el.src !== new URL(song.src, window.location.origin).href) {
    el.src = song.src
  }
  el.currentTime = 0
  void el.play().catch(() => {})
}

function getAudio(): HTMLAudioElement {
  if (audio !== null) return audio
  const el = new Audio()
  // Metadata only until the visitor presses play (Perf #14 byte
  // policy): the track lists never download audio speculatively.
  el.preload = 'metadata'
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
 * Start (or toggle) a song within its set. The set becomes the queue:
 * on ended, the next song in the set plays, wrapping at the end.
 */
export function playQueue(
  groupKey: string,
  groupLabel: string,
  songs: PlayerTrack[],
  index: number,
): void {
  const el = getAudio()
  const sameSong = state.groupKey === groupKey && state.index === index
  if (sameSong && state.queue.length > 0) {
    togglePlay()
    return
  }
  state = { ...state, groupKey, groupLabel, queue: songs, index }
  persist()
  emit()
  syncMediaSession()
  const song = songs[index]
  if (song === undefined) return
  el.src = song.src
  el.currentTime = 0
  void el.play().catch(() => {})
}

export function togglePlay(): void {
  if (state.queue.length === 0) return
  const song = currentTrack(state)
  if (song === null) return
  const el = getAudio()
  if (el.src !== new URL(song.src, window.location.origin).href) {
    el.src = song.src
  }
  if (el.paused) {
    void el.play().catch(() => {})
  } else {
    el.pause()
  }
}

/** Stop playback entirely and put the player away. */
export function stopPlayer(): void {
  if (audio !== null) {
    audio.pause()
    audio.removeAttribute('src')
    audio.load()
  }
  state = IDLE
  persist()
  emit()
  syncMediaSession()
}

export function seekTo(seconds: number): void {
  if (audio !== null && Number.isFinite(seconds)) {
    audio.currentTime = Math.max(0, seconds)
  }
}

/** Live playback position for the current song's progress display. */
export function useAudioProgress(active: boolean): { currentTime: number; duration: number } {
  const [, force] = useReducer((count: number) => count + 1, 0)
  const index = state.index
  const groupKey = state.groupKey
  useEffect(() => {
    if (!active) return
    const el = peekAudio()
    if (el === null) return
    const update = (): void => force()
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
    currentTime: el?.currentTime ?? 0,
    duration: el?.duration ?? 0,
  }
}

export function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00'
  const minutes = Math.floor(seconds / 60)
  const rest = Math.floor(seconds % 60)
  return `${minutes}:${rest.toString().padStart(2, '0')}`
}

export interface RestoredPlayback {
  groupKey: string
  index: number
}

/** Parse the persisted set key + index (pure: unit-tested). */
export function parseRestoredPlayback(raw: string | null): RestoredPlayback | null {
  if (raw === null || raw === '') return null
  try {
    const parsed = JSON.parse(raw) as Partial<RestoredPlayback>
    if (typeof parsed.groupKey !== 'string' || !Number.isInteger(parsed.index)) return null
    const set = musicSetByKey(parsed.groupKey)
    if (set === undefined) return null
    if ((parsed.index as number) < 0 || (parsed.index as number) >= set.tracks.length) return null
    return { groupKey: parsed.groupKey, index: parsed.index as number }
  } catch {
    return null
  }
}

/** Serialize the persisted set key + index (pure: unit-tested). */
export function serializeRestoredPlayback(restored: RestoredPlayback): string {
  return JSON.stringify(restored)
}

function storage(): Storage | null {
  try {
    if (typeof localStorage === 'undefined') return null
    return localStorage
  } catch {
    return null
  }
}

function persist(): void {
  const store = storage()
  if (store === null) return
  try {
    if (state.groupKey === null || state.index < 0) {
      store.removeItem(STORAGE_KEY)
      return
    }
    store.setItem(STORAGE_KEY, serializeRestoredPlayback({ groupKey: state.groupKey, index: state.index }))
  } catch {
    /* persistence is best-effort (private mode, quota) */
  }
}

/**
 * Restore an interrupted session paused at its song — called once from
 * the shell on mount (client-only). Never auto-plays; a corrupt or
 * stale entry restores to idle.
 */
export function restorePlayback(): void {
  if (state.groupKey !== null) return
  const store = storage()
  if (store === null) return
  let raw: string | null = null
  try {
    raw = store.getItem(STORAGE_KEY)
  } catch {
    return
  }
  const restored = parseRestoredPlayback(raw)
  if (restored === null) return
  const set = musicSetByKey(restored.groupKey)
  if (set === undefined) return
  const song = set.tracks[restored.index]
  if (song === undefined) return
  state = {
    groupKey: set.key,
    groupLabel: set.label,
    queue: set.tracks,
    index: restored.index,
    playing: false,
  }
  const el = getAudio()
  el.src = song.src
  emit()
  syncMediaSession()
}
