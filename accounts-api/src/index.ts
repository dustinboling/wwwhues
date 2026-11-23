/*
  hues-accounts-api — the single Hues visitor account (Dustin,
  2026-11-12). One account for everything a visitor does at
  hues.flowers: the games, This or That, preferences, volunteering.

  Identity is deliberately passwordless, at Dustin's direction:
  an account is a name, an email, and a mobile number, and signing
  in means entering the email + mobile pair the account was made
  with. Nothing confidential lives behind this account, so no
  passwords and no codes — the same trust model This or That
  entry already uses (name + mobile, straight in).

  Same shape as the other boards: a single Durable Object
  (SQLite) serializes every read/write; the Next.js site proxies
  to this worker server-side and browsers only ever talk to
  hues.flowers. Sessions are opaque random tokens; only their
  SHA-256 hashes are stored, and signing out revokes server-side.
*/

interface Env {
  BOARD: DurableObjectNamespace
}

/* ---------------- helpers (mirroring the other boards) ---------------- */

function toHex(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf)
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

async function sha256Hex(text: string): Promise<string> {
  return toHex(
    await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)),
  )
}

function randomHex(bytes: number): string {
  return toHex(crypto.getRandomValues(new Uint8Array(bytes)))
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

/* Same normalizer as thisorthat-api — a phone is a phone. */
function normalizeUSPhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, '')
  let ten = ''
  if (digits.length === 10) ten = digits
  else if (digits.length === 11 && digits.startsWith('1')) ten = digits.slice(1)
  else return null
  if (!/^[2-9]\d{9}$/.test(ten)) return null
  return `+1${ten}`
}

function normalizeEmail(raw: string): string | null {
  const email = raw.trim().toLowerCase()
  if (email.length > 254) return null
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null
  return email
}

function str(v: unknown): string {
  return typeof v === 'string' ? v : ''
}

const SESSION_TTL_MS = 90 * 24 * 60 * 60 * 1000

interface VisitorRow {
  id: string
  name: string
  email: string
  phone: string
  created_at: string
  last_seen_at: string
}

function publicVisitor(v: VisitorRow) {
  return { id: v.id, name: v.name, email: v.email, phone: v.phone }
}

/* ---------------- Durable Object ---------------- */

export class AccountsBoard {
  private sql: SqlStorage

  constructor(ctx: DurableObjectState, _env: Env) {
    this.sql = ctx.storage.sql
    this.sql.exec(`CREATE TABLE IF NOT EXISTS visitors (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      phone TEXT NOT NULL UNIQUE,
      created_at TEXT NOT NULL,
      last_seen_at TEXT NOT NULL
    )`)
    this.sql.exec(`CREATE TABLE IF NOT EXISTS sessions (
      token_hash TEXT PRIMARY KEY,
      visitor_id TEXT NOT NULL,
      created_at TEXT NOT NULL,
      expires_at INTEGER NOT NULL,
      revoked_at TEXT
    )`)
  }

  private byEmail(email: string): VisitorRow | null {
    const rows = [...this.sql.exec('SELECT * FROM visitors WHERE email = ?', email)]
    return rows.length ? (rows[0] as VisitorRow) : null
  }

  private byPhone(phone: string): VisitorRow | null {
    const rows = [...this.sql.exec('SELECT * FROM visitors WHERE phone = ?', phone)]
    return rows.length ? (rows[0] as VisitorRow) : null
  }

  private async issueSession(visitorId: string): Promise<string> {
    const token = randomHex(32)
    const hash = await sha256Hex(token)
    const now = new Date()
    this.sql.exec(
      'INSERT INTO sessions (token_hash, visitor_id, created_at, expires_at, revoked_at) VALUES (?, ?, ?, ?, NULL)',
      hash,
      visitorId,
      now.toISOString(),
      now.getTime() + SESSION_TTL_MS,
    )
    this.sql.exec(
      'UPDATE visitors SET last_seen_at = ? WHERE id = ?',
      now.toISOString(),
      visitorId,
    )
    return token
  }

  private async sessionVisitor(request: Request): Promise<VisitorRow | null> {
    const token = request.headers.get('X-Account-Session')
    if (!token) return null
    const hash = await sha256Hex(token)
    const rows = [
      ...this.sql.exec(
        'SELECT visitor_id, expires_at, revoked_at FROM sessions WHERE token_hash = ?',
        hash,
      ),
    ]
    if (!rows.length) return null
    const s = rows[0] as { visitor_id: string; expires_at: number; revoked_at: string | null }
    if (s.revoked_at || Date.now() > s.expires_at) return null
    const vrows = [...this.sql.exec('SELECT * FROM visitors WHERE id = ?', s.visitor_id)]
    return vrows.length ? (vrows[0] as VisitorRow) : null
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url)
    const path = url.pathname

    if (path === '/health' && request.method === 'GET') {
      const n = [...this.sql.exec('SELECT COUNT(*) AS n FROM visitors')][0] as { n: number }
      return json({ ok: true, visitors: n.n })
    }

    /* Only the form endpoints carry a JSON body — sign-out sends
       none, so a missing body is not an error here. */
    let body: Record<string, unknown> = {}
    if (
      request.method === 'POST' &&
      (path === '/signup' || path === '/signin' || path === '/update')
    ) {
      try {
        body = (await request.json()) as Record<string, unknown>
      } catch {
        return json({ error: 'Invalid request.' }, 400)
      }
    }

    /* ---- create an account (or, if the same person comes back
       with the same details, simply sign them in) ---- */
    if (path === '/signup' && request.method === 'POST') {
      const name = str(body.name).trim().replace(/\s+/g, ' ')
      const email = normalizeEmail(str(body.email))
      const phone = normalizeUSPhone(str(body.phone))
      if (name.length < 2 || name.length > 80) {
        return json({ error: 'Please enter your name.' }, 400)
      }
      if (!email) {
        return json({ error: 'That email doesn’t look quite right — please check it.' }, 400)
      }
      if (!phone) {
        return json({ error: 'That mobile number doesn’t look quite right — please enter a 10-digit US number.' }, 400)
      }

      const byEmail = this.byEmail(email)
      const byPhone = this.byPhone(phone)
      if (byEmail && byPhone && byEmail.id !== byPhone.id) {
        return json(
          {
            error:
              'That email and that mobile number belong to two different accounts. Please use the email and number you signed up with — or call us at (458) 245-1323 and we’ll sort it out.',
          },
          409,
        )
      }

      let visitor = byEmail ?? byPhone
      if (!visitor) {
        const now = new Date().toISOString()
        const id = newId('visitor')
        this.sql.exec(
          'INSERT INTO visitors (id, name, email, phone, created_at, last_seen_at) VALUES (?, ?, ?, ?, ?, ?)',
          id,
          name,
          email,
          phone,
          now,
          now,
        )
        visitor = { id, name, email, phone, created_at: now, last_seen_at: now }
      }
      const sessionToken = await this.issueSession(visitor.id)
      return json({ ok: true, sessionToken, visitor: publicVisitor(visitor) })
    }

    /* ---- sign in: the email + mobile pair is the credential ---- */
    if (path === '/signin' && request.method === 'POST') {
      const email = normalizeEmail(str(body.email))
      const phone = normalizeUSPhone(str(body.phone))
      const fail = json(
        { error: 'We couldn’t find an account with that email and mobile number. Please check both and try again.' },
        401,
      )
      if (!email || !phone) return fail
      const visitor = this.byEmail(email)
      if (!visitor || visitor.phone !== phone) return fail
      const sessionToken = await this.issueSession(visitor.id)
      return json({ ok: true, sessionToken, visitor: publicVisitor(visitor) })
    }

    /* ---- who am I ---- */
    if (path === '/me' && request.method === 'GET') {
      const visitor = await this.sessionVisitor(request)
      if (!visitor) return json({ error: 'Not signed in.' }, 401)
      return json({ ok: true, visitor: publicVisitor(visitor) })
    }

    /* ---- edit details: name, email, mobile. The email + mobile
       pair is the sign-in, so changes take effect everywhere at
       once; uniqueness matches signup (no two accounts may share
       an email or a mobile). ---- */
    if (path === '/update' && request.method === 'POST') {
      const me = await this.sessionVisitor(request)
      if (!me) return json({ error: 'Not signed in.' }, 401)

      const nameRaw = str(body.name).trim().replace(/\s+/g, ' ')
      const name = nameRaw === '' ? me.name : nameRaw
      if (name.length < 2 || name.length > 80) {
        return json({ error: 'Please enter your name.' }, 400)
      }
      let email = me.email
      if (str(body.email).trim() !== '') {
        const e = normalizeEmail(str(body.email))
        if (!e) {
          return json({ error: 'That email doesn’t look quite right — please check it.' }, 400)
        }
        email = e
      }
      let phone = me.phone
      if (str(body.phone).trim() !== '') {
        const p = normalizeUSPhone(str(body.phone))
        if (!p) {
          return json({ error: 'That mobile number doesn’t look quite right — please enter a 10-digit US number.' }, 400)
        }
        phone = p
      }

      const byEmail = this.byEmail(email)
      if (byEmail && byEmail.id !== me.id) {
        return json(
          { error: 'That email already belongs to another account. Please use a different one — or call us at (458) 245-1323 and we’ll sort it out.' },
          409,
        )
      }
      const byPhone = this.byPhone(phone)
      if (byPhone && byPhone.id !== me.id) {
        return json(
          { error: 'That mobile number already belongs to another account. Please use a different one — or call us at (458) 245-1323 and we’ll sort it out.' },
          409,
        )
      }

      this.sql.exec(
        'UPDATE visitors SET name = ?, email = ?, phone = ? WHERE id = ?',
        name,
        email,
        phone,
        me.id,
      )
      const updated: VisitorRow = { ...me, name, email, phone }
      return json({ ok: true, visitor: publicVisitor(updated) })
    }

    /* ---- sign out (revokes this session server-side) ---- */
    if (path === '/signout' && request.method === 'POST') {
      const token = request.headers.get('X-Account-Session')
      if (token) {
        const hash = await sha256Hex(token)
        this.sql.exec(
          'UPDATE sessions SET revoked_at = ? WHERE token_hash = ? AND revoked_at IS NULL',
          new Date().toISOString(),
          hash,
        )
      }
      return json({ ok: true })
    }

    return json({ error: 'Not found.' }, 404)
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const stub = env.BOARD.get(env.BOARD.idFromName('accounts'))
    return stub.fetch(request)
  },
}
