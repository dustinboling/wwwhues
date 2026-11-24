import { Hono } from 'hono'
import vike from '@vikejs/hono'
import type { Server } from 'vike/types'
import { registerApp } from '../server/api'
import type { BackendEnv } from '../server/backends'

// Worker entry (architecture-plan §1a.4, §2.1): vike(app) first — it
// installs Vike's page handler last, after our routes — then the Hues
// app (canonicalization → legacy redirects → /api proxy). Worker
// bindings (the *_API_URL vars, TURNSTILE_SECRET_KEY) arrive as c.env
// at request time; registerApp merges them over the empty base.
const app = new Hono<{ Bindings: BackendEnv }>()
vike(app)
registerApp(app, { env: {} })

export default {
  fetch: app.fetch,
} satisfies Server
