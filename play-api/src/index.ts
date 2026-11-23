/*
  hues-play-api — data + auth service for the Hues Play installable
  web app (hues.flowers/play). A single Durable Object (SQLite)
  serializes every read/write, so event caps and sponsor counts are
  exact (same lesson as volunteers: KV's eventual consistency loses
  writes). The Next.js site proxies to this worker server-side;
  browsers only ever talk to hues.flowers.

  v1 takes NO payments. Sponsor/paver orders are reservations marked
  paid/unpaid; Dusty arranges payment himself (Stripe not connected).
*/

interface Env {
  BOARD: DurableObjectNamespace
  SETUP_CODE_HASH: string
  /* Email notifications via Resend (Dusty's account). RESEND_API_KEY
     is a worker secret set in the Cloudflare dashboard — never a repo
     value. NOTIFY_TO is the single config point for the recipient. */
  RESEND_API_KEY?: string
  NOTIFY_TO?: string
}

const NOTIFY_FROM = 'Hues Floral Park <hello@hues.flowers>'
const REPLY_TO = 'hello@hues.flowers'
const ADMIN_URL = 'https://hues.flowers/play/admin'
const GATHER_IMG = 'https://hues.flowers/email/email-header-gather.jpg'
const GIVE_IMG = 'https://hues.flowers/email/email-header-give.jpg'
const TRIO_ALT_GATHER =
  'A painting of Dusty, Hue the white rabbit, and Cocoa the brown rabbit at a picnic table under string lights at dusk, with a jar of dahlias on the table'
const TRIO_ALT_GIVE =
  'A painting of Dusty, Hue the white rabbit, and Cocoa the brown rabbit standing beside a small blank wooden plaque at the end of a dahlia bed'

/* ---------------- crypto helpers (copied from volunteers) ---------------- */

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
    {
      name: 'PBKDF2',
      salt: fromHex(saltHex) as BufferSource,
      iterations: 100000,
      hash: 'SHA-256',
    },
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
  return toHex(
    await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message)),
  )
}

const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000

async function createSessionToken(secret: string): Promise<string> {
  const exp = Date.now() + SESSION_TTL_MS
  const sig = await hmacHex(secret, `admin:${exp}`)
  return `${exp}.${sig}`
}

async function verifySessionToken(
  secret: string | null,
  token: string | null,
): Promise<boolean> {
  if (!secret || !token) return false
  const [expStr, sig] = token.split('.')
  const exp = Number(expStr)
  if (!exp || Number.isNaN(exp) || exp < Date.now() || !sig) return false
  const expected = await hmacHex(secret, `admin:${exp}`)
  if (expected.length !== sig.length) return false
  let diff = 0
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ sig.charCodeAt(i)
  }
  return diff === 0
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

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/* ---------------- email notification helpers ---------------- */

function formatCents(cents: unknown): string {
  if (typeof cents !== 'number') return ''
  return `$${(cents / 100).toFixed(2)}`
}

/* ---- Print Edition confirmation email (HTML + text parts) ---- */

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

interface ConfirmationParts {
  image: string
  imageAlt: string
  heading: string
  intro: string[]
  details: Array<[string, string]>
  closing: string[]
}

function confirmationText(p: ConfirmationParts): string {
  const lines: string[] = [p.heading, '']
  lines.push(...p.intro)
  if (p.details.length) {
    lines.push('')
    for (const [k, v] of p.details) lines.push(`${k}: ${v}`)
  }
  lines.push('', ...p.closing, '', 'Hues Floral Park, A little world apart.')
  return lines.join('\n')
}

function confirmationHtml(p: ConfirmationParts): string {
  const serif = "Georgia, 'Times New Roman', serif"
  const para = (t: string) =>
    `<tr><td style="padding:12px 36px 0 36px;font-family:${serif};font-size:16px;line-height:1.65;color:#2E4438;">${esc(t)}</td></tr>`
  const detailRows = p.details
    .map(
      ([k, v]) =>
        `<tr><td style="padding:5px 0;font-family:${serif};font-size:15px;color:#55644F;white-space:nowrap;vertical-align:top;">${esc(k)}</td><td style="padding:5px 0 5px 16px;font-family:${serif};font-size:15px;color:#23362B;">${esc(v)}</td></tr>`,
    )
    .join('')
  return [
    '<!DOCTYPE html>',
    '<html lang="en"><head><meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    `<title>${esc(p.heading)}</title></head>`,
    '<body style="margin:0;padding:0;background-color:#EFE7CE;">',
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#EFE7CE;"><tr><td align="center" style="padding:24px 12px;">',
    '<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:600px;background-color:#F7F1DE;border:1px solid #B08D37;">',
    `<tr><td style="padding:0;"><img src="${p.image}" width="600" alt="${esc(p.imageAlt)}" style="display:block;width:100%;max-width:600px;height:auto;border:0;"></td></tr>`,
    `<tr><td style="padding:26px 36px 4px 36px;font-family:${serif};font-size:26px;line-height:1.3;color:#23362B;">${esc(p.heading)}</td></tr>`,
    '<tr><td style="padding:10px 36px 2px 36px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td style="border-top:2px dashed #B08D37;font-size:0;line-height:0;">&nbsp;</td></tr></table></td></tr>',
    ...p.intro.map(para),
    ...(p.details.length
      ? [
          '<tr><td style="padding:18px 36px 4px 36px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#FFFDF4;border:1px solid #B08D37;"><tr><td style="padding:14px 20px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0">',
          detailRows,
          '</table></td></tr></table></td></tr>',
        ]
      : []),
    ...p.closing.map(para),
    `<tr><td style="padding:22px 36px 6px 36px;font-family:${serif};font-size:17px;font-style:italic;color:#23362B;">Hues Floral Park, A little world apart.</td></tr>`,
    `<tr><td style="padding:0 36px 28px 36px;font-family:${serif};font-size:13px;line-height:1.5;color:#55644F;">Hues Floral Park · 93485 River Road, Junction City, Oregon · hues.flowers</td></tr>`,
    '</table></td></tr></table></body></html>',
  ].join('')
}

/* ---------------- seed (first run / after purge) ---------------- */
/* Only facts Dusty confirmed: dahlia bed $100 + season pass + plaque.
   No prices/counts invented for the coming-soon items. No sizes for
   pavers, no events. */

const SEED_ITEMS = [
  {
    id: 'item-dahlia-bed',
    name: 'Sponsor a Dahlia Bed',
    description:
      'A whole bed of dahlias, blooming in your name all season. Your plaque stands at the end of the bed, and a season pass for one person comes with it.',
    price_cents: 10000,
    cap: null as number | null,
    includes_pass: 1,
    status: 'active',
    sort: 1,
    created_at: '2026-10-26T00:00:00.000Z',
  },
  {
    id: 'item-fruit-tree',
    name: 'Sponsor a Fruit Tree',
    description:
      'A fruit tree planted and tended in the park, growing a little taller every year.',
    price_cents: null as number | null,
    cap: null as number | null,
    includes_pass: 0,
    status: 'coming_soon',
    sort: 2,
    created_at: '2026-10-26T00:00:01.000Z',
  },
  {
    id: 'item-picnic-table',
    name: 'Sponsor a Picnic Table',
    description:
      'A shady place to sit with a bouquet and a picnic, in the middle of the blooms.',
    price_cents: null as number | null,
    cap: null as number | null,
    includes_pass: 0,
    status: 'coming_soon',
    sort: 3,
    created_at: '2026-10-26T00:00:02.000Z',
  },
  {
    id: 'item-bench',
    name: 'Sponsor a Bench',
    description:
      'A quiet bench along a path, where someone will linger a little longer than they planned.',
    price_cents: null as number | null,
    cap: null as number | null,
    includes_pass: 0,
    status: 'coming_soon',
    sort: 4,
    created_at: '2026-10-26T00:00:03.000Z',
  },
]

/* ---------------- Durable Object ---------------- */

export class PlayBoard {
  private sql: SqlStorage
  private env: Env
  private ctx: DurableObjectState
  private seeded = false

  constructor(ctx: DurableObjectState, env: Env) {
    this.sql = ctx.storage.sql
    this.env = env
    this.ctx = ctx
    this.sql.exec(`CREATE TABLE IF NOT EXISTS meta (
      key TEXT PRIMARY KEY, value TEXT)`)
    this.sql.exec(`CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY, title TEXT, date TEXT, start_time TEXT,
      end_time TEXT, project TEXT, cap INTEGER, price_cents INTEGER,
      bring TEXT, confirm_text TEXT, spots_per INTEGER, status TEXT,
      created_at TEXT)`)
    this.sql.exec(`CREATE TABLE IF NOT EXISTS rsvps (
      id TEXT PRIMARY KEY, event_id TEXT, name TEXT, email TEXT,
      phone TEXT, spots INTEGER, confirmed INTEGER, attended INTEGER,
      created_at TEXT)`)
    this.sql.exec(`CREATE TABLE IF NOT EXISTS items (
      id TEXT PRIMARY KEY, name TEXT, description TEXT,
      price_cents INTEGER, cap INTEGER, includes_pass INTEGER,
      status TEXT, sort INTEGER, created_at TEXT)`)
    this.sql.exec(`CREATE TABLE IF NOT EXISTS sponsor_orders (
      id TEXT PRIMARY KEY, item_id TEXT, plaque_type TEXT,
      plaque_text TEXT, pass_holder TEXT, email TEXT, phone TEXT,
      paid INTEGER, assigned TEXT, created_at TEXT)`)
    this.sql.exec(`CREATE TABLE IF NOT EXISTS item_interest (
      id TEXT PRIMARY KEY, item_id TEXT, name TEXT, email TEXT,
      created_at TEXT)`)
    this.sql.exec(`CREATE TABLE IF NOT EXISTS paver_sizes (
      id TEXT PRIMARY KEY, name TEXT, dimensions TEXT,
      price_cents INTEGER, fits TEXT, sort INTEGER, created_at TEXT)`)
    this.sql.exec(`CREATE TABLE IF NOT EXISTS paver_orders (
      id TEXT PRIMARY KEY, size_id TEXT, choice TEXT, print_name TEXT,
      print_date TEXT, contact_name TEXT, email TEXT, phone TEXT,
      paid INTEGER, production_status TEXT, location TEXT,
      created_at TEXT)`)
    this.sql.exec(`CREATE TABLE IF NOT EXISTS paver_interest (
      id TEXT PRIMARY KEY, name TEXT, email TEXT, interest TEXT,
      created_at TEXT)`)
  }

  private seedIfEmpty() {
    if (this.seeded) return
    this.seeded = true
    const rows = [...this.sql.exec('SELECT COUNT(*) AS n FROM items')]
    if ((rows[0] as { n: number }).n > 0) return
    for (const it of SEED_ITEMS) {
      this.sql.exec(
        'INSERT INTO items VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        it.id, it.name, it.description, it.price_cents, it.cap,
        it.includes_pass, it.status, it.sort, it.created_at,
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

  /* Fire-and-forget email. Never throws and never blocks or fails the
     visitor's submission: missing API key or a provider error just
     gets logged. */
  private async sendMail(args: {
    to: string
    subject: string
    text: string
    html?: string
    replyTo?: string
  }): Promise<void> {
    const apiKey = this.env.RESEND_API_KEY
    if (!apiKey) {
      console.log(`mail skipped (not configured): ${args.subject}`)
      return
    }
    try {
      const payload: Record<string, unknown> = {
        from: NOTIFY_FROM,
        to: [args.to],
        subject: args.subject,
        text: args.text,
      }
      if (args.html) payload.html = args.html
      if (args.replyTo) payload.reply_to = args.replyTo
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        console.error(
          `mail failed: ${args.subject}: Resend ${res.status}: ${await res.text()}`,
        )
        return
      }
      const data = (await res.json().catch(() => ({}))) as { id?: string }
      console.log(
        `mail sent: ${args.subject} -> ${args.to}${data.id ? ` (id ${data.id})` : ''}`,
      )
    } catch (err) {
      console.error(`mail failed: ${args.subject}:`, err)
    }
  }

  /* Plain notification to the park (scannable, no artwork). */
  private notify(subject: string, lines: string[]): Promise<void> {
    const to = this.env.NOTIFY_TO
    if (!to) {
      console.log(`mail skipped (no recipient): ${subject}`)
      return Promise.resolve()
    }
    return this.sendMail({ to, subject, text: lines.join('\n') })
  }

  /* Designed confirmation to the visitor who submitted the form. */
  private confirm(
    to: string,
    subject: string,
    parts: ConfirmationParts,
  ): Promise<void> {
    return this.sendMail({
      to,
      subject,
      text: confirmationText(parts),
      html: confirmationHtml(parts),
      replyTo: REPLY_TO,
    })
  }

  private setupDone(): boolean {
    return this.meta('setup_done') === '1'
  }

  private async authed(request: Request): Promise<boolean> {
    return verifySessionToken(
      this.meta('session_secret'),
      request.headers.get('X-Session'),
    )
  }

  private itemRow(r: Record<string, unknown>) {
    return {
      id: r.id, name: r.name, description: r.description,
      priceCents: r.price_cents, cap: r.cap,
      includesPass: r.includes_pass === 1, status: r.status,
      sort: r.sort, createdAt: r.created_at,
    }
  }

  private publicState() {
    const events = [...this.sql.exec(
      "SELECT * FROM events WHERE status = 'open' ORDER BY date, start_time",
    )].map((r) => {
      const e = r as Record<string, unknown>
      const taken = [...this.sql.exec(
        'SELECT COALESCE(SUM(spots), 0) AS n FROM rsvps WHERE event_id = ?',
        e.id,
      )][0] as { n: number }
      const cap = e.cap as number
      return {
        id: e.id, title: e.title, date: e.date,
        startTime: e.start_time, endTime: e.end_time,
        project: e.project, cap, priceCents: e.price_cents,
        bring: e.bring, confirmText: e.confirm_text,
        spotsPer: e.spots_per, spotsLeft: Math.max(0, cap - taken.n),
      }
    })
    const items = [...this.sql.exec(
      "SELECT * FROM items WHERE status IN ('active', 'coming_soon') ORDER BY sort, created_at",
    )].map((r) => {
      const it = this.itemRow(r as Record<string, unknown>)
      const count = [...this.sql.exec(
        'SELECT COUNT(*) AS n FROM sponsor_orders WHERE item_id = ?', it.id,
      )][0] as { n: number }
      return {
        ...it,
        taken: count.n,
        spotsLeft:
          it.cap === null ? null : Math.max(0, (it.cap as number) - count.n),
      }
    })
    const paverSizes = [...this.sql.exec(
      'SELECT * FROM paver_sizes ORDER BY sort, created_at',
    )].map((r) => {
      const s = r as Record<string, unknown>
      return {
        id: s.id, name: s.name, dimensions: s.dimensions,
        priceCents: s.price_cents, fits: s.fits, sort: s.sort,
      }
    })
    return { events, items, paverSizes }
  }

  private adminState() {
    const pub = this.publicState()
    const events = [...this.sql.exec(
      'SELECT * FROM events ORDER BY date DESC, created_at DESC',
    )].map((r) => {
      const e = r as Record<string, unknown>
      return {
        id: e.id, title: e.title, date: e.date, startTime: e.start_time,
        endTime: e.end_time, project: e.project, cap: e.cap,
        priceCents: e.price_cents, bring: e.bring,
        confirmText: e.confirm_text, spotsPer: e.spots_per,
        status: e.status, createdAt: e.created_at,
      }
    })
    const rsvps = [...this.sql.exec(
      'SELECT * FROM rsvps ORDER BY created_at',
    )].map((r) => {
      const v = r as Record<string, unknown>
      return {
        id: v.id, eventId: v.event_id, name: v.name, email: v.email,
        phone: v.phone, spots: v.spots, confirmed: v.confirmed === 1,
        attended: v.attended === 1, createdAt: v.created_at,
      }
    })
    const items = [...this.sql.exec(
      'SELECT * FROM items ORDER BY sort, created_at',
    )].map((r) => this.itemRow(r as Record<string, unknown>))
    const sponsorOrders = [...this.sql.exec(
      'SELECT * FROM sponsor_orders ORDER BY created_at DESC',
    )].map((r) => {
      const o = r as Record<string, unknown>
      return {
        id: o.id, itemId: o.item_id, plaqueType: o.plaque_type,
        plaqueText: o.plaque_text, passHolder: o.pass_holder,
        email: o.email, phone: o.phone, paid: o.paid === 1,
        assigned: o.assigned, createdAt: o.created_at,
      }
    })
    const itemInterest = [...this.sql.exec(
      'SELECT * FROM item_interest ORDER BY created_at DESC',
    )].map((r) => {
      const o = r as Record<string, unknown>
      return { id: o.id, itemId: o.item_id, name: o.name, email: o.email, createdAt: o.created_at }
    })
    const paverSizes = pub.paverSizes
    const paverOrders = [...this.sql.exec(
      'SELECT * FROM paver_orders ORDER BY created_at DESC',
    )].map((r) => {
      const o = r as Record<string, unknown>
      return {
        id: o.id, sizeId: o.size_id, choice: o.choice,
        printName: o.print_name, printDate: o.print_date,
        contactName: o.contact_name, email: o.email, phone: o.phone,
        paid: o.paid === 1, productionStatus: o.production_status,
        location: o.location, createdAt: o.created_at,
      }
    })
    const paverInterest = [...this.sql.exec(
      'SELECT * FROM paver_interest ORDER BY created_at DESC',
    )].map((r) => {
      const o = r as Record<string, unknown>
      return { id: o.id, name: o.name, email: o.email, interest: o.interest, createdAt: o.created_at }
    })
    return {
      setupDone: true, authed: true, events, rsvps, items,
      sponsorOrders, itemInterest, paverSizes, paverOrders, paverInterest,
    }
  }

  private purgeTestData() {
    this.sql.exec('DELETE FROM rsvps')
    this.sql.exec('DELETE FROM events')
    this.sql.exec('DELETE FROM sponsor_orders')
    this.sql.exec('DELETE FROM item_interest')
    this.sql.exec('DELETE FROM paver_orders')
    this.sql.exec('DELETE FROM paver_interest')
    this.sql.exec('DELETE FROM paver_sizes')
    this.sql.exec('DELETE FROM items')
    this.seeded = false
    this.seedIfEmpty()
  }

  async fetch(request: Request): Promise<Response> {
    this.seedIfEmpty()
    const url = new URL(request.url)
    const path = url.pathname

    let body: Record<string, unknown> = {}
    if (request.method === 'POST') {
      try {
        body = (await request.json()) as Record<string, unknown>
      } catch {
        return json({ error: 'Invalid request.' }, 400)
      }
    }
    const str = (v: unknown) => (typeof v === 'string' ? v.trim() : '')

    if (path === '/public-state' && request.method === 'GET') {
      return json(this.publicState())
    }

    /* ---- RSVP ---- */
    if (path === '/rsvp' && request.method === 'POST') {
      if (str(body.website)) return json({ ok: true }) // honeypot
      const eventId = str(body.eventId)
      const name = str(body.name)
      const email = str(body.email)
      const phone = str(body.phone)
      if (!eventId || !name || !email) {
        return json({ error: 'Please add your name and email so we can reach you.' }, 400)
      }
      if (!EMAIL_RE.test(email)) {
        return json({ error: 'That email doesn’t look quite right — mind checking it?' }, 400)
      }
      if (name.length > 100 || email.length > 200 || phone.length > 40) {
        return json({ error: 'Invalid request.' }, 400)
      }
      const rows = [...this.sql.exec('SELECT * FROM events WHERE id = ?', eventId)]
      if (!rows.length) return json({ error: 'That event is no longer available.' }, 404)
      const ev = rows[0] as Record<string, unknown>
      if (ev.status !== 'open') {
        return json({ error: 'That event is closed for now.' }, 400)
      }
      const spotsPer = Math.max(1, Number(ev.spots_per) || 1)
      let spots = Math.floor(Number(body.spots) || 1)
      if (spots < 1) spots = 1
      if (spots > spotsPer) spots = spotsPer
      if (str(ev.confirm_text as string) && body.confirmed !== true) {
        return json({ error: 'Please tick the confirmation to RSVP.' }, 400)
      }
      const taken = [...this.sql.exec(
        'SELECT COALESCE(SUM(spots), 0) AS n FROM rsvps WHERE event_id = ?', eventId,
      )][0] as { n: number }
      if (taken.n + spots > (ev.cap as number)) {
        return json({ error: 'That event just filled up — sorry!' }, 409)
      }
      const dup = [...this.sql.exec(
        'SELECT COUNT(*) AS n FROM rsvps WHERE event_id = ? AND lower(email) = lower(?)',
        eventId, email,
      )]
      if ((dup[0] as { n: number }).n > 0) {
        return json({ error: 'You’re already on the list for this event — thank you!' }, 409)
      }
      this.sql.exec(
        'INSERT INTO rsvps VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        newId('rsvp'), eventId, name, email, phone, spots,
        body.confirmed === true ? 1 : 0, 0, new Date().toISOString(),
      )
      const evTitle = String(ev.title ?? 'Event')
      const evWhen = [ev.date, ev.start_time, ev.end_time]
        .filter((v) => typeof v === 'string' && v)
        .join(' ')
      const rsvpLines = [
        'New event RSVP on hues.flowers',
        '',
        `Event: ${evTitle}`,
        `When: ${evWhen}`,
        `Spots: ${spots}`,
        `Name: ${name}`,
        `Email: ${email}`,
      ]
      if (phone) rsvpLines.push(`Phone: ${phone}`)
      rsvpLines.push('', `Manage it: ${ADMIN_URL}`)
      this.ctx.waitUntil(
        this.notify(`New event RSVP — ${evTitle}`, rsvpLines),
      )
      this.ctx.waitUntil(
        this.confirm(email, `You're on the list — ${evTitle} at Hues`, {
          image: GATHER_IMG,
          imageAlt: TRIO_ALT_GATHER,
          heading: 'We’ll save you a spot',
          intro: [
            `Hello ${name} — thank you. We're so pleased you're coming.`,
            `Your ${spots === 1 ? 'spot is' : `${spots} spots are`} held for ${evTitle}. These little gatherings are some of our favourite hours in the park, and now you'll be part of this one.`,
          ],
          details: [
            ['Event', evTitle],
            ['When', evWhen],
            ['Spots held', String(spots)],
            ['Where', 'Hues Floral Park, 93485 River Road, Junction City, Oregon'],
          ],
          closing: [
            'What happens next: nothing at all, for now — just come as you are when the day arrives. If there’s anything worth knowing beforehand, Dusty will write to you at this email.',
            'If your plans change, just reply to this email and let us know, so someone else can take the spot.',
          ],
        }),
      )
      return json({ ok: true })
    }

    /* ---- Sponsor order ---- */
    if (path === '/sponsor' && request.method === 'POST') {
      if (str(body.website)) return json({ ok: true }) // honeypot
      const itemId = str(body.itemId)
      const plaqueType = str(body.plaqueType)
      const plaqueText = str(body.plaqueText)
      const passHolder = str(body.passHolder)
      const email = str(body.email)
      const phone = str(body.phone)
      const PLAQUE_TYPES = ['own name', 'family name', 'business name', 'dedication']
      if (!itemId || !PLAQUE_TYPES.includes(plaqueType) || !plaqueText || !email) {
        return json({ error: 'Please choose a plaque style, add the plaque wording, and an email.' }, 400)
      }
      if (!EMAIL_RE.test(email)) {
        return json({ error: 'That email doesn’t look quite right — mind checking it?' }, 400)
      }
      if (plaqueText.length > 120 || email.length > 200 || passHolder.length > 100) {
        return json({ error: 'Invalid request.' }, 400)
      }
      const rows = [...this.sql.exec('SELECT * FROM items WHERE id = ?', itemId)]
      if (!rows.length) return json({ error: 'That sponsorship is no longer available.' }, 404)
      const item = rows[0] as Record<string, unknown>
      if (item.status !== 'active') {
        return json({ error: 'That sponsorship isn’t open yet.' }, 400)
      }
      if (item.includes_pass === 1 && !passHolder) {
        return json({ error: 'Please add the season pass holder’s full name.' }, 400)
      }
      if (item.cap !== null && item.cap !== undefined) {
        const count = [...this.sql.exec(
          'SELECT COUNT(*) AS n FROM sponsor_orders WHERE item_id = ?', itemId,
        )][0] as { n: number }
        if (count.n >= (item.cap as number)) {
          return json({ error: 'All of those have been sponsored — thank you!' }, 409)
        }
      }
      const dup = [...this.sql.exec(
        'SELECT COUNT(*) AS n FROM sponsor_orders WHERE item_id = ? AND lower(email) = lower(?) AND plaque_text = ?',
        itemId, email, plaqueText,
      )]
      if ((dup[0] as { n: number }).n > 0) {
        return json({ error: 'We already have that exact sponsorship from you — thank you!' }, 409)
      }
      this.sql.exec(
        'INSERT INTO sponsor_orders VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        newId('order'), itemId, plaqueType, plaqueText, passHolder,
        email, phone, 0, '', new Date().toISOString(),
      )
      const itemName = String(item.name ?? 'Sponsorship')
      const price = formatCents(item.price_cents)
      const sponsorLines = [
        'New sponsorship reservation on hues.flowers (no payment taken — reservation only)',
        '',
        `Item: ${itemName}${price ? ` (${price})` : ''}`,
        `Plaque type: ${plaqueType}`,
        `Plaque text: ${plaqueText}`,
      ]
      if (passHolder) sponsorLines.push(`Season pass holder: ${passHolder}`)
      sponsorLines.push(`Email: ${email}`)
      if (phone) sponsorLines.push(`Phone: ${phone}`)
      sponsorLines.push('', `Manage it: ${ADMIN_URL}`)
      this.ctx.waitUntil(
        this.notify(`New sponsorship — ${itemName}`, sponsorLines),
      )
      const sponsorDetails: Array<[string, string]> = [['Item', itemName]]
      if (price) sponsorDetails.push(['Price', price])
      sponsorDetails.push(['Plaque style', plaqueType], ['Plaque wording', plaqueText])
      if (passHolder) sponsorDetails.push(['Season pass holder', passHolder])
      this.ctx.waitUntil(
        this.confirm(email, 'Thank you — your sponsorship is reserved', {
          image: GIVE_IMG,
          imageAlt: TRIO_ALT_GIVE,
          heading: 'Thank you for helping the park grow',
          intro: [
            `Hello${passHolder ? ` ${passHolder}` : ''} — thank you, truly.`,
            `We've set aside a ${itemName.replace(/^Sponsor /, '').toLowerCase()} for you. When the season opens, your plaque will stand at the end of the bed, and the flowers will do the rest, all summer long.`,
          ],
          details: sponsorDetails,
          closing: [
            'One honest note: this is a reservation, not a payment. No payment has been taken, and nothing has been charged. Dusty will be in touch at this email soon to arrange payment and talk through the details with you personally.',
            'If anything looks off, or your plans change, just reply to this email.',
          ],
        }),
      )
      return json({ ok: true })
    }

    /* ---- Coming-soon interest (catalog items) ---- */
    if (path === '/item-interest' && request.method === 'POST') {
      if (str(body.website)) return json({ ok: true })
      const itemId = str(body.itemId)
      const name = str(body.name)
      const email = str(body.email)
      if (!itemId || !name || !EMAIL_RE.test(email)) {
        return json({ error: 'Please add your name and a valid email.' }, 400)
      }
      const rows = [...this.sql.exec('SELECT id, name FROM items WHERE id = ?', itemId)]
      if (!rows.length) return json({ error: 'Not found.' }, 404)
      const dup = [...this.sql.exec(
        'SELECT COUNT(*) AS n FROM item_interest WHERE item_id = ? AND lower(email) = lower(?)',
        itemId, email,
      )]
      if ((dup[0] as { n: number }).n > 0) {
        return json({ error: 'You’re already on that list — thank you!' }, 409)
      }
      this.sql.exec(
        'INSERT INTO item_interest VALUES (?, ?, ?, ?, ?)',
        newId('interest'), itemId, name, email, new Date().toISOString(),
      )
      const interestItemName =
        String((rows[0] as Record<string, unknown>).name ?? 'Sponsorship')
      this.ctx.waitUntil(
        this.notify(`New sponsorship interest — ${interestItemName}`, [
          'New coming-soon sponsorship interest on hues.flowers',
          '',
          `Item: ${interestItemName}`,
          `Name: ${name}`,
          `Email: ${email}`,
          '',
          `Manage it: ${ADMIN_URL}`,
        ]),
      )
      this.ctx.waitUntil(
        this.confirm(email, `You're on the list — ${interestItemName}`, {
          image: GIVE_IMG,
          imageAlt: TRIO_ALT_GIVE,
          heading: 'Thank you for dreaming along with us',
          intro: [
            `Hello ${name} — thank you.`,
            `${interestItemName} isn't open yet, but your name is on the list now, and you'll be among the very first to know when it is.`,
          ],
          details: [['Item', interestItemName]],
          closing: [
            'No payment has been taken or asked for — this is simply your place in line, held with thanks. When the day comes, Dusty will write to you at this email.',
            'If your plans change in the meantime, just reply to this email.',
          ],
        }),
      )
      return json({ ok: true })
    }

    /* ---- Paver order ---- */
    if (path === '/paver-order' && request.method === 'POST') {
      if (str(body.website)) return json({ ok: true })
      const sizeId = str(body.sizeId)
      const choice = str(body.choice)
      const printName = str(body.printName)
      const printDate = str(body.printDate)
      const contactName = str(body.contactName)
      const email = str(body.email)
      const phone = str(body.phone)
      if (!sizeId || !choice || !printName || !contactName || !EMAIL_RE.test(email)) {
        return json({ error: 'Please pick a size, what goes on it, the name for the paver, and your contact details.' }, 400)
      }
      const rows = [...this.sql.exec('SELECT id, name, price_cents FROM paver_sizes WHERE id = ?', sizeId)]
      if (!rows.length) return json({ error: 'That paver size is no longer available.' }, 404)
      this.sql.exec(
        'INSERT INTO paver_orders VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        newId('paver'), sizeId, choice, printName, printDate, contactName,
        email, phone, 0, 'ordered', '', new Date().toISOString(),
      )
      const sizeName =
        String((rows[0] as Record<string, unknown>).name ?? 'Paver')
      const paverLines = [
        'New paver order on hues.flowers (no payment taken — reservation only)',
        '',
        `Size: ${sizeName}`,
        `What goes on it: ${choice}`,
        `Name for the paver: ${printName}`,
      ]
      if (printDate) paverLines.push(`Date for the paver: ${printDate}`)
      paverLines.push(`Contact: ${contactName}`, `Email: ${email}`)
      if (phone) paverLines.push(`Phone: ${phone}`)
      paverLines.push('', `Manage it: ${ADMIN_URL}`)
      this.ctx.waitUntil(
        this.notify(`New paver order — ${sizeName}`, paverLines),
      )
      const sizePrice = formatCents(
        (rows[0] as Record<string, unknown>).price_cents,
      )
      const paverDetails: Array<[string, string]> = [
        ['Size', sizeName],
        ['What goes on it', choice],
        ['Name for the paver', printName],
      ]
      if (printDate) paverDetails.push(['Date for the paver', printDate])
      if (sizePrice) paverDetails.push(['Price', sizePrice])
      this.ctx.waitUntil(
        this.confirm(email, 'Thank you — your paver is reserved', {
          image: GIVE_IMG,
          imageAlt: TRIO_ALT_GIVE,
          heading: 'A little piece of the path, with your name on it',
          intro: [
            `Hello ${contactName} — thank you.`,
            'Your paver is reserved. One of these days, someone strolling the garden path will slow down right where your name is set in stone — and now that’s part of Hues because of you.',
          ],
          details: paverDetails,
          closing: [
            'One honest note: this is a reservation, not a payment. No payment has been taken, and nothing has been charged. Dusty will be in touch at this email soon to arrange payment and confirm the wording with you before anything is made.',
            'If anything looks off, just reply to this email.',
          ],
        }),
      )
      return json({ ok: true })
    }

    /* ---- Paver interest ---- */
    if (path === '/paver-interest' && request.method === 'POST') {
      if (str(body.website)) return json({ ok: true })
      const name = str(body.name)
      const email = str(body.email)
      const interest = str(body.interest)
      if (!name || !EMAIL_RE.test(email) || !['hand print', 'foot print', 'text'].includes(interest)) {
        return json({ error: 'Please add your name, a valid email, and what you’re interested in.' }, 400)
      }
      const dup = [...this.sql.exec(
        'SELECT COUNT(*) AS n FROM paver_interest WHERE lower(email) = lower(?)',
        email,
      )]
      if ((dup[0] as { n: number }).n > 0) {
        return json({ error: 'You’re already on the paver list — thank you!' }, 409)
      }
      this.sql.exec(
        'INSERT INTO paver_interest VALUES (?, ?, ?, ?, ?)',
        newId('pint'), name, email, interest, new Date().toISOString(),
      )
      this.ctx.waitUntil(
        this.notify(`New paver interest — ${interest}`, [
          'New paver interest signup on hues.flowers',
          '',
          `Interested in: ${interest}`,
          `Name: ${name}`,
          `Email: ${email}`,
          '',
          `Manage it: ${ADMIN_URL}`,
        ]),
      )
      this.ctx.waitUntil(
        this.confirm(email, 'You’re on the paver list', {
          image: GIVE_IMG,
          imageAlt: TRIO_ALT_GIVE,
          heading: 'Thank you for dreaming along with us',
          intro: [
            `Hello ${name} — thank you.`,
            `You're on the list for a paver with a ${interest}. The pathway pavers aren't open yet, but your name is held now, and you'll be among the very first to know when they are.`,
          ],
          details: [['Interested in', `Paver — ${interest}`]],
          closing: [
            'No payment has been taken or asked for — this is simply your place in line, held with thanks. When the day comes, Dusty will write to you at this email.',
            'If your plans change in the meantime, just reply to this email.',
          ],
        }),
      )
      return json({ ok: true })
    }

    /* ---- auth (same pattern as volunteers) ---- */
    if (path === '/auth/status' && request.method === 'GET') {
      return json({ setupDone: this.setupDone() })
    }

    if (path === '/auth/setup' && request.method === 'POST') {
      if (this.setupDone()) return json({ error: 'Setup is already complete.' }, 400)
      const code = str(body.code)
      const password = typeof body.password === 'string' ? body.password : ''
      if (!code || password.length < 8) {
        return json({ error: 'Enter the setup code and a password of 8+ characters.' }, 400)
      }
      if ((await sha256Hex(code)) !== this.env.SETUP_CODE_HASH) {
        return json({ error: 'That setup code isn’t right.' }, 403)
      }
      const salt = randomHex(16)
      this.setMeta('password_hash', await hashPassword(password, salt))
      this.setMeta('password_salt', salt)
      this.setMeta('session_secret', randomHex(32))
      this.setMeta('setup_done', '1')
      const token = await createSessionToken(this.meta('session_secret')!)
      return json({ ok: true, sessionToken: token })
    }

    if (path === '/auth/login' && request.method === 'POST') {
      const password = typeof body.password === 'string' ? body.password : ''
      const hash = this.meta('password_hash')
      const salt = this.meta('password_salt')
      const secret = this.meta('session_secret')
      if (!this.setupDone() || !hash || !salt || !secret) {
        return json({ error: 'Setup hasn’t been completed yet.' }, 400)
      }
      if ((await hashPassword(password, salt)) !== hash) {
        return json({ error: 'That password isn’t right.' }, 403)
      }
      return json({ ok: true, sessionToken: await createSessionToken(secret) })
    }

    /* ---- maintenance gated by setup code ---- */
    if (path === '/maintenance/purge' && request.method === 'POST') {
      // Pre-setup only (E2E test cleanup). Disabled once setup completes.
      if (this.setupDone()) return json({ error: 'Setup is already complete.' }, 400)
      if ((await sha256Hex(str(body.code))) !== this.env.SETUP_CODE_HASH) {
        return json({ error: 'That setup code isn’t right.' }, 403)
      }
      this.purgeTestData()
      return json({ ok: true })
    }

    if (path === '/maintenance/reset-admin' && request.method === 'POST') {
      if ((await sha256Hex(str(body.code))) !== this.env.SETUP_CODE_HASH) {
        return json({ error: 'That setup code isn’t right.' }, 403)
      }
      this.sql.exec("DELETE FROM meta WHERE key IN ('password_hash', 'password_salt', 'session_secret', 'setup_done')")
      return json({ ok: true })
    }


    /* ---- admin ---- */
    if (path === '/admin/state' && request.method === 'GET') {
      if (!this.setupDone()) return json({ setupDone: false, authed: false })
      if (!(await this.authed(request))) return json({ setupDone: true, authed: false })
      return json(this.adminState())
    }

    if (path === '/admin/plaques.csv' && request.method === 'GET') {
      if (!(await this.authed(request))) return json({ error: 'Not signed in.' }, 401)
      const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`
      const lines = ['item,plaque_type,plaque_text,pass_holder,email,paid,assigned,ordered_at']
      const itemNames: Record<string, string> = {}
      for (const r of this.sql.exec('SELECT id, name FROM items')) {
        const it = r as Record<string, unknown>
        itemNames[it.id as string] = it.name as string
      }
      for (const r of this.sql.exec('SELECT * FROM sponsor_orders ORDER BY created_at')) {
        const o = r as Record<string, unknown>
        lines.push([itemNames[o.item_id as string] ?? o.item_id, o.plaque_type, o.plaque_text, o.pass_holder, o.email, o.paid === 1 ? 'paid' : 'unpaid', o.assigned, o.created_at].map(esc).join(','))
      }
      return new Response(lines.join('\n'), {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="hues-play-plaques.csv"',
        },
      })
    }

    if (path === '/admin/action' && request.method === 'POST') {
      if (!(await this.authed(request))) return json({ error: 'Not signed in.' }, 401)
      const action = str(body.action)

      if (action === 'create_event' || action === 'update_event') {
        const e = (body.event ?? {}) as Record<string, unknown>
        const cap = Math.max(1, Math.min(500, Number(e.cap) || 10))
        const priceCents = Math.max(0, Math.round(Number(e.priceCents) || 0))
        const spotsPer = Math.max(1, Math.min(10, Number(e.spotsPer) || 1))
        if (action === 'create_event') {
          if (!str(e.title) || !str(e.date)) return json({ error: 'An event needs a title and a date.' }, 400)
          const ev = { id: newId('event') }
          this.sql.exec(
            'INSERT INTO events VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            ev.id, str(e.title), str(e.date), str(e.startTime), str(e.endTime),
            str(e.project), cap, priceCents, str(e.bring), str(e.confirmText),
            spotsPer, 'open', new Date().toISOString(),
          )
          return json({ ok: true, event: ev })
        }
        const id = str(e.id)
        const rows = [...this.sql.exec('SELECT * FROM events WHERE id = ?', id)]
        if (!rows.length) return json({ error: 'Event not found.' }, 404)
        const ex = rows[0] as Record<string, unknown>
        const pick = (k: string) => (typeof e[k] === 'string' ? (e[k] as string).trim() : ex[k])
        const pickNum = (k: string, fallback: number) => (typeof e[k] === 'number' ? e[k] : fallback)
        this.sql.exec(
          'UPDATE events SET title = ?, date = ?, start_time = ?, end_time = ?, project = ?, cap = ?, price_cents = ?, bring = ?, confirm_text = ?, spots_per = ?, status = ? WHERE id = ?',
          pick('title'), pick('date'), pick('startTime'), pick('endTime'), pick('project'),
          pickNum('cap', cap), pickNum('priceCents', priceCents), pick('bring'), pick('confirmText'),
          pickNum('spotsPer', spotsPer), pick('status'), id,
        )
        return json({ ok: true })
      }

      if (action === 'delete_event') {
        const id = str(body.eventId)
        this.sql.exec('DELETE FROM rsvps WHERE event_id = ?', id)
        this.sql.exec('DELETE FROM events WHERE id = ?', id)
        return json({ ok: true })
      }

      if (action === 'delete_rsvp') {
        this.sql.exec('DELETE FROM rsvps WHERE id = ?', str(body.rsvpId))
        return json({ ok: true })
      }

      if (action === 'set_rsvp_attended') {
        this.sql.exec('UPDATE rsvps SET attended = ? WHERE id = ?', body.attended ? 1 : 0, str(body.rsvpId))
        return json({ ok: true })
      }

      if (action === 'create_item' || action === 'update_item') {
        const it = (body.item ?? {}) as Record<string, unknown>
        if (action === 'create_item') {
          if (!str(it.name)) return json({ error: 'An item needs a name.' }, 400)
          const item = { id: newId('item') }
          this.sql.exec(
            'INSERT INTO items VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            item.id, str(it.name), str(it.description),
            it.priceCents === null || it.priceCents === undefined ? null : Math.max(0, Math.round(Number(it.priceCents))),
            it.cap === null || it.cap === undefined || it.cap === '' ? null : Math.max(1, Math.round(Number(it.cap))),
            it.includesPass ? 1 : 0,
            ['active', 'coming_soon', 'hidden'].includes(str(it.status)) ? str(it.status) : 'coming_soon',
            Math.round(Number(it.sort) || 99), new Date().toISOString(),
          )
          return json({ ok: true, item })
        }
        const id = str(it.id)
        const rows = [...this.sql.exec('SELECT * FROM items WHERE id = ?', id)]
        if (!rows.length) return json({ error: 'Item not found.' }, 404)
        const ex = rows[0] as Record<string, unknown>
        const pick = (k: string) => (typeof it[k] === 'string' ? (it[k] as string).trim() : ex[k])
        this.sql.exec(
          'UPDATE items SET name = ?, description = ?, price_cents = ?, cap = ?, includes_pass = ?, status = ?, sort = ? WHERE id = ?',
          pick('name'), pick('description'),
          it.priceCents === undefined ? ex.price_cents : (it.priceCents === null || it.priceCents === '' ? null : Math.max(0, Math.round(Number(it.priceCents)))),
          it.cap === undefined ? ex.cap : (it.cap === null || it.cap === '' ? null : Math.max(1, Math.round(Number(it.cap)))),
          it.includesPass === undefined ? ex.includes_pass : (it.includesPass ? 1 : 0),
          pick('status'),
          it.sort === undefined ? ex.sort : Math.round(Number(it.sort) || 99),
          id,
        )
        return json({ ok: true })
      }

      if (action === 'delete_item') {
        const id = str(body.itemId)
        this.sql.exec('DELETE FROM sponsor_orders WHERE item_id = ?', id)
        this.sql.exec('DELETE FROM item_interest WHERE item_id = ?', id)
        this.sql.exec('DELETE FROM items WHERE id = ?', id)
        return json({ ok: true })
      }

      if (action === 'update_sponsor_order') {
        const o = (body.order ?? {}) as Record<string, unknown>
        const id = str(o.id)
        const rows = [...this.sql.exec('SELECT * FROM sponsor_orders WHERE id = ?', id)]
        if (!rows.length) return json({ error: 'Order not found.' }, 404)
        const ex = rows[0] as Record<string, unknown>
        this.sql.exec(
          'UPDATE sponsor_orders SET paid = ?, assigned = ? WHERE id = ?',
          o.paid === undefined ? ex.paid : (o.paid ? 1 : 0),
          typeof o.assigned === 'string' ? o.assigned.trim() : ex.assigned,
          id,
        )
        return json({ ok: true })
      }

      if (action === 'delete_sponsor_order') {
        this.sql.exec('DELETE FROM sponsor_orders WHERE id = ?', str(body.orderId))
        return json({ ok: true })
      }

      if (action === 'delete_item_interest') {
        this.sql.exec('DELETE FROM item_interest WHERE id = ?', str(body.interestId))
        return json({ ok: true })
      }

      if (action === 'create_paver_size' || action === 'update_paver_size') {
        const s = (body.size ?? {}) as Record<string, unknown>
        if (action === 'create_paver_size') {
          if (!str(s.name)) return json({ error: 'A size needs a name.' }, 400)
          const size = { id: newId('size') }
          this.sql.exec(
            'INSERT INTO paver_sizes VALUES (?, ?, ?, ?, ?, ?, ?)',
            size.id, str(s.name), str(s.dimensions),
            Math.max(0, Math.round(Number(s.priceCents) || 0)), str(s.fits),
            Math.round(Number(s.sort) || 99), new Date().toISOString(),
          )
          return json({ ok: true, size })
        }
        const id = str(s.id)
        const rows = [...this.sql.exec('SELECT * FROM paver_sizes WHERE id = ?', id)]
        if (!rows.length) return json({ error: 'Size not found.' }, 404)
        const ex = rows[0] as Record<string, unknown>
        const pick = (k: string) => (typeof s[k] === 'string' ? (s[k] as string).trim() : ex[k])
        this.sql.exec(
          'UPDATE paver_sizes SET name = ?, dimensions = ?, price_cents = ?, fits = ?, sort = ? WHERE id = ?',
          pick('name'), pick('dimensions'),
          s.priceCents === undefined ? ex.price_cents : Math.max(0, Math.round(Number(s.priceCents))),
          pick('fits'), s.sort === undefined ? ex.sort : Math.round(Number(s.sort) || 99), id,
        )
        return json({ ok: true })
      }

      if (action === 'delete_paver_size') {
        this.sql.exec('DELETE FROM paver_sizes WHERE id = ?', str(body.sizeId))
        return json({ ok: true })
      }

      if (action === 'update_paver_order') {
        const o = (body.order ?? {}) as Record<string, unknown>
        const id = str(o.id)
        const rows = [...this.sql.exec('SELECT * FROM paver_orders WHERE id = ?', id)]
        if (!rows.length) return json({ error: 'Order not found.' }, 404)
        const ex = rows[0] as Record<string, unknown>
        const STATUSES = ['ordered', 'print_done', 'cast', 'cured', 'installed']
        this.sql.exec(
          'UPDATE paver_orders SET paid = ?, production_status = ?, location = ? WHERE id = ?',
          o.paid === undefined ? ex.paid : (o.paid ? 1 : 0),
          typeof o.productionStatus === 'string' && STATUSES.includes(o.productionStatus) ? o.productionStatus : ex.production_status,
          typeof o.location === 'string' ? o.location.trim() : ex.location,
          id,
        )
        return json({ ok: true })
      }

      if (action === 'delete_paver_order') {
        this.sql.exec('DELETE FROM paver_orders WHERE id = ?', str(body.orderId))
        return json({ ok: true })
      }

      if (action === 'delete_paver_interest') {
        this.sql.exec('DELETE FROM paver_interest WHERE id = ?', str(body.interestId))
        return json({ ok: true })
      }

      if (action === 'reset_admin') {
        if ((await sha256Hex(str(body.code))) !== this.env.SETUP_CODE_HASH) {
          return json({ error: 'That setup code isn’t right.' }, 403)
        }
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
    const stub = env.BOARD.get(env.BOARD.idFromName('play'))
    return stub.fetch(request)
  },
}
