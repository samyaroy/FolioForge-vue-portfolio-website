#!/usr/bin/env node
/**
 * Makes a lighter, still-HD copy of every trip cover, for review.
 *
 *   node scripts/fit-trip-covers.mjs                 write the copies to .trip-cover-cards/
 *   node scripts/fit-trip-covers.mjs --out=DIR       write them to DIR instead
 *   node scripts/fit-trip-covers.mjs --dry-run       report only, write nothing
 *   node scripts/fit-trip-covers.mjs --only=ID,...   just these trips
 *   node scripts/fit-trip-covers.mjs --upload        put them on the media bucket
 *
 * Covers are full-size travel photos (some over 10 MB). Each copy keeps the
 * photo's definition: at most TRIP_COVER_CARD.maxEdge px (4K) on its long side,
 * as a mozjpeg JPEG at TRIP_COVER_CARD.quality (visually lossless), and never
 * over TRIP_COVER_CARD.maxBytes. A cover that already fits is copied as it is
 * unless re-encoding saves at least MIN_SAVING. Originals are never changed.
 *
 * By default the copies only go to a local folder that git ignores, so they can
 * be checked before anything goes live. --upload puts them on the bucket at
 * blog-travel/card/<name>.jpeg instead (via wrangler under admin/, as
 * scripts/fit-gallery-images.mjs does), skipping copies already there and
 * reading each new one back. Nothing on the site loads the copies yet.
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
import { cardCoverUrl, MEDIA_BASE, TRIP_COVER_CARD } from '../src/lib/tripCovers.ts'

const BLOGS = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..')
const ROOT = path.resolve(BLOGS, '..')
const TRIPS_PATH = path.join(BLOGS, 'src/content/travel/trips.yml')
const WRANGLER_CONFIG = path.join(ROOT, 'admin/wrangler.jsonc')
const LOCAL_DIR = path.join(BLOGS, '.trip-cover-cards')
// An original that already fits is re-encoded only when that saves at least
// this much, so a small JPEG doesn't lose quality for a few kilobytes.
const MIN_SAVING = 0.1

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

  // One at a time: the media host resets connections under parallel downloads.
  for (const trip of trips) {
    const cardUrl = cardCoverUrl(trip.coverImage)
    if (!cardUrl) {
      counts.skipped.push(trip.id)
      continue
    }

    try {
      const original = await download(trip.coverImage)
      if (!original) {
        counts.missing.push(trip.id)
        continue
      }

      const card = await renderCard(original)
      const outcome = `${await describe(original)} -> ${await describe(card)}`
      const kept = card === original ? ' (original kept as it is)' : ''
      if (card.length > TRIP_COVER_CARD.maxBytes) {
        console.warn(`  ${trip.id}: copy is over ${formatBytes(TRIP_COVER_CARD.maxBytes)}`)
      }

      if (options.dryRun) {
        console.log(`  would make ${trip.id}${kept}\n             ${outcome}`)
        counts.made += 1
        continue
      }

      if (!options.upload) {
        const file = path.join(options.outDir, path.basename(cardUrl))
        if (fs.existsSync(file) && sha256(fs.readFileSync(file)) === sha256(card)) {
          counts.current += 1
          continue
        }
        fs.writeFileSync(file, card)
        console.log(`  made ${trip.id}${kept}\n       ${outcome}`)
        counts.made += 1
        continue
      }

      const existing = await download(cardUrl)
      if (existing && sha256(existing) === sha256(card)) {
        counts.current += 1
        continue
      }

      const key = cardUrl.slice(`${MEDIA_BASE}/`.length)
      upload(bucket, key, card)
      const uploaded = await download(cardUrl)
      if (!uploaded || sha256(uploaded) !== sha256(card)) {
        throw new Error('read-back after upload did not match')
      }
      console.log(`  uploaded ${trip.id}${kept}\n           ${outcome}`)
      counts.made += 1
    } catch (error) {
      console.error(`  FAILED ${trip.id}: ${error.message}`)
      counts.failed.push(trip.id)
    }
  }

  const where = options.upload ? 'on the bucket' : options.dryRun ? '' : `in ${path.relative(process.cwd(), options.outDir) || '.'}`
  console.log(
    `fit-trip-covers: ${counts.current} current, ${counts.made} ${options.dryRun ? 'to make' : options.upload ? 'uploaded' : 'made'}, ` +
      `${counts.missing.length} missing, ${counts.failed.length} failed${where ? ` (${where})` : ''}.`,
  )
  if (counts.missing.length) {
    console.warn(`  cover not on ${MEDIA_BASE}: ${counts.missing.join(', ')}`)
  }
  if (counts.skipped.length) {
    console.warn(`  cover outside blog-travel/, no card copy: ${counts.skipped.join(', ')}`)
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

/**
 * The card copy: EXIF rotation applied, longest edge capped, mozjpeg. When
 * the original is already an upright JPEG within the size cap and
 * re-encoding saves less than MIN_SAVING, the original bytes are used.
 */
async function renderCard(original) {
  const { maxEdge, quality } = TRIP_COVER_CARD
  const card = await sharp(original)
    .rotate()
    .resize({ width: maxEdge, height: maxEdge, fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality, mozjpeg: true })
    .toBuffer()

  const meta = await sharp(original).metadata()
  const fitsAlready =
    meta.format === 'jpeg' &&
    Math.max(meta.width ?? Infinity, meta.height ?? Infinity) <= maxEdge &&
    (meta.orientation ?? 1) === 1
  return fitsAlready && card.length > original.length * (1 - MIN_SAVING) ? original : card
}

async function describe(buffer) {
  const { width, height, format } = await sharp(buffer).metadata()
  return `${width}x${height} ${format} ${formatBytes(buffer.length)}`
}

// The CDN caches these for hours; a fresh query string reaches the bucket.
async function download(url) {
  for (let attempt = 1; ; attempt++) {
    try {
      const response = await fetch(`${url}?fresh=${Date.now()}`, {
        cache: 'no-store',
        signal: AbortSignal.timeout(60_000),
      })
      if (response.status === 404) return null
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      return Buffer.from(await response.arrayBuffer())
    } catch (error) {
      if (attempt >= 3) throw new Error(`${url}: ${error.message}`)
      await new Promise((resolve) => setTimeout(resolve, 1500 * attempt))
    }
  }
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
        '--remote', '--file', file, '--content-type', 'image/jpeg'],
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
