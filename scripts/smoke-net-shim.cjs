// Preload shim for scripts/smoke-deployed.mjs: some sandboxes and locked-down
// CI runners block network-interface enumeration (uv_interface_addresses /
// netlink return EPERM), which makes wrangler dev's port check AND
// miniflare's accessible-hosts lookup throw before workerd even starts.
// This shim keeps the real result when enumeration works and falls back to
// loopback-only otherwise. Request handling is untouched: the worker still
// boots on 127.0.0.1 and the smoke assertions run against it normally.
// Loaded via `node --require` only when the smoke script detects the
// enumeration failure; normal machines never load it.

const os = require('node:os')

const original = os.networkInterfaces

os.networkInterfaces = () => {
  try {
    return original()
  } catch {
    return {
      lo: [
        {
          address: '127.0.0.1',
          netmask: '255.0.0.0',
          family: 'IPv4',
          mac: '00:00:00:00:00:00',
          internal: true,
          cidr: '127.0.0.1/8',
        },
      ],
    }
  }
}
