#!/usr/bin/env node
/**
 * Checks every photo gallery.yml names on the media bucket, and fixes the ones
 * that are too heavy, not really JPEG, or the wrong shape for the gallery card.
 *
 *   node scripts/fit-gallery-images.mjs              check, then fix and upload
 *   node scripts/fit-gallery-images.mjs --dry-run    check and report only
 *   node scripts/fit-gallery-images.mjs --preview=DIR   dry run, saving the fixes to DIR
 *   node scripts/fit-gallery-images.mjs --max-crop=0.25
 *
 * The card shows its photo with object-cover in a box that is always 260px tall
 * (240px on phones) but whose width follows the grid, so its shape runs from
 * 1.37:1 (two columns, 768-1023px) to 1.87:1 (three columns, 1536px and up).
 * No single photo shape escapes cropping across that whole range, so the rule
 * is a budget: at no screen width may the card crop away more than --max-crop
 * of the photo. A photo over budget gets margins on its short sides, sized so
 * the worst-case crop lands exactly on the budget and eats margin before
 * content. The margin takes the photo's own border colour when that border is
 * plain (a document on white, a slide on black), so the padding is invisible;
 * behind a busy photo edge it is white.
 *
 * Fixes are written back to the same key on the bucket with wrangler (installed
 * under admin/), so the site needs no change. Every original is copied to
 * .gallery-image-backups/ first; to undo, put that file back under its key.
 * A fixed photo passes the next run unchanged, so running it again is safe.
 */
import { Buffer } from 'node:buffer'
import { spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'
import sharp from 'sharp'
import YAML from 'yaml'

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..')
const GALLERY_PATH = path.join(ROOT, 'src/content/profile_info/gallery.yml')
const WRANGLER_CONFIG = path.join(ROOT, 'admin/wrangler.jsonc')
const BACKUP_DIR = path.join(ROOT, '.gallery-image-backups')

// Must match getGalleryImageById in src/views/Gallery/index.vue.
const MEDIA_BASE = 'https://media.samyabrata.codeium.xyz'

const MAX_EDGE = 1920
const MAX_BYTES = 500 * 1024
const JPEG_QUALITY = 80
// A size-only re-encode is uploaded only when it saves at least this much, so a
// photo that is already as small as it will get is not recompressed each run.
const MIN_SAVING = 0.1

// Card image box, width over height, at its narrowest and widest (measured).
const CARD_RATIO = { min: 1.37, max: 1.87 }
// Below this budget no photo shape can satisfy both ends of the range at once,
// and a padded photo would be flagged again on the next run.
const MIN_CROP_BUDGET = Math.ceil((1 - Math.sqrt(CARD_RATIO.min / CARD_RATIO.max)) * 100) / 100
const DEFAULT_CROP_BUDGET = 0.2
// Pixel rounding moves a padded photo's ratio by a hair; do not chase it.
const CROP_TOLERANCE = 0.01

// A border this even (mean per-channel standard deviation) counts as plain.
const PLAIN_BORDER_STDEV = 12
const WHITE = { r: 255, g: 255, b: 255 }

const DOWNLOAD_CONCURRENCY = 6

main().catch((error) => {
  console.error(`fit-gallery-images: ${error.message}`)
  process.exit(1)
})

async function main() {
  const options = parseArgs(process.argv.slice(2))
  const keys = galleryImageKeys(YAML.parse(fs.readFileSync(GALLERY_PATH, 'utf8')))
  const bucket = options.dryRun ? null : mediaBucketName()

  console.log(`fit-gallery-images: checking ${keys.length} photos (crop budget ${Math.round(options.maxCrop * 100)}%)...`)

  const downloads = await mapWithConcurrency(keys, DOWNLOAD_CONCURRENCY, downloadImage)
  const missing = []
  const fine = []
  const failed = []
  let fixedCount = 0

  for (const { key, buffer } of downloads) {
    if (!buffer) {
      missing.push(key)
      continue
    }

    const plan = await planFix(buffer, options.maxCrop)
    if (!plan.reasons.length) {
      fine.push(key)
      continue
    }

    const label = `${key}: ${plan.reasons.join(', ')}`
    const output = await renderFix(buffer, plan)

    if (plan.sizeOnly && output.length > buffer.length * (1 - MIN_SAVING)) {
      console.log(`  ok    ${key}: ${formatBytes(buffer.length)}, already as small as it gets`)
      fine.push(key)
      continue
    }

    const outcome = `${plan.from} -> ${await describe(output)}`
    if (options.dryRun) {
      if (options.previewDir) fs.writeFileSync(path.join(options.previewDir, `${key}.jpeg`), output)
      console.log(`  would fix  ${label}\n             ${outcome}`)
      fixedCount += 1
      continue
    }

    try {
      backUp(key, buffer)
      upload(bucket, key, output)
      await verifyUpload(key, output)
      console.log(`  fixed ${label}\n        ${outcome}`)
      fixedCount += 1
    } catch (error) {
      console.error(`  FAILED ${key}: ${error.message}`)
      failed.push(key)
    }
  }

  console.log(`fit-gallery-images: ${fine.length} fine, ${fixedCount} ${options.dryRun ? 'to fix' : 'fixed'}, ${missing.length} missing, ${failed.length} failed.`)

  if (missing.length) {
    console.warn(`  missing from ${MEDIA_BASE} (upload as <key>.jpeg): ${missing.join(', ')}`)
  }

  if (failed.length) process.exit(1)
}

function parseArgs(args) {
  const options = { dryRun: false, maxCrop: DEFAULT_CROP_BUDGET, previewDir: null }

  for (const arg of args) {
    if (arg === '--dry-run') {
      options.dryRun = true
    } else if (arg.startsWith('--preview=')) {
      // A dry run that also saves what it would upload, to look at first.
      options.dryRun = true
      options.previewDir = path.resolve(arg.slice('--preview='.length))
      fs.mkdirSync(options.previewDir, { recursive: true })
    } else if (arg.startsWith('--max-crop=')) {
      options.maxCrop = Number(arg.slice('--max-crop='.length))
    } else {
      throw new Error(`unknown option ${arg}`)
    }
  }

  if (!(options.maxCrop >= MIN_CROP_BUDGET && options.maxCrop <= 0.5)) {
    throw new Error(`--max-crop must be between ${MIN_CROP_BUDGET} and 0.5`)
  }

  return options
}

/** Bare CDN keys, resolved the way the gallery page resolves them. */
function galleryImageKeys(gallery) {
  const keys = new Set()

  for (const item of Array.isArray(gallery?.items) ? gallery.items : []) {
    const entries = Array.isArray(item?.images) && item.images.length ? item.images : [item?.id]

    for (const entry of entries) {
      if (typeof entry !== 'string') continue
      const key = entry.trim()
      // A full URL may live anywhere; only keys on our own bucket can be fixed.
      if (key && !/^https?:\/\//i.test(key)) keys.add(key)
    }
  }

  return [...keys]
}

function mediaBucketName() {
  const config = fs.readFileSync(WRANGLER_CONFIG, 'utf8')
  const match = config.match(/"binding"\s*:\s*"MEDIA"\s*,\s*"bucket_name"\s*:\s*"([^"]+)"/)
  if (!match) throw new Error(`no MEDIA bucket binding in ${path.relative(ROOT, WRANGLER_CONFIG)}`)
  return match[1]
}

function imageUrl(key) {
  return `${MEDIA_BASE}/${encodeURIComponent(key)}.jpeg`
}

async function downloadImage(key) {
  const response = await fetch(imageUrl(key), { cache: 'no-store' })
  if (response.status === 404) return { key, buffer: null }
  if (!response.ok) throw new Error(`${key}: HTTP ${response.status}`)
  return { key, buffer: Buffer.from(await response.arrayBuffer()) }
}

/**
 * Share of the photo object-cover crops away at the worst card width: a photo
 * narrower than the widest box loses height there, one wider than the
 * narrowest box loses width there.
 */
function cropLoss(ratio) {
  return {
    tall: ratio < CARD_RATIO.max ? 1 - ratio / CARD_RATIO.max : 0,
    wide: ratio > CARD_RATIO.min ? 1 - CARD_RATIO.min / ratio : 0,
  }
}

async function planFix(buffer, maxCrop) {
  const meta = await sharp(buffer).metadata()
  // EXIF orientations 5-8 display rotated a quarter turn.
  const rotated = (meta.orientation ?? 1) >= 5
  const width = rotated ? meta.height : meta.width
  const height = rotated ? meta.width : meta.height
  const ratio = width / height
  const loss = cropLoss(ratio)
  const worst = Math.max(loss.tall, loss.wide)

  const reasons = []
  if (meta.format !== 'jpeg') reasons.push(`${meta.format} saved as .jpeg`)
  if (Math.max(width, height) > MAX_EDGE) reasons.push(`${width}x${height} over ${MAX_EDGE}px`)

  let padding = null
  if (worst > maxCrop + CROP_TOLERANCE) {
    padding = paddingFor(width, height, loss, maxCrop)
    reasons.push(`card crops ${Math.round(worst * 100)}% of it`)
  }

  const structural = reasons.length
  if (buffer.length > MAX_BYTES) reasons.push(`${formatBytes(buffer.length)} over ${formatBytes(MAX_BYTES)}`)

  return {
    reasons,
    padding,
    fill: padding ? await borderFill(buffer, width, height, padding) : null,
    sizeOnly: !structural && reasons.length > 0,
    from: `${meta.format} ${width}x${height} ${formatBytes(buffer.length)}`,
  }
}

/**
 * Margins that bring the worst-case crop down to the budget. A too-tall photo
 * is widened just enough that the widest card crops `maxCrop`; at narrower
 * cards the crop then comes out of the new side margins. A too-wide photo is
 * the same turned sideways, against the narrowest card.
 */
function paddingFor(width, height, loss, maxCrop) {
  if (loss.tall >= loss.wide) {
    const extra = Math.max(0, Math.ceil(height * CARD_RATIO.max * (1 - maxCrop)) - width)
    return { top: 0, bottom: 0, left: Math.floor(extra / 2), right: Math.ceil(extra / 2) }
  }

  const extra = Math.max(0, Math.ceil(width * (1 - maxCrop) / CARD_RATIO.min) - height)
  return { top: Math.floor(extra / 2), bottom: Math.ceil(extra / 2), left: 0, right: 0 }
}

/**
 * The colour of the edges the margins will touch, when those edges are plain
 * enough for the margin to read as more of the same background; white when
 * they are not.
 */
async function borderFill(buffer, width, height, padding) {
  const base = sharp(buffer).rotate().flatten({ background: WHITE })
  const sidePadded = padding.left + padding.right > 0
  const band = Math.max(1, Math.round((sidePadded ? width : height) * 0.02))
  const strips = sidePadded
    ? [{ left: 0, top: 0, width: band, height }, { left: width - band, top: 0, width: band, height }]
    : [{ left: 0, top: 0, width, height: band }, { left: 0, top: height - band, width, height: band }]

  const channels = [[], [], []]
  for (const region of strips) {
    const stats = await base.clone().extract(region).stats()
    stats.channels.slice(0, 3).forEach((channel, index) => channels[index].push(channel))
  }

  const stdev = channels.flat().reduce((sum, channel) => sum + channel.stdev, 0) / 6
  if (stdev > PLAIN_BORDER_STDEV) return WHITE

  const [r, g, b] = channels.map(pair => Math.round((pair[0].mean + pair[1].mean) / 2))
  return { r, g, b }
}

async function renderFix(buffer, plan) {
  let source = buffer

  if (plan.padding) {
    // Margins first, at full resolution, so the resize below bounds the padded
    // canvas and not just the photo inside it.
    source = await sharp(buffer)
      .rotate()
      .flatten({ background: WHITE })
      .extend({ ...plan.padding, background: plan.fill })
      .png()
      .toBuffer()
  }

  return sharp(source)
    .rotate()
    .flatten({ background: WHITE })
    .resize({ width: MAX_EDGE, height: MAX_EDGE, fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
    .toBuffer()
}

async function describe(buffer) {
  const meta = await sharp(buffer).metadata()
  return `${meta.format} ${meta.width}x${meta.height} ${formatBytes(buffer.length)}`
}

function backUp(key, buffer) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true })
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\..+/, '')
  fs.writeFileSync(path.join(BACKUP_DIR, `${key}.${stamp}.jpeg`), buffer)
}

function upload(bucket, key, buffer) {
  const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'fit-gallery-')), `${key}.jpeg`)
  fs.writeFileSync(file, buffer)

  try {
    const result = spawnSync(
      'npx',
      ['--no-install', 'wrangler', 'r2', 'object', 'put', `${bucket}/${key}.jpeg`,
        '--remote', '--file', file, '--content-type', 'image/jpeg'],
      { cwd: path.join(ROOT, 'admin'), encoding: 'utf8' },
    )

    if (result.status !== 0) {
      const detail = `${result.stderr || ''}${result.stdout || ''}`.trim().split('\n').slice(-3).join(' ')
      throw new Error(`wrangler upload failed: ${detail || `exit ${result.status}`}`)
    }
  } finally {
    fs.rmSync(path.dirname(file), { recursive: true, force: true })
  }
}

/** Reads the object back through the CDN, which serves the bucket uncached. */
async function verifyUpload(key, expected) {
  const { buffer } = await downloadImage(key)
  if (!buffer || sha256(buffer) !== sha256(expected)) {
    throw new Error('uploaded, but the CDN still serves different bytes')
  }
}

function sha256(buffer) {
  return createHash('sha256').update(buffer).digest('hex')
}

function formatBytes(bytes) {
  return bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`
}

async function mapWithConcurrency(items, limit, worker) {
  const results = new Array(items.length)
  let next = 0

  async function run() {
    while (next < items.length) {
      const index = next++
      results[index] = await worker(items[index])
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, run))
  return results
}
