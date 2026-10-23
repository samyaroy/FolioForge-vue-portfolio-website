#!/usr/bin/env node
/**
 * Converts every trip cover to a WebP beside its original on the media host.
 *
 *   node scripts/fit-trip-covers.mjs                 write the WebPs to .trip-covers/ for review
 *   node scripts/fit-trip-covers.mjs --out=DIR       write them to DIR instead
 *   node scripts/fit-trip-covers.mjs --dry-run       report only, write nothing
 *   node scripts/fit-trip-covers.mjs --only=ID,...   just these trips
 *   node scripts/fit-trip-covers.mjs --upload        put them on the media bucket and
 *                                                    point trips.yml at them
 *
 * Covers are full-size travel photos (some over 10 MB). Each WebP keeps the
 * photo's definition: at most TRIP_COVER.maxEdge px (4K) on its long side, at
 * WebP quality TRIP_COVER.quality, and never over TRIP_COVER.maxBytes. The
 * camera's rotation is applied and location metadata is dropped. Originals are
 * never changed.
 *
 * A cover is converted from its original: the coverImage itself while that is
 * not a WebP yet, or the .jpeg/.jpg/.png of the same name beside the WebP it
 * already names. A WebP already on the host is never overwritten, since the
 * admin's trip cover uploader may have put it there from a different photo.
 *
 * --upload puts each new WebP on the bucket at blog-travel/<name>.webp (via
 * wrangler under admin/, as scripts/fit-gallery-images.mjs does), reads it
 * back, and then rewrites that trip's coverImage in trips.yml to the WebP.
 */
import { spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'
import sharp from 'sharp'
import YAML from 'yaml'
import { isEntryEnabled } from '../../src/config/entryStatus.ts'
import { MEDIA_BASE, originalCoverUrls, TRIP_COVER, webpCoverUrl } from '../src/lib/tripCovers.ts'

const BLOGS = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..')
const ROOT = path.resolve(BLOGS, '..')
const TRIPS_PATH = path.join(BLOGS, 'src/content/travel/trips.yml')
const WRANGLER_CONFIG = path.join(ROOT, 'admin/wrangler.jsonc')
const LOCAL_DIR = path.join(BLOGS, '.trip-covers')
// Lower qualities tried, in turn, when a cover is still over the size cap.
const FALLBACK_QUALITIES = [84, 78, 72]

main().catch((error) => {
  console.error(`fit-trip-covers: ${error.message}`)
  process.exit(1)
})

async function main() {
  const options = parseArgs(process.argv.slice(2))
  const trips = (YAML.parse(fs.readFileSync(TRIPS_PATH, 'utf8'))?.trips ?? [])
    .filter((trip) => trip?.coverImage && isEntryEnabled(trip))
    .filter((trip) => !options.only || options.only.includes(trip.id))
  const bucket = options.upload ? mediaBucketName() : null
  if (!options.dryRun && !options.upload) fs.mkdirSync(options.outDir, { recursive: true })

  const counts = { current: 0, made: 0, missing: [], skipped: [], failed: [] }
  // coverImage values to rewrite in trips.yml, once their WebP is on the host.
  const switches = new Map()

  // One at a time: the media host resets connections under parallel downloads.
  for (const trip of trips) {
    const webpUrl = webpCoverUrl(trip.coverImage)
    if (!webpUrl) {
      counts.skipped.push(trip.id)
      continue
    }

    try {
      if (await exists(webpUrl)) {
        counts.current += 1
        if (trip.coverImage !== webpUrl) switches.set(trip.coverImage, webpUrl)
        continue
      }

      const original = await firstDownload(originalCoverUrls(trip.coverImage))
      if (!original) {
        counts.missing.push(trip.id)
        continue
      }

      const cover = await renderCover(original)
      const outcome = `${await describe(original)} -> ${await describe(cover)}`
      if (cover.length > TRIP_COVER.maxBytes) {
        console.warn(`  ${trip.id}: WebP is over ${formatBytes(TRIP_COVER.maxBytes)}`)
      }

      if (options.dryRun) {
        console.log(`  would make ${trip.id}\n             ${outcome}`)
        counts.made += 1
        continue
      }

      if (!options.upload) {
        const file = path.join(options.outDir, path.basename(webpUrl))
        if (fs.existsSync(file) && sha256(fs.readFileSync(file)) === sha256(cover)) {
          counts.current += 1
          continue
        }
        fs.writeFileSync(file, cover)
        console.log(`  made ${trip.id}\n       ${outcome}`)
        counts.made += 1
        continue
      }

      const key = webpUrl.slice(`${MEDIA_BASE}/`.length)
      upload(bucket, key, cover)
      const uploaded = await download(webpUrl)
      if (!uploaded || sha256(uploaded) !== sha256(cover)) {
        throw new Error('read-back after upload did not match')
      }
      console.log(`  uploaded ${trip.id}\n           ${outcome}`)
      counts.made += 1
      switches.set(trip.coverImage, webpUrl)
    } catch (error) {
      console.error(`  FAILED ${trip.id}: ${error.message}`)
      counts.failed.push(trip.id)
    }
  }

  const switched = options.upload ? pointTripsAt(switches) : 0
  const where = options.upload ? 'on the bucket' : options.dryRun ? '' : `in ${path.relative(process.cwd(), options.outDir) || '.'}`
  console.log(
    `fit-trip-covers: ${counts.current} already WebP on the host, ${counts.made} ${options.dryRun ? 'to make' : options.upload ? 'uploaded' : 'made'}, ` +
      `${counts.missing.length} missing, ${counts.failed.length} failed${where ? ` (${where})` : ''}.`,
  )
  if (switched) console.log(`  trips.yml now points ${switched} cover${switched === 1 ? '' : 's'} at the WebP.`)
  if (!options.upload && switches.size) {
    console.log(`  ${switches.size} trip${switches.size === 1 ? '' : 's'} still name an original; --upload points trips.yml at the WebP.`)
  }
  if (counts.missing.length) {
    console.warn(`  no original or WebP on ${MEDIA_BASE}: ${counts.missing.join(', ')}`)
  }
  if (counts.skipped.length) {
    console.warn(`  cover outside blog-travel/, left as it is: ${counts.skipped.join(', ')}`)
  }
  if (counts.failed.length) process.exit(1)
}

function parseArgs(args) {
  const options = { dryRun: false, upload: false, outDir: LOCAL_DIR, only: null }
  for (const arg of args) {
    if (arg === '--dry-run') options.dryRun = true
    else if (arg === '--upload') options.upload = true
    else if (arg.startsWith('--out=')) {
      options.outDir = path.resolve(arg.slice('--out='.length))
    } else if (arg.startsWith('--only=')) {
      options.only = arg.slice('--only='.length).split(',').map((id) => id.trim()).filter(Boolean)
    } else {
      throw new Error(`unknown option ${arg}`)
    }
  }
  if (options.dryRun && options.upload) throw new Error('--dry-run and --upload do not go together')
  return options
}

/** The WebP: EXIF rotation applied, longest edge capped, metadata dropped. */
async function renderCover(original) {
  const { maxEdge, quality, maxBytes } = TRIP_COVER
  const resized = sharp(original)
    .rotate()
    .resize({ width: maxEdge, height: maxEdge, fit: 'inside', withoutEnlargement: true })
  let cover
  for (const attempt of [quality, ...FALLBACK_QUALITIES.filter((lower) => lower < quality)]) {
    cover = await resized.clone().webp({ quality: attempt, effort: 6, smartSubsample: true }).toBuffer()
    if (cover.length <= maxBytes) break
  }
  return cover
}

/**
 * Rewrite each trip's `coverImage:` line from its original to its WebP, text
 * in place, so every comment and the rest of the file stay as they are.
 * Returns how many lines changed.
 */
function pointTripsAt(switches) {
  const before = fs.readFileSync(TRIPS_PATH, 'utf8')
  let text = before
  let changed = 0
  for (const [from, to] of switches) {
    const line = new RegExp(`^(\\s*coverImage:\\s*['"]?)${escapeRegExp(from)}(['"]?\\s*(?:#.*)?)$`, 'gm')
    text = text.replace(line, (_, start, end) => {
      changed += 1
      return `${start}${to}${end}`
    })
  }
  if (text !== before) fs.writeFileSync(TRIPS_PATH, text)
  return changed
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

async function describe(buffer) {
  const { width, height, format } = await sharp(buffer).metadata()
  return `${width}x${height} ${format} ${formatBytes(buffer.length)}`
}

/** The first of these addresses the host has, downloaded. */
async function firstDownload(urls) {
  for (const url of urls) {
    const bytes = await download(url)
    if (bytes) return bytes
  }
  return null
}

// The CDN caches these for hours; a fresh query string reaches the bucket.
async function request(url, method) {
  for (let attempt = 1; ; attempt++) {
    try {
      const response = await fetch(`${url}?fresh=${Date.now()}`, {
        method,
        cache: 'no-store',
        signal: AbortSignal.timeout(60_000),
      })
      if (response.status === 404) return null
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      return response
    } catch (error) {
      if (attempt >= 3) throw new Error(`${url}: ${error.message}`)
      await new Promise((resolve) => setTimeout(resolve, 1500 * attempt))
    }
  }
}

async function download(url) {
  const response = await request(url, 'GET')
  return response ? Buffer.from(await response.arrayBuffer()) : null
}

async function exists(url) {
  return Boolean(await request(url, 'HEAD'))
}

function mediaBucketName() {
  const config = fs.readFileSync(WRANGLER_CONFIG, 'utf8')
  const match = config.match(/"binding"\s*:\s*"MEDIA"\s*,\s*"bucket_name"\s*:\s*"([^"]+)"/)
  if (!match) throw new Error(`no MEDIA bucket binding in ${path.relative(ROOT, WRANGLER_CONFIG)}`)
  return match[1]
}

function upload(bucket, key, buffer) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'fit-trip-covers-'))
  const file = path.join(dir, path.basename(key))
  fs.writeFileSync(file, buffer)
  try {
    const result = spawnSync(
      'npx',
      ['--no-install', 'wrangler', 'r2', 'object', 'put', `${bucket}/${key}`,
        '--remote', '--file', file, '--content-type', 'image/webp'],
      { cwd: path.join(ROOT, 'admin'), encoding: 'utf8' },
    )
    if (result.status !== 0) {
      const detail = `${result.stderr || ''}${result.stdout || ''}`.trim().split('\n').slice(-3).join(' ')
      throw new Error(`wrangler upload failed: ${detail || `exit ${result.status}`}`)
    }
  } finally {
    fs.rmSync(dir, { recursive: true, force: true })
  }
}

function sha256(buffer) {
  return createHash('sha256').update(buffer).digest('hex')
}

function formatBytes(bytes) {
  return bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`
}
