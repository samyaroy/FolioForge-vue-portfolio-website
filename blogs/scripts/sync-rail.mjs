#!/usr/bin/env node
/**
 * Precompute rail-route geometry for the travel map.
 *
 * Scans trips.yml for `train:` numbers, fetches each train's route from
 * RailRadar ONCE (cached forever under scripts/rail-cache/<train>.json, since
 * a train's route never changes) and uploads it to Workers KV. The Worker then
 * serves every visitor from KV without touching RailRadar's 50-request/day quota.
 *
 * Run automatically by the pre-commit hook when trips.yml changes, or by hand:
 *   node scripts/sync-rail.mjs             # fetch + upload only new trains
 *   node scripts/sync-rail.mjs --reseed    # re-upload every cached train to KV
 *   node scripts/sync-rail.mjs --no-upload # fetch/cache only, skip KV
 *
 * Needs RAILRADAR_API_KEY (from the environment or blogs/.dev.vars) to fetch,
 * and a logged-in wrangler (or CLOUDFLARE_API_TOKEN) to upload.
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = join(HERE, '..')
const TRIPS = join(ROOT, 'src/content/travel/trips.yml')
const CACHE_DIR = join(HERE, 'rail-cache')
const CONFIG = join(ROOT, 'wrangler.jsonc')

const args = new Set(process.argv.slice(2))
const RESEED = args.has('--reseed')
const NO_UPLOAD = args.has('--no-upload')

function loadKey() {
  if (process.env.RAILRADAR_API_KEY) return process.env.RAILRADAR_API_KEY.trim()
  const varsPath = join(ROOT, '.dev.vars')
  if (existsSync(varsPath)) {
    const m = readFileSync(varsPath, 'utf8').match(
      /^\s*RAILRADAR_API_KEY\s*=\s*(.+?)\s*$/m,
    )
    if (m) return m[1].trim().replace(/^["']|["']$/g, '')
  }
  return null
}

function trainNumbers() {
  const yml = readFileSync(TRIPS, 'utf8')
  const set = new Set()
  for (const m of yml.matchAll(/\btrain:\s*(\d{3,6})\b/g)) set.add(m[1])
  return [...set].sort()
}

async function fetchRoute(train, key) {
  const res = await fetch(
    `https://api.railradar.in/v1/trains/${train}/route`,
    { headers: { Authorization: `Bearer ${key}` } },
  )
  if (!res.ok) {
    let detail = ''
    try {
      detail = (await res.json())?.error?.message ?? ''
    } catch {
      /* non-JSON error body */
    }
    throw new Error(`railradar ${res.status}${detail ? `: ${detail}` : ''}`)
  }
  return res.text()
}

function uploadToKV(train, file) {
  execFileSync(
    'npx',
    [
      'wrangler', 'kv', 'key', 'put', `rail:${train}`,
      '--path', file,
      '--binding', 'RAIL',
      '--remote',
      '-c', CONFIG,
    ],
    { cwd: ROOT, stdio: 'inherit' },
  )
}

async function main() {
  mkdirSync(CACHE_DIR, { recursive: true })
  const trains = trainNumbers()
  if (!trains.length) {
    console.log('[rail] no train legs found in trips.yml')
    return
  }

  const key = loadKey()
  const toUpload = []
  let fetched = 0
  let cached = 0

  for (const train of trains) {
    const file = join(CACHE_DIR, `${train}.json`)
    if (existsSync(file)) {
      cached++
      if (RESEED) toUpload.push([train, file])
      continue
    }
    if (!key) {
      console.warn(`[rail] ${train}: not cached and no RAILRADAR_API_KEY — skipping`)
      continue
    }
    try {
      const body = await fetchRoute(train, key)
      writeFileSync(file, body)
      console.log(`[rail] ${train}: fetched (${body.length} bytes)`)
      fetched++
      toUpload.push([train, file])
    } catch (e) {
      console.warn(
        `[rail] ${train}: fetch failed — ${e.message} (map falls back to a straight line)`,
      )
    }
  }

  console.log(`[rail] ${fetched} fetched, ${cached} already cached`)

  if (NO_UPLOAD || !toUpload.length) return
  console.log(`[rail] uploading ${toUpload.length} route(s) to KV...`)
  for (const [train, file] of toUpload) {
    try {
      uploadToKV(train, file)
    } catch (e) {
      const first = String(e.message || e).split('\n')[0]
      console.warn(`[rail] ${train}: KV upload failed — ${first}`)
    }
  }
}

// Never fail the commit: a sync problem just leaves those legs to the
// straight-line fallback (and the Worker's own KV-miss fallback).
main().catch((e) => {
  console.error('[rail] sync error:', e)
  process.exit(0)
})
