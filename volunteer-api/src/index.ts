/*
  hues-volunteers-api — data + auth service for the hues.flowers
  volunteer board. A single Durable Object (SQLite) serializes every
  read/write, so slot capacities and signup counts are exact (KV's
  eventual consistency lost signups in testing — see goal notes).

  The Next.js site proxies to this worker server-side; browsers only
  ever talk to hues.flowers.
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
const ADMIN_URL = 'https://hues.flowers/volunteer/admin'
const PARK_ADDRESS = '93485 River Road, Junction City, Oregon'
const HEADER_IMG = 'https://hues.flowers/email/email-header-volunteer.jpg'

/* ---------------- crypto helpers ---------------- */

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

async function hashPassword(
  password: string,
  saltHex: string,
): Promise<string> {
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

/* ---------------- email notification helpers ---------------- */

function formatSlotTime(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString('en-US', {
    timeZone: 'America/Los_Angeles',
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
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
    `<tr><td style="padding:0 36px 28px 36px;font-family:${serif};font-size:13px;line-height:1.5;color:#55644F;">Hues Floral Park · ${PARK_ADDRESS} · hues.flowers</td></tr>`,
    '</table></td></tr></table></body></html>',
  ].join('')
}

/* ---------------- seed data (first run only) ---------------- */

const SEED_TASKS = [
  {
    id: 'task-bulb-planting',
    title: 'Bulb Planting Day',
    description:
      'Tulips and giant alliums going in for spring. Digging, dropping, covering — satisfying work, and gloves are provided.',
    duration: 'About 2–3 hours',
    setting: 'Outdoors',
    physical: 'Some kneeling',
    created_at: '2026-10-26T16:30:00.000Z',
  },
  {
    id: 'task-tuber-dividing',
    title: 'Dahlia Tuber Dividing',
    description:
      "Help lift, divide, and store this year's tubers — next summer's color, sleeping in boxes until spring. We'll teach you; it's easier than it looks.",
    duration: 'About 2 hours',
    setting: 'Under cover',
    physical: 'Seated option available',
    created_at: '2026-10-26T16:30:01.000Z',
  },
  {
    id: 'task-bed-cleanup',
    title: 'Bed Cleanup & Leaf Mulch',
    description:
      'Clearing the finished beds and tucking them in under leaf mulch for winter. Quiet, steady work with a very visible before-and-after.',
    duration: 'About 2 hours',
    setting: 'Outdoors',
    physical: 'Light lifting',
    created_at: '2026-10-26T16:30:02.000Z',
  },
  {
    id: 'task-seed-starting',
    title: 'Seed-Starting Help',
    description:
      'Sowing the slow seeds — sweet peas, lupine, columbine — into trays to grow on cool through winter. Labeling, watering, and dreaming about May.',
    duration: 'About 1–2 hours',
    setting: 'Under cover',
    physical: 'Seated, gentle work',
    created_at: '2026-10-26T16:30:03.000Z',
  },
]

const SEED_SLOTS = [
  { id: 'slot-bulb-1', task_id: 'task-bulb-planting', starts_at: '2026-11-07T09:30:00-08:00', capacity: 6 },
  { id: 'slot-bulb-2', task_id: 'task-bulb-planting', starts_at: '2026-11-08T13:00:00-08:00', capacity: 6 },
  { id: 'slot-tuber-1', task_id: 'task-tuber-dividing', starts_at: '2026-11-14T10:00:00-08:00', capacity: 4 },
  { id: 'slot-cleanup-1', task_id: 'task-bed-cleanup', starts_at: '2026-11-07T13:00:00-08:00', capacity: 6 },
  { id: 'slot-cleanup-2', task_id: 'task-bed-cleanup', starts_at: '2026-11-21T09:30:00-08:00', capacity: 6 },
  { id: 'slot-seed-1', task_id: 'task-seed-starting', starts_at: '2026-11-15T13:00:00-08:00', capacity: 4 },
]

/* ---------------- Durable Object ---------------- */

export class VolunteerBoard {
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
    this.sql.exec(`CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY, title TEXT, description TEXT, duration TEXT,
      setting TEXT, physical TEXT, status TEXT, created_at TEXT)`)
    this.sql.exec(`CREATE TABLE IF NOT EXISTS slots (
      id TEXT PRIMARY KEY, task_id TEXT, starts_at TEXT, capacity INTEGER)`)
    this.sql.exec(`CREATE TABLE IF NOT EXISTS signups (
      id TEXT PRIMARY KEY, slot_id TEXT, name TEXT, email TEXT,
      phone TEXT, note TEXT, created_at TEXT)`)
  }

  private seedIfEmpty() {
    if (this.seeded) return
    this.seeded = true
    const rows = [...this.sql.exec('SELECT COUNT(*) AS n FROM tasks')]
    if ((rows[0] as { n: number }).n > 0) return
    for (const t of SEED_TASKS) {
      this.sql.exec(
        'INSERT INTO tasks VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        t.id, t.title, t.description, t.duration, t.setting, t.physical,
        'open', t.created_at,
      )
    }
    for (const s of SEED_SLOTS) {
      this.sql.exec(
        'INSERT INTO slots VALUES (?, ?, ?, ?)',
        s.id, s.task_id, s.starts_at, s.capacity,
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

  private publicState() {
    const tasks = [...this.sql.exec(
      "SELECT * FROM tasks WHERE status = 'open' ORDER BY created_at",
    )].map((r) => {
      const t = r as Record<string, unknown>
      return {
        id: t.id, title: t.title, description: t.description,
        duration: t.duration, setting: t.setting, physical: t.physical,
        status: t.status, createdAt: t.created_at,
      }
    })
    const slots = [...this.sql.exec(
      'SELECT * FROM slots ORDER BY starts_at',
    )].map((r) => {
      const s = r as Record<string, unknown>
      return {
        id: s.id, taskId: s.task_id, startsAt: s.starts_at,
        capacity: s.capacity,
      }
    })
    const counts: Record<string, number> = {}
    for (const row of this.sql.exec(
      'SELECT slot_id, COUNT(*) AS n FROM signups GROUP BY slot_id',
    )) {
      const r = row as { slot_id: string; n: number }
      counts[r.slot_id] = r.n
    }
    return { tasks, slots, counts }
  }

  private adminState() {
    const tasks = [...this.sql.exec(
      'SELECT * FROM tasks ORDER BY created_at',
    )].map((r) => {
      const t = r as Record<string, unknown>
      return {
        id: t.id, title: t.title, description: t.description,
        duration: t.duration, setting: t.setting, physical: t.physical,
        status: t.status, createdAt: t.created_at,
      }
    })
    const slots = [...this.sql.exec(
      'SELECT * FROM slots ORDER BY starts_at',
    )].map((r) => {
      const s = r as Record<string, unknown>
      return {
        id: s.id, taskId: s.task_id, startsAt: s.starts_at,
        capacity: s.capacity,
      }
    })
    const signupsBySlot: Record<string, Array<unknown>> = {}
    for (const row of this.sql.exec(
      'SELECT * FROM signups ORDER BY created_at',
    )) {
      const s = row as Record<string, unknown>
      const key = s.slot_id as string
      signupsBySlot[key] = signupsBySlot[key] ?? []
      signupsBySlot[key].push({
        id: s.id, name: s.name, email: s.email, phone: s.phone,
        note: s.note, createdAt: s.created_at,
      })
    }
    return { setupDone: true, authed: true, tasks, slots, signupsBySlot }
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

    if (path === '/signup' && request.method === 'POST') {
      if (str(body.website)) return json({ ok: true }) // honeypot
      const slotId = str(body.slotId)
      const name = str(body.name)
      const email = str(body.email)
      const phone = str(body.phone)
      const note = str(body.note)
      if (!slotId || !name || !email) {
        return json(
          { error: 'Please add your name and email so we can reach you.' },
          400,
        )
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return json(
          { error: 'That email doesn’t look quite right — mind checking it?' },
          400,
        )
      }
      if (name.length > 100 || email.length > 200 || note.length > 500) {
        return json({ error: 'Invalid request.' }, 400)
      }
      const slotRows = [...this.sql.exec(
        'SELECT * FROM slots WHERE id = ?', slotId,
      )]
      if (!slotRows.length) {
        return json({ error: 'That time is no longer available.' }, 404)
      }
      const slot = slotRows[0] as { task_id: string; capacity: number; starts_at: string }
      const taskRows = [...this.sql.exec(
        'SELECT status, title FROM tasks WHERE id = ?', slot.task_id,
      )]
      if (!taskRows.length || (taskRows[0] as { status: string }).status !== 'open') {
        return json(
          { error: 'That task is no longer open for signups.' }, 400,
        )
      }
      const countRows = [...this.sql.exec(
        'SELECT COUNT(*) AS n FROM signups WHERE slot_id = ?', slotId,
      )]
      if ((countRows[0] as { n: number }).n >= slot.capacity) {
        return json(
          { error: 'That time just filled up — please pick another.' }, 409,
        )
      }
      const dup = [...this.sql.exec(
        'SELECT COUNT(*) AS n FROM signups WHERE slot_id = ? AND lower(email) = lower(?)',
        slotId, email,
      )]
      if ((dup[0] as { n: number }).n > 0) {
        return json(
          { error: 'You’re already signed up for this time — thank you!' },
          409,
        )
      }
      this.sql.exec(
        'INSERT INTO signups VALUES (?, ?, ?, ?, ?, ?, ?)',
        newId('signup'), slotId, name, email, phone, note,
        new Date().toISOString(),
      )
      const taskTitle =
        (taskRows[0] as { title?: string }).title ?? 'Volunteer task'
      const lines = [
        'New volunteer signup on hues.flowers',
        '',
        `Task: ${taskTitle}`,
        `Time: ${formatSlotTime(slot.starts_at)} (Pacific)`,
        `Name: ${name}`,
        `Email: ${email}`,
      ]
      if (phone) lines.push(`Phone: ${phone}`)
      if (note) lines.push(`Note: ${note}`)
      lines.push('', `See all signups: ${ADMIN_URL}`)
      this.ctx.waitUntil(
        this.notify(`New volunteer signup — ${taskTitle}`, lines),
      )
      this.ctx.waitUntil(
        this.confirm(email, `You're signed up — ${taskTitle} at Hues`, {
          image: HEADER_IMG,
          imageAlt:
            'A painting of Dusty, Hue the white rabbit, and Cocoa the brown rabbit waving beside a freshly planted flower bed with tools and a bucket of dahlias',
          heading: 'Thank you for raising your hand',
          intro: [
            `Hello ${name} — thank you. We're so glad you're coming.`,
            `You've signed up to help with ${taskTitle}, and we'll be watching for you. Everything here grows by hand, and now yours are two of them.`,
          ],
          details: [
            ['Task', taskTitle],
            ['When', `${formatSlotTime(slot.starts_at)} (Pacific)`],
            ['Where', `Hues Floral Park, ${PARK_ADDRESS}`],
          ],
          closing: [
            'What happens next is simple: come to the park a few minutes before your time, and Dusty will get you set up. Wear clothes that don’t mind a little honest dirt — gloves and tools are provided, and the flowers will do the rest.',
            'If your plans change, just reply to this email and let us know. No fuss at all.',
          ],
        }),
      )
      return json({ ok: true })
    }

    if (path === '/auth/status' && request.method === 'GET') {
      return json({ setupDone: this.setupDone() })
    }

    if (path === '/auth/setup' && request.method === 'POST') {
      if (this.setupDone()) {
        return json({ error: 'Setup is already complete.' }, 400)
      }
      const code = str(body.code)
      const password = typeof body.password === 'string' ? body.password : ''
      if (!code || password.length < 8) {
        return json(
          { error: 'Enter the setup code and a password of 8+ characters.' },
          400,
        )
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

    if (path === '/maintenance/purge' && request.method === 'POST') {
      // Pre-setup maintenance only (used to clear E2E test signups).
      // Permanently disabled the moment setup completes.
      if (this.setupDone()) {
        return json({ error: 'Setup is already complete.' }, 400)
      }
      if ((await sha256Hex(str(body.code))) !== this.env.SETUP_CODE_HASH) {
        return json({ error: 'That setup code isn’t right.' }, 403)
      }
      this.sql.exec('DELETE FROM signups')
      return json({ ok: true })
    }


    if (path === '/admin/state' && request.method === 'GET') {
      if (!this.setupDone()) return json({ setupDone: false, authed: false })
      if (!(await this.authed(request))) {
        return json({ setupDone: true, authed: false })
      }
      return json(this.adminState())
    }

    if (path === '/admin/action' && request.method === 'POST') {
      if (!(await this.authed(request))) {
        return json({ error: 'Not signed in.' }, 401)
      }
      const action = str(body.action)
      const task = (body.task ?? {}) as Record<string, unknown>
      const slot = (body.slot ?? {}) as Record<string, unknown>

      if (action === 'create_task') {
        if (!str(task.title)) {
          return json({ error: 'A task needs a title.' }, 400)
        }
        const t = {
          id: newId('task'),
          title: str(task.title),
          description: str(task.description),
          duration: str(task.duration),
          setting: str(task.setting),
          physical: str(task.physical),
          status: 'open',
          createdAt: new Date().toISOString(),
        }
        this.sql.exec(
          'INSERT INTO tasks VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          t.id, t.title, t.description, t.duration, t.setting, t.physical,
          t.status, t.createdAt,
        )
        return json({ ok: true, task: t })
      }

      if (action === 'update_task') {
        const id = str(task.id)
        const rows = [...this.sql.exec('SELECT * FROM tasks WHERE id = ?', id)]
        if (!rows.length) return json({ error: 'Task not found.' }, 404)
        const ex = rows[0] as Record<string, unknown>
        const pick = (k: string) =>
          typeof task[k] === 'string' ? (task[k] as string).trim() : ex[k]
        this.sql.exec(
          'UPDATE tasks SET title = ?, description = ?, duration = ?, setting = ?, physical = ?, status = ? WHERE id = ?',
          pick('title'), pick('description'), pick('duration'),
          pick('setting'), pick('physical'), pick('status'), id,
        )
        return json({ ok: true })
      }

      if (action === 'delete_task') {
        const id = str(body.taskId)
        this.sql.exec(
          'DELETE FROM signups WHERE slot_id IN (SELECT id FROM slots WHERE task_id = ?)',
          id,
        )
        this.sql.exec('DELETE FROM slots WHERE task_id = ?', id)
        this.sql.exec('DELETE FROM tasks WHERE id = ?', id)
        return json({ ok: true })
      }

      if (action === 'create_slot') {
        const taskId = str(slot.taskId)
        const startsAt = str(slot.startsAt)
        if (!taskId || !startsAt) {
          return json(
            { error: 'A time needs a date and start time.' }, 400,
          )
        }
        const capacity = Math.max(
          1, Math.min(50, Number(slot.capacity) || 4),
        )
        const s = { id: newId('slot'), taskId, startsAt, capacity }
        this.sql.exec(
          'INSERT INTO slots VALUES (?, ?, ?, ?)',
          s.id, s.taskId, s.startsAt, s.capacity,
        )
        return json({ ok: true, slot: s })
      }

      if (action === 'delete_slot') {
        const id = str(body.slotId)
        this.sql.exec('DELETE FROM signups WHERE slot_id = ?', id)
        this.sql.exec('DELETE FROM slots WHERE id = ?', id)
        return json({ ok: true })
      }

      if (action === 'delete_signup') {
        this.sql.exec(
          'DELETE FROM signups WHERE id = ? AND slot_id = ?',
          str(body.signupId), str(body.slotId),
        )
        return json({ ok: true })
      }

      return json({ error: 'Unknown action.' }, 400)
    }

    return json({ error: 'Not found.' }, 404)
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const stub = env.BOARD.get(env.BOARD.idFromName('board'))
    return stub.fetch(request)
  },
}
