#!/usr/bin/env node
/**
 * Bench token logging (Dustin, 2026-11-24): every muse-code run's
 * transcripts carry a final `run.usage` event with per-model token
 * totals. This script sums them across all transcripts in the bench
 * dir (the initial run plus any verify-repair turns), prices the
 * run at Meta's published Model API rates, writes bench-usage.json
 * into the same dir (the logs artifact upload picks it up), and
 * prints a markdown block for the GitHub step summary.
 *
 * Rates: USD per 1M tokens { input, cachedInput, output }, Meta's
 * published Model API pricing as of 2026-11-24 (dev.meta.ai/docs/
 * pricing-rate-limits). Update here when the published rates move.
 * input_tokens includes cached_tokens; uncached = input - cached.
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const RATES = {
  'muse-spark-1.3-contributor': { input: 0.1, cachedInput: 0.002, output: 0.2 },
  'muse-spark-1.3': { input: 1.25, cachedInput: 0.15, output: 4.25 },
  'muse-wonder-1.0': { input: 4.0, cachedInput: 0.2, output: 20.0 },
}

const cost = (u, r) =>
  (((u.input_tokens - u.cached_tokens) * r.input) +
    u.cached_tokens * r.cachedInput +
    u.output_tokens * r.output) /
  1_000_000

const dir = process.argv[2] ?? '.'
const totals = {}
let files = []
try {
  files = readdirSync(dir).filter((f) => f.endsWith('.jsonl'))
} catch {
  files = []
}
for (const f of files) {
  for (const line of readFileSync(join(dir, f), 'utf8').split('\n')) {
    if (!line.includes('"run.usage"')) continue
    let d
    try {
      d = JSON.parse(line)
    } catch {
      continue
    }
    if (d.payload_type !== 'run.usage') continue
    for (const m of d.payload?.models ?? []) {
      const t = (totals[m.model] ??= {
        input_tokens: 0,
        cached_tokens: 0,
        output_tokens: 0,
        reasoning_tokens: 0,
      })
      t.input_tokens += m.input_tokens ?? 0
      t.cached_tokens += m.cached_tokens ?? 0
      t.output_tokens += m.output_tokens ?? 0
      t.reasoning_tokens += m.reasoning_tokens ?? 0
    }
  }
}

const models = Object.keys(totals)
if (models.length === 0) {
  console.log('## Bench token usage\n\nNo `run.usage` event found in the run transcripts — nothing logged.')
  process.exit(0)
}

const all = models.reduce(
  (a, m) => ({
    input_tokens: a.input_tokens + totals[m].input_tokens,
    cached_tokens: a.cached_tokens + totals[m].cached_tokens,
    output_tokens: a.output_tokens + totals[m].output_tokens,
    reasoning_tokens: a.reasoning_tokens + totals[m].reasoning_tokens,
  }),
  { input_tokens: 0, cached_tokens: 0, output_tokens: 0, reasoning_tokens: 0 },
)

const report = {
  run_id: process.env.GITHUB_RUN_ID ?? null,
  task_file: process.env.TASK_FILE ?? null,
  generated_at: new Date().toISOString(),
  models: totals,
  cost_usd: {
    actual: Object.fromEntries(
      models
        .filter((m) => RATES[m])
        .map((m) => [m, +cost(totals[m], RATES[m]).toFixed(4)]),
    ),
    what_if_same_usage: {
      'muse-wonder-1.0': +cost(all, RATES['muse-wonder-1.0']).toFixed(4),
      'muse-spark-1.3': +cost(all, RATES['muse-spark-1.3']).toFixed(4),
    },
  },
}
writeFileSync(join(dir, 'bench-usage.json'), JSON.stringify(report, null, 2) + '\n')

const fmt = (n) => n.toLocaleString('en-US')
const usd = (n) => `$${n.toFixed(4)}`
const rows = models
  .map(
    (m) =>
      `| ${m} | ${fmt(totals[m].input_tokens)} | ${fmt(totals[m].cached_tokens)} | ${fmt(totals[m].output_tokens)} | ${RATES[m] ? usd(cost(totals[m], RATES[m])) : '—'} |`,
  )
  .join('\n')
console.log(`## Bench token usage

| Model | Input tokens | Cached | Output tokens | Cost at published rates |
| --- | ---: | ---: | ---: | ---: |
${rows}

Same usage priced as **Muse Wonder**: ${usd(cost(all, RATES['muse-wonder-1.0']))} · as **Muse Spark (standard)**: ${usd(cost(all, RATES['muse-spark-1.3']))}.
Full record: \`bench-usage.json\` in the muse-run-logs artifact.`)
