// Build-time live-data snapshots (§2.1 live-data regions).
//
// The prerender embeds the board state as of the build and labels it with
// its date — it never poses as live. Client revalidation lands in Slice D
// with the /api proxy; until then this script is the freshness mechanism,
// run at the start of every build:app (and by the 6-hour spa-rebuild
// workflow, so a snapshot can never age past one park day).
//
// Why a script, not a +data fetch: the snapshot must be identical on the
// prerendered page and on client-side navigation. A +data fetch would
// re-run in the browser (hitting the workers.dev origins cross-origin,
// likely CORS-blocked) and disagree with the prerender. Importing a
// committed JSON file keeps server and client on the same bytes, and the
// committed file keeps builds green when the APIs are unreachable — the
// fetchedAt date on the page says honestly how old it is.
//
// Shape-checked before write: a malformed API response never clobbers a
// good snapshot. On fetch failure with no snapshot on disk, an empty
// snapshot is written so the build still succeeds (the pages' empty
// states are the honest fallback).

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dir = join(root, 'content', 'snapshots')

const PLAY_API_URL =
  process.env.PLAY_API_URL ?? 'https://hues-play-api.dustin-boling.workers.dev'
const VOLUNTEER_API_URL =
  process.env.VOLUNTEER_API_URL ?? 'https://hues-volunteers-api.dustin-boling.workers.dev'

async function fetchJson(url) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 20000)
  try {
    const res = await fetch(url, { signal: controller.signal })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.json()
  } finally {
    clearTimeout(timer)
  }
}

function isRecord(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function validPlayState(value) {
  return (
    isRecord(value) &&
    Array.isArray(value.events) &&
    Array.isArray(value.items) &&
    Array.isArray(value.paverSizes)
  )
}

function validVolunteerState(value) {
  return (
    isRecord(value) &&
    Array.isArray(value.tasks) &&
    Array.isArray(value.slots) &&
    isRecord(value.counts)
  )
}

async function snapshot(name, url, validate, empty) {
  const path = join(dir, `${name}.json`)
  try {
    const data = await fetchJson(url)
    if (!validate(data)) {
      console.warn(`fetch-snapshots: ${url} returned an unexpected shape; keeping the previous snapshot.`)
      return
    }
    mkdirSync(dir, { recursive: true })
    writeFileSync(path, `${JSON.stringify({ fetchedAt: new Date().toISOString(), data }, null, 2)}\n`)
    console.log(`fetch-snapshots: wrote content/snapshots/${name}.json`)
  } catch (error) {
    try {
      readFileSync(path, 'utf8')
      console.warn(
        `fetch-snapshots: ${url} unreachable (${error instanceof Error ? error.message : error}); keeping the previous snapshot.`,
      )
    } catch {
      mkdirSync(dir, { recursive: true })
      writeFileSync(path, `${JSON.stringify({ fetchedAt: new Date().toISOString(), data: empty }, null, 2)}\n`)
      console.warn(
        `fetch-snapshots: ${url} unreachable and no snapshot on disk; wrote an empty snapshot.`,
      )
    }
  }
}

await snapshot('play', `${PLAY_API_URL}/public-state`, validPlayState, {
  events: [],
  items: [],
  paverSizes: [],
})
await snapshot('volunteers', `${VOLUNTEER_API_URL}/public-state`, validVolunteerState, {
  tasks: [],
  slots: [],
  counts: {},
})
