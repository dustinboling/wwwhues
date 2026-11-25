// Shared loopback pre-flight for the app's local-server gates
// (scripts/smoke-deployed.mjs, scripts/run-visual.mjs).
//
// Some sandboxes intercept ALL loopback TCP connects (a same-process
// node:http server answers 502 "upstream connection failed"), in which
// case no locally booted server — wrangler dev or the static serve-dist
// harness — can ever be probed. loopbackWorks() proves the loopback path
// with a trivial same-process server and its exact bytes; callers loudly
// skip (exit 0) when it fails and run for real otherwise.

import { createServer as createHttpServer, get as httpGet } from 'node:http'

function probeGet(url) {
  return new Promise((resolve, reject) => {
    const req = httpGet(url, { timeout: 10_000 }, (res) => {
      const chunks = []
      res.on('data', (chunk) => chunks.push(chunk))
      res.on('error', reject)
      res.on('end', () => {
        resolve({ status: res.statusCode ?? 0, body: Buffer.concat(chunks).toString('utf8') })
      })
    })
    req.on('timeout', () => req.destroy(new Error('probe timed out')))
    req.on('error', reject)
  })
}

export function loopbackWorks() {
  return new Promise((resolve) => {
    const server = createHttpServer((req, res) => {
      res.writeHead(200, { 'Content-Type': 'text/plain' })
      res.end('loopback probe')
    })
    server.once('error', () => resolve(false))
    server.listen(0, '127.0.0.1', () => {
      const address = server.address()
      const port = typeof address === 'object' && address !== null ? address.port : 0
      probeGet(`http://127.0.0.1:${port}/probe`)
        .then((res) => {
          server.close(() => resolve(res.status === 200 && res.body === 'loopback probe'))
        })
        .catch(() => {
          server.close(() => resolve(false))
        })
    })
  })
}
