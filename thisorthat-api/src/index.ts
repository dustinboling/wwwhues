/*
  hues-thisorthat-api — data + auth service for the hues.flowers
  This or That cultivar voting section. A single Durable Object
  (SQLite) serializes every read/write (same lesson as Volunteers:
  KV's eventual consistency lost writes; D1 is unavailable).

  The Next.js site proxies to this worker server-side; browsers only
  ever talk to hues.flowers. Price/vendor fields NEVER leave this
  worker except on admin-authenticated endpoints.
*/

import { SEED_CULTIVARS } from './seed'

interface Env {
  BOARD: DurableObjectNamespace
  SETUP_CODE_HASH: string
}

/* ---------------- crypto helpers (mirrors volunteer worker) ---------------- */

function toHex(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf)
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

function fromHex(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16)
  }
  return bytes
}

async function sha256Hex(text: string): Promise<string> {
  return toHex(
    await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)),
  )
}

function randomHex(bytes: number): string {
  return toHex(crypto.getRandomValues(new Uint8Array(bytes)))
}

async function hashPassword(password: string, saltHex: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  )
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: fromHex(saltHex) as BufferSource, iterations: 100000, hash: 'SHA-256' },
    key,
    256,
  )
  return toHex(bits)
}

async function hmacHex(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  return toHex(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message)))
}

const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000

async function createAdminToken(secret: string): Promise<string> {
  const exp = Date.now() + SESSION_TTL_MS
  const sig = await hmacHex(secret, `admin:${exp}`)
  return `${exp}.${sig}`
}

async function verifyAdminToken(secret: string | null, token: string | null): Promise<boolean> {
  if (!secret || !token) return false
  const [expStr, sig] = token.split('.')
  const exp = Number(expStr)
  if (!exp || Number.isNaN(exp) || exp < Date.now() || !sig) return false
  const expected = await hmacHex(secret, `admin:${exp}`)
  if (expected.length !== sig.length) return false
  let diff = 0
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ sig.charCodeAt(i)
  return diff === 0
}

/*
  Voter session token: voterId.exp.sig. Normal sessions sign
  `voter:<id>:<exp>` (30-day TTL); preview sessions sign
  `voter-preview:<id>:<exp>` (24-hour TTL) so a verified token also
  tells us whether it is a preview session — the string shape is the
  same, only the signed message differs.
*/
const PREVIEW_TTL_MS = 24 * 60 * 60 * 1000
const PREVIEW_LINK_TTL_MS = 48 * 60 * 60 * 1000
const PREVIEW_PHONE = '+10000000001'

async function createVoterToken(
  secret: string,
  voterId: string,
  preview = false,
): Promise<string> {
  const exp = Date.now() + (preview ? PREVIEW_TTL_MS : SESSION_TTL_MS)
  const sig = await hmacHex(
    secret,
    `${preview ? 'voter-preview' : 'voter'}:${voterId}:${exp}`,
  )
  return `${voterId}.${exp}.${sig}`
}

async function verifyVoterToken(
  secret: string | null,
  token: string | null,
): Promise<{ id: string; preview: boolean } | null> {
  if (!secret || !token) return null
  const parts = token.split('.')
  if (parts.length !== 3) return null
  const [voterId, expStr, sig] = parts
  const exp = Number(expStr)
  if (!exp || Number.isNaN(exp) || exp < Date.now() || !sig) return null
  for (const preview of [false, true]) {
    const expected = await hmacHex(
      secret,
      `${preview ? 'voter-preview' : 'voter'}:${voterId}:${exp}`,
    )
    if (expected.length !== sig.length) continue
    let diff = 0
    for (let i = 0; i < expected.length; i++)
      diff |= expected.charCodeAt(i) ^ sig.charCodeAt(i)
    if (diff === 0) return { id: voterId, preview }
  }
  return null
}

function newId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}${Date.now().toString(36)}`
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

function normalizeUSPhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, '')
  let ten = ''
  if (digits.length === 10) ten = digits
  else if (digits.length === 11 && digits.startsWith('1')) ten = digits.slice(1)
  else return null
  if (!/^[2-9]\d{9}$/.test(ten)) return null
  return `+1${ten}`
}

/* ---------------- Durable Object ---------------- */

interface CultivarRow {
  id: string
  name: string
  type: string
  form: string
  color: string
  color_family: string
  photo_url: string
  available: number
  excluded: number
  cheapest_vendor: string
  cheapest_price: number | null
  vendor_note: string
  vendors: string
  bloom_size: string | null
  elo: number
  wins: number
  losses: number
  matchups: number
}

export class ThisOrThatBoard {
  private sql: SqlStorage
  private env: Env
  private seeded = false

  constructor(ctx: DurableObjectState, env: Env) {
    this.sql = ctx.storage.sql
    this.env = env
    this.sql.exec(`CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT)`)
    this.sql.exec(`CREATE TABLE IF NOT EXISTS cultivars (
      id TEXT PRIMARY KEY, name TEXT, type TEXT, form TEXT, color TEXT,
      color_family TEXT, photo_url TEXT, available INTEGER, excluded INTEGER,
      cheapest_vendor TEXT, cheapest_price REAL, vendor_note TEXT, vendors TEXT,
      elo REAL DEFAULT 1500, wins INTEGER DEFAULT 0, losses INTEGER DEFAULT 0,
      matchups INTEGER DEFAULT 0)`)
    this.sql.exec(`CREATE TABLE IF NOT EXISTS voters (
      id TEXT PRIMARY KEY, name TEXT, phone TEXT UNIQUE, votes_cast INTEGER DEFAULT 0,
      opted_out INTEGER DEFAULT 0, created_at TEXT, last_active TEXT)`)
    this.sql.exec(`CREATE TABLE IF NOT EXISTS codes (
      id TEXT PRIMARY KEY, phone TEXT, code_hash TEXT, expires_at INTEGER,
      attempts INTEGER DEFAULT 0, used INTEGER DEFAULT 0, ip TEXT, created_at TEXT)`)
    this.sql.exec(`CREATE TABLE IF NOT EXISTS pairs (
      token TEXT PRIMARY KEY, voter_id TEXT, a_id TEXT, b_id TEXT,
      created_at TEXT, used INTEGER DEFAULT 0)`)
    this.sql.exec(`CREATE TABLE IF NOT EXISTS votes (
      id TEXT PRIMARY KEY, voter_id TEXT, winner_id TEXT, loser_id TEXT, created_at TEXT)`)
    this.sql.exec(`CREATE TABLE IF NOT EXISTS sms_log (
      id TEXT PRIMARY KEY, phone TEXT, body TEXT, direction TEXT, created_at TEXT)`)
    this.sql.exec(`CREATE TABLE IF NOT EXISTS preview_links (
      token_hash TEXT PRIMARY KEY, created_at TEXT, expires_at INTEGER, used_at TEXT)`)
    // Entry throttle log (Dusty 2026-11-12: texting removed — entry is
    // now just name + mobile with no code, so /enter is unauthenticated
    // and gets simple per-phone / per-IP daily caps recorded here).
    this.sql.exec(`CREATE TABLE IF NOT EXISTS entry_events (
      id TEXT PRIMARY KEY, phone TEXT, ip TEXT, created_at TEXT)`)
    // Preview-mode columns on tables that predate the feature.
    const voterCols = [...this.sql.exec('PRAGMA table_info(voters)')].map(
      (r) => (r as { name: string }).name,
    )
    if (!voterCols.includes('is_preview')) {
      this.sql.exec('ALTER TABLE voters ADD COLUMN is_preview INTEGER DEFAULT 0')
    }
    const voteCols = [...this.sql.exec('PRAGMA table_info(votes)')].map(
      (r) => (r as { name: string }).name,
    )
    if (!voteCols.includes('preview')) {
      this.sql.exec('ALTER TABLE votes ADD COLUMN preview INTEGER DEFAULT 0')
    }
    const cultivarCols = [...this.sql.exec('PRAGMA table_info(cultivars)')].map(
      (r) => (r as { name: string }).name,
    )
    if (!cultivarCols.includes('bloom_size')) {
      this.sql.exec('ALTER TABLE cultivars ADD COLUMN bloom_size TEXT')
    }
    // Four-bloom rounds (Dusty 2026-10-30: pick 1 of 4): a round row
    // gains two more member columns. Legacy rows keep c_id/d_id NULL
    // and still vote as two-bloom pairs.
    const pairCols = [...this.sql.exec('PRAGMA table_info(pairs)')].map(
      (r) => (r as { name: string }).name,
    )
    if (!pairCols.includes('c_id')) {
      this.sql.exec('ALTER TABLE pairs ADD COLUMN c_id TEXT')
    }
    if (!pairCols.includes('d_id')) {
      this.sql.exec('ALTER TABLE pairs ADD COLUMN d_id TEXT')
    }
  }

  private mixesRemoved = false

  // Dusty 2026-10-26: dahlia mixes come OUT of the game — voters pick
  // single cultivars only. One-time removal of the six mix entries
  // from the live board (they're already gone from the seed, so a
  // fresh board never sees them). Any votes/pairs that referenced a
  // mix go with it, and votes_cast is recomputed from what remains.
  private removeMixes() {
    if (this.mixesRemoved) return
    this.mixesRemoved = true
    if (this.meta('mixes_removed_v1') === '1') return
    const MIX_IDS = [
      'dahlia-blazing-autumn-mix',
      'dahlia-passionate-lover-mix',
      'dahlia-rainbow-mix',
      'dahlia-summer-elegance-mix',
      'dahlia-sunny-pastel-mix',
      'dahlia-sunshine-mix',
    ]
    const marks = MIX_IDS.map(() => '?').join(', ')
    this.sql.exec(`DELETE FROM votes WHERE winner_id IN (${marks}) OR loser_id IN (${marks})`, ...MIX_IDS, ...MIX_IDS)
    this.sql.exec(`DELETE FROM pairs WHERE a_id IN (${marks}) OR b_id IN (${marks})`, ...MIX_IDS, ...MIX_IDS)
    this.sql.exec(`DELETE FROM cultivars WHERE id IN (${marks}) OR form = 'Mixed'`, ...MIX_IDS)
    this.sql.exec('UPDATE voters SET votes_cast = (SELECT COUNT(*) FROM votes WHERE votes.voter_id = voters.id)')
    this.setMeta('mixes_removed_v1', '1')
  }

  private dupesRemoved = false

  // Dusty 2026-10-29: four cultivars were in the game twice — once per
  // supplier catalog, under spelling variants (Belle of Bamera /
  // Belle Of Barmera, Break Out / Breakout, Copperboy / Copper Boy,
  // Lindas Baby / Linda'S Baby; same photo on both copies). The seed
  // now carries one merged entry per cultivar (cheapest offer kept,
  // vendor lists combined). One-time cleanup of the live board:
  // refresh the four keeper rows from the merged seed, then remove
  // the duplicate rows and anything that referenced them. All four
  // pairs were at zero votes when merged, so no rankings are lost.
  private removeDuplicateCultivars() {
    if (this.dupesRemoved) return
    this.dupesRemoved = true
    if (this.meta('dupes_removed_v1') === '1') return
    const DUP_IDS = [
      'dahlia-belle-of-bamera',
      'dahlia-break-out',
      'dahlia-copperboy',
      'dahlia-lindas-baby',
    ]
    const KEEP_IDS = [
      'dahlia-belle-of-barmera',
      'dahlia-breakout',
      'dahlia-copper-boy',
      'dahlia-linda-s-baby',
    ]
    for (const c of SEED_CULTIVARS) {
      if (!KEEP_IDS.includes(c.id)) continue
      this.sql.exec(
        `UPDATE cultivars SET name = ?, form = ?, color = ?, color_family = ?,
           photo_url = ?, available = ?, cheapest_vendor = ?, cheapest_price = ?,
           vendor_note = ?, vendors = ?, bloom_size = ? WHERE id = ?`,
        c.name, c.form, c.color, c.color_family, c.photo_url, c.available,
        c.cheapest_vendor, c.cheapest_price, c.vendor_note, c.vendors,
        c.bloom_size, c.id,
      )
    }
    const marks = DUP_IDS.map(() => '?').join(', ')
    this.sql.exec(`DELETE FROM votes WHERE winner_id IN (${marks}) OR loser_id IN (${marks})`, ...DUP_IDS, ...DUP_IDS)
    this.sql.exec(`DELETE FROM pairs WHERE a_id IN (${marks}) OR b_id IN (${marks})`, ...DUP_IDS, ...DUP_IDS)
    this.sql.exec(`DELETE FROM cultivars WHERE id IN (${marks})`, ...DUP_IDS)
    this.sql.exec('UPDATE voters SET votes_cast = (SELECT COUNT(*) FROM votes WHERE votes.voter_id = voters.id)')
    this.setMeta('dupes_removed_v1', '1')
  }

  private cleanupV2Done = false

  // Dusty 2026-10-29 (later): pot dahlias OUT of the game entirely —
  // he grows tall garden dahlias only. The four Gallery-series entries
  // (the seed's own form field says "Gallery": Art Fair, Leonardo,
  // Monet, Valentin) plus Park Princess and Firepot are deleted, not
  // just excluded. Same pass merges three more supplier-spelling
  // duplicate pairs spotted in the picker review: Cornel Brons /
  // Cornel Bronze (same photo), Thomas A. Edison / Thomas Edison
  // (same photo), Karma Maarten Zwaan / Maarten de Zwaan. Keepers are
  // refreshed from the merged seed first; zero votes existed.
  private removePotAndMoreDuplicates() {
    if (this.cleanupV2Done) return
    this.cleanupV2Done = true
    if (this.meta('cleanup_v2_done') === '1') return
    const GONE_IDS = [
      'dahlia-cornel-brons',
      'dahlia-thomas-edison',
      'dahlia-maarten-de-zwaan',
      'dahlia-art-fair',
      'dahlia-leonardo',
      'dahlia-monet',
      'dahlia-valentin',
      'dahlia-park-princess',
      'dahlia-firepot',
    ]
    const KEEP_IDS = [
      'dahlia-cornel-bronze',
      'dahlia-thomas-a-edison',
      'dahlia-karma-maarten-zwaan',
    ]
    for (const c of SEED_CULTIVARS) {
      if (!KEEP_IDS.includes(c.id)) continue
      this.sql.exec(
        `UPDATE cultivars SET name = ?, form = ?, color = ?, color_family = ?,
           photo_url = ?, available = ?, cheapest_vendor = ?, cheapest_price = ?,
           vendor_note = ?, vendors = ?, bloom_size = ? WHERE id = ?`,
        c.name, c.form, c.color, c.color_family, c.photo_url, c.available,
        c.cheapest_vendor, c.cheapest_price, c.vendor_note, c.vendors,
        c.bloom_size, c.id,
      )
    }
    const marks = GONE_IDS.map(() => '?').join(', ')
    this.sql.exec(`DELETE FROM votes WHERE winner_id IN (${marks}) OR loser_id IN (${marks})`, ...GONE_IDS, ...GONE_IDS)
    this.sql.exec(`DELETE FROM pairs WHERE a_id IN (${marks}) OR b_id IN (${marks})`, ...GONE_IDS, ...GONE_IDS)
    this.sql.exec(`DELETE FROM cultivars WHERE id IN (${marks})`, ...GONE_IDS)
    this.sql.exec('UPDATE voters SET votes_cast = (SELECT COUNT(*) FROM votes WHERE votes.voter_id = voters.id)')
    this.setMeta('cleanup_v2_done', '1')
  }

  private bloomBackfilled = false

  // The live board was seeded before bloom sizes were enriched into the
  // seed data — fill them in (by cultivar id, only where still NULL) on
  // first touch of each instance. Never overwrites or wipes anything.
  private backfillBloomSizes() {
    if (this.bloomBackfilled) return
    this.bloomBackfilled = true
    for (const c of SEED_CULTIVARS) {
      if (c.bloom_size) {
        this.sql.exec(
          'UPDATE cultivars SET bloom_size = ? WHERE id = ? AND bloom_size IS NULL',
          c.bloom_size, c.id,
        )
      }
    }
  }

  private photosBackfilled = false

  // Photo self-hosting migration (Dusty 2026-11-12: NEVER hotlink —
  // every game photo is hosted on hues.flowers). One-time rewrite of
  // live photo_url values to the seed's self-hosted URLs, by cultivar
  // id, only where the value actually changes. Touches photo_url and
  // nothing else: Elo, wins/losses, votes, voters, pairs, exclusions
  // and availability all stay exactly as they are. Cultivars absent
  // from the seed (e.g. rows retained for history) are left alone.
  private backfillSelfHostedPhotos() {
    if (this.photosBackfilled) return
    this.photosBackfilled = true
    if (this.meta('photos_selfhosted_v1') === '1') return
    for (const c of SEED_CULTIVARS) {
      if (c.photo_url && c.photo_url.startsWith('https://hues.flowers/cultivar-photos/')) {
        this.sql.exec(
          'UPDATE cultivars SET photo_url = ? WHERE id = ? AND photo_url IS NOT ?',
          c.photo_url, c.id, c.photo_url,
        )
      }
    }
    this.setMeta('photos_selfhosted_v1', '1')
  }

  private optimizedBackfilled = false

  // Optimized-photo migration (2026-11-12, page-load pass): the
  // originals averaged ~116 KB and ran to 2.8 MB; the /opt/ WebP
  // variants average ~42 KB at picker size. Same one-time,
  // flag-gated rewrite as v1 — photo_url only, nothing else moves.
  private backfillOptimizedPhotos() {
    if (this.optimizedBackfilled) return
    this.optimizedBackfilled = true
    if (this.meta('photos_optimized_v2') === '1') return
    for (const c of SEED_CULTIVARS) {
      if (c.photo_url && c.photo_url.includes('/cultivar-photos/opt/')) {
        this.sql.exec(
          'UPDATE cultivars SET photo_url = ? WHERE id = ? AND photo_url IS NOT ?',
          c.photo_url, c.id, c.photo_url,
        )
      }
    }
    this.setMeta('photos_optimized_v2', '1')
  }

  // Full-board recompute, used by /reset-me: wipe every cultivar
  // back to a fresh 1500 / 0 / 0 / 0, then replay ALL remaining
  // non-preview votes in the canonical order (created_at ASC,
  // rowid ASC — the same order /my-list replays a voter's votes),
  // applying each vote row as one matchup with the EXACT algorithm
  // the /vote path applies incrementally: same expected-score
  // formula, same K (32, dropping to 16 once that cultivar's own
  // matchups reach 30 at the time of the matchup), same rounding
  // to 1 decimal after every matchup. Because the replay reads the
  // running (rounded) values exactly as the vote path reads the
  // stored ones, the result is identical to the board history
  // would have produced without the removed votes.
  private recomputeBoard() {
    this.sql.exec(
      'UPDATE cultivars SET elo = 1500, wins = 0, losses = 0, matchups = 0',
    )
    const rows = [...this.sql.exec(
      'SELECT winner_id, loser_id FROM votes WHERE COALESCE(preview, 0) = 0 ORDER BY created_at ASC, rowid ASC',
    )] as unknown as Array<{ winner_id: string; loser_id: string }>
    const state = new Map<
      string,
      { elo: number; wins: number; losses: number; matchups: number }
    >()
    const get = (id: string) => {
      let s = state.get(id)
      if (!s) {
        s = { elo: 1500, wins: 0, losses: 0, matchups: 0 }
        state.set(id, s)
      }
      return s
    }
    for (const v of rows) {
      const w = get(v.winner_id)
      const l = get(v.loser_id)
      const ew = 1 / (1 + Math.pow(10, (l.elo - w.elo) / 400))
      const el = 1 / (1 + Math.pow(10, (w.elo - l.elo) / 400))
      const kw = w.matchups >= 30 ? 16 : 32
      const kl = l.matchups >= 30 ? 16 : 32
      w.elo = Math.round((w.elo + kw * (1 - ew)) * 10) / 10
      l.elo = Math.round((l.elo + kl * (0 - el)) * 10) / 10
      w.wins += 1
      w.matchups += 1
      l.losses += 1
      l.matchups += 1
    }
    for (const [id, s] of state) {
      this.sql.exec(
        'UPDATE cultivars SET elo = ?, wins = ?, losses = ?, matchups = ? WHERE id = ?',
        s.elo, s.wins, s.losses, s.matchups, id,
      )
    }
  }

  private seedIfEmpty() {
    if (this.seeded) return
    this.seeded = true
    const rows = [...this.sql.exec('SELECT COUNT(*) AS n FROM cultivars')]
    if ((rows[0] as { n: number }).n > 0) return
    for (const c of SEED_CULTIVARS) {
      this.sql.exec(
        'INSERT INTO cultivars (id, name, type, form, color, color_family, photo_url, available, excluded, cheapest_vendor, cheapest_price, vendor_note, vendors, bloom_size, elo, wins, losses, matchups) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?, ?, 1500, 0, 0, 0)',
        c.id, c.name, c.type, c.form, c.color, c.color_family, c.photo_url,
        c.available, c.cheapest_vendor, c.cheapest_price, c.vendor_note, c.vendors, c.bloom_size,
      )
    }
  }

  private meta(key: string): string | null {
    const rows = [...this.sql.exec('SELECT value FROM meta WHERE key = ?', key)]
    return rows.length ? (rows[0] as { value: string }).value : null
  }

  private setMeta(key: string, value: string) {
    this.sql.exec(
      'INSERT INTO meta (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
      key, value,
    )
  }

  private voterSecret(): string {
    let s = this.meta('voter_secret')
    if (!s) {
      s = randomHex(32)
      this.setMeta('voter_secret', s)
    }
    return s
  }

  private setupDone(): boolean {
    return this.meta('setup_done') === '1'
  }

  private async adminAuthed(request: Request): Promise<boolean> {
    return verifyAdminToken(this.meta('session_secret'), request.headers.get('X-Session'))
  }

  private async voterSession(
    request: Request,
  ): Promise<{ id: string; preview: boolean } | null> {
    const session = await verifyVoterToken(
      this.meta('voter_secret'),
      request.headers.get('X-Voter-Session'),
    )
    if (!session) return null
    const rows = [...this.sql.exec('SELECT id FROM voters WHERE id = ?', session.id)]
    if (!rows.length) return null
    // The old opted_out session block is gone with texting itself
    // (Dusty 2026-11-12): no texts are sent, so the flag no longer
    // gates anything. Existing rows/flags are left untouched.
    return session
  }

  private previewVoterId(): string | null {
    const rows = [...this.sql.exec('SELECT id FROM voters WHERE is_preview = 1 LIMIT 1')]
    return rows.length ? (rows[0] as { id: string }).id : null
  }

  private async mintPreviewLink(): Promise<{ token: string; url: string; expiresAt: number }> {
    const token = randomHex(24)
    const expiresAt = Date.now() + PREVIEW_LINK_TTL_MS
    this.sql.exec(
      'INSERT INTO preview_links (token_hash, created_at, expires_at, used_at) VALUES (?, ?, ?, NULL)',
      await sha256Hex(token), new Date().toISOString(), expiresAt,
    )
    return {
      token,
      url: `https://hues.flowers/this-or-that/preview/${token}`,
      expiresAt,
    }
  }

  private clearPreviewData() {
    this.sql.exec('DELETE FROM votes WHERE preview = 1')
    const pid = this.previewVoterId()
    if (pid) {
      this.sql.exec('DELETE FROM votes WHERE voter_id = ?', pid)
      this.sql.exec('DELETE FROM pairs WHERE voter_id = ?', pid)
      this.sql.exec('DELETE FROM voters WHERE id = ?', pid)
    }
    this.sql.exec('DELETE FROM preview_links')
  }

  private pool(): Array<CultivarRow> {
    return [...this.sql.exec(
      "SELECT * FROM cultivars WHERE type = 'dahlia' AND available = 1 AND excluded = 0 AND photo_url IS NOT NULL AND photo_url != ''",
    )] as unknown as Array<CultivarRow>
  }

  private publicCultivar(slot: 'a' | 'b' | 'c' | 'd') {
    // BLIND voting shape — photo by slot ONLY (Dusty 2026-10-26:
    // "Remove the bloom size. Just the photos."). No id (ids are name
    // slugs), no name, no color, no bloom size, and no photo URL: 76
    // of 221 vendor photo URLs contain the cultivar name in the
    // filename, so photos are served through the opaque
    // /pair-photo/:token/:slot proxy instead. The client builds the
    // image URL from the pair token + slot, so a served pair response
    // contains nothing about the cultivar but its position. Names and
    // bloom sizes live only in admin data and the voter's own
    // personal list (/my-list).
    return { slot }
  }

  // A round is TWO blooms, head to head; the voter picks one
  // (back to pairs, Dusty 2026-11-12; the 2026-10-30 four-bloom
  // grid is retired). The row still lives in the pairs table, with
  // c_id/d_id null — historical four-member rows stay readable and
  // still count toward the seen-pairings exclusions below.
  private makeRound(voterId: string): { token: string; cultivars: Array<unknown>; picks: number } | { error: string; status: number } {
    if (this.meta('voting_paused') === '1') return { error: 'Voting is paused just now — please come back soon.', status: 403 }
    const pool = this.pool()
    if (pool.length < 2) return { error: 'No blooms to compare just now.', status: 503 }

    type RoundRow = { a_id: string; b_id: string; c_id: string | null; d_id: string | null }
    const memberIds = (r: RoundRow): Array<string> =>
      [r.a_id, r.b_id, r.c_id, r.d_id].filter((x): x is string => !!x)

    // Every unordered pairing this voter has already seen, across all
    // slots of past rounds (legacy two-bloom rows included).
    const seen = new Set<string>()
    for (const row of this.sql.exec('SELECT a_id, b_id, c_id, d_id FROM pairs WHERE voter_id = ?', voterId)) {
      const ids = memberIds(row as RoundRow)
      for (let i = 0; i < ids.length; i++) {
        for (let j = i + 1; j < ids.length; j++) seen.add([ids[i], ids[j]].sort().join('|'))
      }
    }
    const lastRows = [...this.sql.exec('SELECT a_id, b_id, c_id, d_id FROM pairs WHERE voter_id = ? ORDER BY created_at DESC LIMIT 1', voterId)]
    const lastIds = new Set<string>(lastRows.length ? memberIds(lastRows[0] as RoundRow) : [])

    const voterRows = [...this.sql.exec('SELECT votes_cast FROM voters WHERE id = ?', voterId)]
    const picks = voterRows.length ? (voterRows[0] as { votes_cast: number }).votes_cast : 0

    // Weighted pick: fewer matchups = more likely.
    const weightedPick = (list: Array<CultivarRow>): CultivarRow => {
      let total = 0
      const weights = list.map((c) => { const w = 1 / (c.matchups + 1); total += w; return w })
      let r = Math.random() * total
      for (let i = 0; i < list.length; i++) { r -= weights[i]; if (r <= 0) return list[i] }
      return list[list.length - 1]
    }

    const chosen: Array<CultivarRow> = []
    // First bloom: weighted across the pool, steering away from the
    // previous round's members when the pool allows it.
    const freshPool = pool.filter((c) => !lastIds.has(c.id))
    chosen.push(weightedPick(freshPool.length >= 2 ? freshPool : pool))
    // Second bloom: among pairings this voter hasn't seen against
    // the bloom already chosen, closest Elo to it first, then
    // fewest matchups; sample the top slice.
    while (chosen.length < 2) {
      const chosenIds = new Set(chosen.map((c) => c.id))
      const meanElo = chosen.reduce((sum, c) => sum + c.elo, 0) / chosen.length
      let candidates = pool.filter(
        (c) => !chosenIds.has(c.id) && chosen.every((ch) => !seen.has([ch.id, c.id].sort().join('|'))),
      )
      if (!candidates.length) candidates = pool.filter((c) => !chosenIds.has(c.id))
      candidates.sort((x, y) => (Math.abs(x.elo - meanElo) - Math.abs(y.elo - meanElo)) || (x.matchups - y.matchups))
      const slice = candidates.slice(0, Math.min(12, candidates.length))
      chosen.push(weightedPick(slice.length ? slice : candidates))
    }

    const token = randomHex(16)
    this.sql.exec(
      'INSERT INTO pairs (token, voter_id, a_id, b_id, c_id, d_id, created_at, used) VALUES (?, ?, ?, ?, ?, ?, ?, 0)',
      token, voterId, chosen[0].id, chosen[1].id, null, null, new Date().toISOString(),
    )
    const slots = ['a', 'b'] as const
    return { token, cultivars: slots.map((s) => this.publicCultivar(s)), picks }
  }

  private purgeActivity() {
    this.sql.exec('DELETE FROM votes')
    this.sql.exec('DELETE FROM pairs')
    this.sql.exec('DELETE FROM codes')
    this.sql.exec('DELETE FROM voters')
    this.sql.exec('DELETE FROM preview_links')
    this.sql.exec('UPDATE cultivars SET elo = 1500, wins = 0, losses = 0, matchups = 0')
  }

  async fetch(request: Request): Promise<Response> {
    this.seedIfEmpty()
    this.backfillBloomSizes()
    this.removeMixes()
    this.removeDuplicateCultivars()
    this.removePotAndMoreDuplicates()
    this.backfillSelfHostedPhotos()
    this.backfillOptimizedPhotos()
    const url = new URL(request.url)
    const path = url.pathname
    const str = (v: unknown) => (typeof v === 'string' ? v.trim() : '')

    let body: Record<string, unknown> = {}
    if (request.method === 'POST') {
      try { body = (await request.json()) as Record<string, unknown> } catch { return json({ error: 'Invalid request.' }, 400) }
    }

    if (path === '/health' && request.method === 'GET') {
      return json({ ok: true, pool: this.pool().length, totalCultivars: [...this.sql.exec('SELECT COUNT(*) AS n FROM cultivars')][0], twilioConfigured: false, votingPaused: this.meta('voting_paused') === '1' })
    }

    /* ---- enter the game (Dusty 2026-11-12: texting removed) ----
       Name + mobile and you're in — no code, no text, nothing sent.
       The number is simply saved with the player's picks so their
       list and progress are there when they return. This endpoint
       never sends an SMS and never touches codes or sms_log. */
    if (path === '/enter' && request.method === 'POST') {
      if (str(body.website)) return json({ ok: true }) // honeypot
      const name = str(body.name)
      const phone = normalizeUSPhone(str(body.phone))
      if (!name || name.length > 100) return json({ error: 'Please tell us your name.' }, 400)
      if (!phone) return json({ error: 'That mobile number doesn’t look quite right — US numbers only, please.' }, 400)
      if (phone === PREVIEW_PHONE) {
        return json({ error: 'That number can’t be used to enter — please use your own mobile number.' }, 400)
      }
      const ip = request.headers.get('X-Forwarded-IP') ?? request.headers.get('CF-Connecting-IP') ?? 'unknown'
      const nowIso = new Date().toISOString()
      // Simple abuse caps for an unauthenticated endpoint: a player
      // re-entering is cheap, so allow plenty — 10 entries per number
      // and 50 per IP per day — and log each entry in entry_events.
      const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      const perPhone = [...this.sql.exec('SELECT COUNT(*) AS n FROM entry_events WHERE phone = ? AND created_at > ?', phone, dayAgo)][0] as { n: number }
      if (perPhone.n >= 10) return json({ error: 'That number has been entered a lot today — please try again tomorrow.' }, 429)
      const perIp = [...this.sql.exec('SELECT COUNT(*) AS n FROM entry_events WHERE ip = ? AND created_at > ?', ip, dayAgo)][0] as { n: number }
      if (perIp.n >= 50) return json({ error: 'Too many entries from here today — please try again tomorrow.' }, 429)
      this.sql.exec('INSERT INTO entry_events (id, phone, ip, created_at) VALUES (?, ?, ?, ?)', newId('entry'), phone, ip, nowIso)

      // Upsert the non-preview voter by phone (voters.phone is
      // UNIQUE): a returning player keeps created_at and votes_cast;
      // only name + last_active move. The old opted_out flag no longer
      // blocks anyone — there are no texts to opt out of.
      const existing = [...this.sql.exec('SELECT id FROM voters WHERE phone = ? AND COALESCE(is_preview, 0) = 0', phone)]
      let voterId: string
      if (existing.length) {
        voterId = (existing[0] as { id: string }).id
        this.sql.exec('UPDATE voters SET name = ?, last_active = ? WHERE id = ?', name, nowIso, voterId)
      } else {
        voterId = newId('voter')
        this.sql.exec('INSERT INTO voters (id, name, phone, votes_cast, opted_out, is_preview, created_at, last_active) VALUES (?, ?, ?, 0, 0, 0, ?, ?)', voterId, name, phone, nowIso, nowIso)
      }
      const token = await createVoterToken(this.voterSecret(), voterId)
      return json({ ok: true, voterSessionToken: token })
    }

    /* ---- the old texted-code flow is retired (Dusty 2026-11-12) ---- */
    if ((path === '/request-code' || path === '/verify-code') && request.method === 'POST') {
      return json({ error: 'Entry codes are no longer used — just enter your name and mobile number on the game page to play.' }, 410)
    }

    /* ---- owner preview: redeem a one-time preview link ---- */
    if (path === '/preview/redeem' && request.method === 'POST') {
      const token = str(body.token)
      if (!token) return json({ error: 'That preview link isn’t right.' }, 400)
      const hash = await sha256Hex(token)
      const rows = [...this.sql.exec('SELECT token_hash, expires_at, used_at FROM preview_links WHERE token_hash = ?', hash)]
      if (!rows.length) return json({ error: 'That preview link isn’t right.' }, 404)
      const link = rows[0] as { expires_at: number; used_at: string | null }
      if (link.used_at) return json({ error: 'That preview link was already used.' }, 410)
      if (Date.now() > link.expires_at) return json({ error: 'That preview link has expired.' }, 410)
      this.sql.exec('UPDATE preview_links SET used_at = ? WHERE token_hash = ?', new Date().toISOString(), hash)

      // Create (or reuse) the single preview voter.
      let voterId = this.previewVoterId()
      const nowIso = new Date().toISOString()
      if (!voterId) {
        voterId = newId('voter')
        this.sql.exec(
          'INSERT INTO voters (id, name, phone, votes_cast, opted_out, is_preview, created_at, last_active) VALUES (?, ?, ?, 0, 0, 1, ?, ?)',
          voterId, 'Preview (owner)', PREVIEW_PHONE, nowIso, nowIso,
        )
      } else {
        this.sql.exec('UPDATE voters SET opted_out = 0, last_active = ? WHERE id = ?', nowIso, voterId)
      }
      const sessionToken = await createVoterToken(this.voterSecret(), voterId, true)
      return json({ ok: true, voterSessionToken: sessionToken, preview: true })
    }

    /* ---- blind photo proxy: /pair-photo/:token/:slot ----
       The pair token (128-bit random) is the bearer secret, so no
       session is required; the response is the cultivar's photo bytes
       with no name anywhere in URL or body. Works whether or not the
       pair has been decided, so in-flight image loads never break. */
    if (path.startsWith('/pair-photo/') && request.method === 'GET') {
      const parts = path.split('/')
      const pToken = parts[2] ?? ''
      const slot = parts[3] ?? ''
      if (slot !== 'a' && slot !== 'b' && slot !== 'c' && slot !== 'd') return json({ error: 'Not found.' }, 404)
      const rows = [...this.sql.exec('SELECT a_id, b_id, c_id, d_id FROM pairs WHERE token = ?', pToken)]
      if (!rows.length) return json({ error: 'Not found.' }, 404)
      const prow = rows[0] as { a_id: string; b_id: string; c_id: string | null; d_id: string | null }
      const cid = slot === 'a' ? prow.a_id : slot === 'b' ? prow.b_id : slot === 'c' ? prow.c_id : prow.d_id
      if (!cid) return json({ error: 'Not found.' }, 404)
      const crows = [...this.sql.exec('SELECT photo_url FROM cultivars WHERE id = ?', cid)]
      if (!crows.length) return json({ error: 'Not found.' }, 404)
      const photoUrl = (crows[0] as { photo_url: string }).photo_url
      try {
        const upstream = await fetch(photoUrl, {
          headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36' },
        })
        if (!upstream.ok || !upstream.body) return json({ error: 'Photo unavailable.' }, 502)
        return new Response(upstream.body, {
          headers: {
            'Content-Type': upstream.headers.get('Content-Type') ?? 'image/jpeg',
            'Cache-Control': 'private, max-age=3600',
          },
        })
      } catch {
        return json({ error: 'Photo unavailable.' }, 502)
      }
    }

    /* ---- voter pair / vote / skip ---- */
    if (path === '/next-pair' && request.method === 'GET') {
      const session = await this.voterSession(request)
      if (!session) return json({ error: 'Not signed in.' }, 401)
      const pair = this.makeRound(session.id)
      if ('error' in pair) return json({ error: pair.error }, pair.status)
      return json({ ok: true, preview: session.preview, ...pair })
    }

    if ((path === '/vote' || path === '/skip') && request.method === 'POST') {
      const session = await this.voterSession(request)
      if (!session) return json({ error: 'Not signed in.' }, 401)
      const vid = session.id
      const token = str(body.token)
      const rows = [...this.sql.exec('SELECT * FROM pairs WHERE token = ? AND voter_id = ?', token, vid)]
      if (!rows.length) return json({ error: 'That set is no longer available.' }, 404)
      const pair = rows[0] as { a_id: string; b_id: string; c_id: string | null; d_id: string | null; used: number }
      if (pair.used) return json({ error: 'That set was already decided.' }, 409)
      this.sql.exec('UPDATE pairs SET used = 1 WHERE token = ?', token)

      if (path === '/vote') {
        // Blind clients pick by slot ('a'..'d'); winnerId is still
        // accepted for compatibility but round payloads no longer
        // expose cultivar ids at all.
        const slotIds: Record<string, string | null> = { a: pair.a_id, b: pair.b_id, c: pair.c_id, d: pair.d_id }
        const slot = str(body.winnerSlot)
        const winnerId = (slot && slotIds[slot]) || str(body.winnerId)
        const memberIdList = [pair.a_id, pair.b_id, pair.c_id, pair.d_id].filter((x): x is string => !!x)
        if (!winnerId || !memberIdList.includes(winnerId)) return json({ error: 'Invalid pick.' }, 400)
        // One pick = the winner beating every other bloom in the
        // round (one rival in a pair round; three in a historical
        // four-bloom row, whose votes still replay the same way).
        const loserIds = memberIdList.filter((id) => id !== winnerId)
        const nowIso = new Date().toISOString()
        if (session.preview) {
          // Preview picks are logged for review only — they never touch
          // Elo, wins/losses/matchups, or any admin totals/exports.
          for (const loserId of loserIds) {
            this.sql.exec(
              'INSERT INTO votes (id, voter_id, winner_id, loser_id, preview, created_at) VALUES (?, ?, ?, ?, 1, ?)',
              newId('vote'), vid, winnerId, loserId, nowIso,
            )
          }
          this.sql.exec('UPDATE voters SET votes_cast = votes_cast + 1, last_active = ? WHERE id = ?', nowIso, vid)
        } else {
          // Applied one matchup at a time with live ratings, exactly
          // as the /my-list replay applies the vote rows in order.
          for (const loserId of loserIds) {
            const w = [...this.sql.exec('SELECT * FROM cultivars WHERE id = ?', winnerId)][0] as unknown as CultivarRow
            const l = [...this.sql.exec('SELECT * FROM cultivars WHERE id = ?', loserId)][0] as unknown as CultivarRow
            const ew = 1 / (1 + Math.pow(10, (l.elo - w.elo) / 400))
            const el = 1 / (1 + Math.pow(10, (w.elo - l.elo) / 400))
            const kw = w.matchups >= 30 ? 16 : 32
            const kl = l.matchups >= 30 ? 16 : 32
            const newW = Math.round((w.elo + kw * (1 - ew)) * 10) / 10
            const newL = Math.round((l.elo + kl * (0 - el)) * 10) / 10
            this.sql.exec('UPDATE cultivars SET elo = ?, wins = wins + 1, matchups = matchups + 1 WHERE id = ?', newW, winnerId)
            this.sql.exec('UPDATE cultivars SET elo = ?, losses = losses + 1, matchups = matchups + 1 WHERE id = ?', newL, loserId)
            this.sql.exec('INSERT INTO votes (id, voter_id, winner_id, loser_id, preview, created_at) VALUES (?, ?, ?, ?, 0, ?)', newId('vote'), vid, winnerId, loserId, nowIso)
          }
          this.sql.exec('UPDATE voters SET votes_cast = votes_cast + 1, last_active = ? WHERE id = ?', nowIso, vid)
        }
      }

      const next = this.makeRound(vid)
      if ('error' in next) return json({ ok: true, preview: session.preview, next: null })
      return json({ ok: true, preview: session.preview, next })
    }

    /* ---- start over (Dusty 2026-11-13): a signed-in player can
       reset their own picks and begin again. Their voter record —
       name, phone, session — survives; only their picks go. For a
       real voter their votes genuinely leave Dusty's big board:
       the rows are deleted and the whole board is recomputed from
       the remaining votes (see recomputeBoard). Preview picks
       never touched the board, so a preview reset is just the
       preview voter's own rows. Destructive only to oneself; a
       reset at 0 picks is a harmless no-op. */
    if (path === '/reset-me' && request.method === 'POST') {
      const session = await this.voterSession(request)
      if (!session) return json({ error: 'Not signed in.' }, 401)
      const vid = session.id
      const nowIso = new Date().toISOString()
      this.sql.exec('DELETE FROM votes WHERE voter_id = ?', vid)
      this.sql.exec('DELETE FROM pairs WHERE voter_id = ?', vid)
      this.sql.exec(
        'UPDATE voters SET votes_cast = 0, last_active = ? WHERE id = ?',
        nowIso, vid,
      )
      if (!session.preview) this.recomputeBoard()
      return json({ ok: true, picks: 0 })
    }

    if (path === '/me' && request.method === 'GET') {
      const session = await this.voterSession(request)
      if (!session) return json({ authed: false })
      const rows = [...this.sql.exec('SELECT name, votes_cast FROM voters WHERE id = ?', session.id)]
      const v = rows[0] as { name: string; votes_cast: number }
      return json({ authed: true, name: v.name, picks: v.votes_cast, preview: session.preview })
    }

    /* ---- the voter's own personal sorted list ----
       Personal Elo replayed chronologically from ONLY this voter's
       votes (preview sessions use their preview votes only). Names ARE
       revealed here — this is where the blind picks get their names
       back. No price/vendor fields: this is a voter endpoint. */
    if (path === '/my-list' && request.method === 'GET') {
      const session = await this.voterSession(request)
      if (!session) return json({ error: 'Not signed in.' }, 401)
      const previewFlag = session.preview ? 1 : 0
      const rows = [...this.sql.exec(
        'SELECT winner_id, loser_id FROM votes WHERE voter_id = ? AND COALESCE(preview, 0) = ? ORDER BY created_at ASC, rowid ASC',
        session.id, previewFlag,
      )] as unknown as Array<{ winner_id: string; loser_id: string }>
      const stats = new Map<string, { rating: number; wins: number; losses: number; matchups: number }>()
      const ensure = (id: string) => {
        let s = stats.get(id)
        if (!s) { s = { rating: 1500, wins: 0, losses: 0, matchups: 0 }; stats.set(id, s) }
        return s
      }
      for (const v of rows) {
        const w = ensure(v.winner_id)
        const l = ensure(v.loser_id)
        const ew = 1 / (1 + Math.pow(10, (l.rating - w.rating) / 400))
        const el = 1 / (1 + Math.pow(10, (w.rating - l.rating) / 400))
        const kw = w.matchups >= 30 ? 16 : 32
        const kl = l.matchups >= 30 ? 16 : 32
        w.rating = Math.round((w.rating + kw * (1 - ew)) * 10) / 10
        l.rating = Math.round((l.rating + kl * (0 - el)) * 10) / 10
        w.wins += 1; w.matchups += 1
        l.losses += 1; l.matchups += 1
      }
      const entries = [...stats.entries()].map(([id, s]) => {
        const c = [...this.sql.exec('SELECT name, photo_url, bloom_size FROM cultivars WHERE id = ?', id)][0] as
          | { name: string; photo_url: string; bloom_size: string | null }
          | undefined
        return {
          id,
          name: c?.name ?? id,
          photo_url: c?.photo_url ?? '',
          bloom_size: c?.bloom_size ?? null,
          rating: Math.round(s.rating),
          wins: s.wins,
          losses: s.losses,
          seen: s.matchups,
        }
      })
      entries.sort((a, b) => (b.rating - a.rating) || (b.wins - a.wins) || (b.seen - a.seen))
      const vrows = [...this.sql.exec('SELECT name FROM voters WHERE id = ?', session.id)]
      return json({
        ok: true,
        preview: session.preview,
        voterName: vrows.length ? (vrows[0] as { name: string }).name : null,
        totalPicks: rows.length,
        entries: entries.map((e, i) => ({ rank: i + 1, ...e })),
      })
    }

    /* ---- admin auth (volunteer pattern) ---- */
    if (path === '/auth/status' && request.method === 'GET') {
      return json({ setupDone: this.setupDone() })
    }

    if (path === '/auth/setup' && request.method === 'POST') {
      if (this.setupDone()) return json({ error: 'Setup is already complete.' }, 400)
      const code = str(body.code)
      const password = typeof body.password === 'string' ? body.password : ''
      if (!code || password.length < 8) return json({ error: 'Enter the setup code and a password of 8+ characters.' }, 400)
      if ((await sha256Hex(code)) !== this.env.SETUP_CODE_HASH) return json({ error: 'That setup code isn’t right.' }, 403)
      const salt = randomHex(16)
      this.setMeta('password_hash', await hashPassword(password, salt))
      this.setMeta('password_salt', salt)
      this.setMeta('session_secret', randomHex(32))
      this.setMeta('setup_done', '1')
      const token = await createAdminToken(this.meta('session_secret')!)
      return json({ ok: true, sessionToken: token })
    }

    if (path === '/auth/login' && request.method === 'POST') {
      const password = typeof body.password === 'string' ? body.password : ''
      const hash = this.meta('password_hash')
      const salt = this.meta('password_salt')
      const secret = this.meta('session_secret')
      if (!this.setupDone() || !hash || !salt || !secret) return json({ error: 'Setup hasn’t been completed yet.' }, 400)
      if ((await hashPassword(password, salt)) !== hash) return json({ error: 'That password isn’t right.' }, 403)
      return json({ ok: true, sessionToken: await createAdminToken(secret) })
    }

    /* ---- maintenance gated by setup code (pre-setup, and reset-admin any time) ---- */
    if (path === '/maintenance/purge' && request.method === 'POST') {
      if (this.setupDone()) return json({ error: 'Setup is already complete.' }, 400)
      if ((await sha256Hex(str(body.code))) !== this.env.SETUP_CODE_HASH) return json({ error: 'That setup code isn’t right.' }, 403)
      this.purgeActivity()
      return json({ ok: true })
    }

    if (path === '/maintenance/reset-admin' && request.method === 'POST') {
      if ((await sha256Hex(str(body.code))) !== this.env.SETUP_CODE_HASH) return json({ error: 'That setup code isn’t right.' }, 403)
      this.sql.exec("DELETE FROM meta WHERE key IN ('password_hash', 'password_salt', 'session_secret', 'setup_done')")
      return json({ ok: true })
    }



    /* ---- admin data ---- */
    if (path === '/admin/state' && request.method === 'GET') {
      if (!this.setupDone()) return json({ setupDone: false, authed: false })
      if (!(await this.adminAuthed(request))) return json({ setupDone: true, authed: false })
      const cultivars = [...this.sql.exec('SELECT * FROM cultivars ORDER BY elo DESC, name ASC')] as unknown as Array<CultivarRow>
      const leaderboard = cultivars.map((c, i) => ({
        rank: i + 1, id: c.id, name: c.name, photo_url: c.photo_url, color: c.color, color_family: c.color_family,
        form: c.form, available: c.available === 1, excluded: c.excluded === 1, inPool: c.available === 1 && c.excluded === 0 && Boolean(c.photo_url),
        elo: c.elo, wins: c.wins, losses: c.losses,
        winPct: c.matchups ? Math.round((c.wins / c.matchups) * 1000) / 10 : 0,
        matchups: c.matchups,
        confidence: c.matchups >= 30 ? 'High' : c.matchups >= 10 ? 'Med' : 'Low',
        cheapestVendor: c.cheapest_vendor, cheapestPrice: c.cheapest_price, vendorNote: c.vendor_note, vendors: c.vendors,
      }))
      const voters = [...this.sql.exec('SELECT * FROM voters WHERE COALESCE(is_preview, 0) = 0 ORDER BY created_at DESC')].map((r) => {
        const v = r as Record<string, unknown>
        return { id: v.id, name: v.name, phone: v.phone, votesCast: v.votes_cast, optedOut: v.opted_out === 1, joined: v.created_at, lastActive: v.last_active }
      })
      // A pick writes one vote row per beaten rival (three in a
      // four-bloom round), all sharing the pick's timestamp — totals
      // count decided rounds so the number matches voter pick counts.
      const totals = [...this.sql.exec("SELECT (SELECT COUNT(DISTINCT voter_id || '|' || created_at) FROM votes WHERE COALESCE(preview, 0) = 0) AS votes, (SELECT COUNT(*) FROM voters WHERE COALESCE(is_preview, 0) = 0) AS voters")][0] as { votes: number; voters: number }
      const previewPicks = [...this.sql.exec(
        `SELECT v.created_at AS at, w.name AS winner, l.name AS loser
         FROM votes v
         JOIN cultivars w ON w.id = v.winner_id
         JOIN cultivars l ON l.id = v.loser_id
         WHERE v.preview = 1 ORDER BY v.created_at DESC LIMIT 20`,
      )].map((r) => {
        const p = r as Record<string, unknown>
        return { winner: p.winner, loser: p.loser, at: p.at }
      })
      const previewLinks = [...this.sql.exec(
        'SELECT created_at, expires_at, used_at FROM preview_links ORDER BY created_at DESC LIMIT 10',
      )].map((r) => {
        const p = r as Record<string, unknown>
        return { createdAt: p.created_at, expiresAt: p.expires_at, usedAt: p.used_at }
      })
      return json({ setupDone: true, authed: true, leaderboard, voters, totals, votingPaused: this.meta('voting_paused') === '1', pool: this.pool().length, previewPicks, previewLinks })
    }

    if (path === '/admin/export.csv' && request.method === 'GET') {
      if (!(await this.adminAuthed(request))) return json({ error: 'Not signed in.' }, 401)
      const cultivars = [...this.sql.exec('SELECT * FROM cultivars ORDER BY elo DESC, name ASC')] as unknown as Array<CultivarRow>
      const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`
      const lines = ['rank,cultivar,color_family,elo,wins,losses,win_pct,matchups,confidence,cheapest_vendor,price_per_tuber,vendor_note']
      cultivars.forEach((c, i) => {
        lines.push([i + 1, c.name, c.color_family, c.elo, c.wins, c.losses, c.matchups ? Math.round((c.wins / c.matchups) * 1000) / 10 : 0, c.matchups, c.matchups >= 30 ? 'High' : c.matchups >= 10 ? 'Med' : 'Low', c.cheapest_vendor, c.cheapest_price ?? '', c.vendor_note].map(esc).join(','))
      })
      return new Response(lines.join('\n'), { headers: { 'Content-Type': 'text/csv', 'Content-Disposition': 'attachment; filename="this-or-that-leaderboard.csv"' } })
    }

    if (path === '/admin/action' && request.method === 'POST') {
      if (!(await this.adminAuthed(request))) return json({ error: 'Not signed in.' }, 401)
      const action = str(body.action)
      if (action === 'set_paused') {
        this.setMeta('voting_paused', body.paused ? '1' : '0')
        return json({ ok: true })
      }
      if (action === 'set_excluded') {
        const id = str(body.cultivarId)
        this.sql.exec('UPDATE cultivars SET excluded = ? WHERE id = ?', body.excluded ? 1 : 0, id)
        return json({ ok: true })
      }
      if (action === 'purge_activity') {
        this.purgeActivity()
        return json({ ok: true })
      }
      if (action === 'create_preview_link') {
        const minted = await this.mintPreviewLink()
        // The plaintext token leaves the worker exactly once, here.
        return json({
          ok: true,
          previewToken: minted.token,
          previewUrl: minted.url,
          expiresAt: minted.expiresAt,
        })
      }
      if (action === 'clear_preview') {
        this.clearPreviewData()
        return json({ ok: true })
      }
      if (action === 'reset_admin') {
        if ((await sha256Hex(str(body.code))) !== this.env.SETUP_CODE_HASH) return json({ error: 'That setup code isn’t right.' }, 403)
        this.sql.exec("DELETE FROM meta WHERE key IN ('password_hash', 'password_salt', 'session_secret', 'setup_done')")
        return json({ ok: true })
      }
      return json({ error: 'Unknown action.' }, 400)
    }

    return json({ error: 'Not found.' }, 404)
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const stub = env.BOARD.get(env.BOARD.idFromName('thisorthat'))
    return stub.fetch(request)
  },
}
