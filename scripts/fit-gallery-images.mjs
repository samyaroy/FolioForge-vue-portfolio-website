#!/usr/bin/env node
/**
 * Checks every photo gallery.yml names on the media bucket, and fixes the ones
 * that are too heavy, not really JPEG, or the wrong shape for the gallery card.
 *
 *   node scripts/fit-gallery-images.mjs              check, then fix and upload
 *   node scripts/fit-gallery-images.mjs --dry-run    check and report only
 *   node scripts/fit-gallery-images.mjs --preview=DIR   dry run, saving the fixes to DIR
 *   node scripts/fit-gallery-images.mjs --max-crop=0.25
 *   node scripts/fit-gallery-images.mjs --only=KEY,... --whole=KEY,...
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
 * --whole gives the listed photos a zero budget, for a document or poster that
 * must show every line: they get as much margin as the widest and narrowest
 * cards need to show all of them. --only limits a run to the listed photos.
 * Crop is measured on the photo inside any plain margin, so a photo given a
 * wide margin this way is left alone by later runs at the normal budget.
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
import {
  GALLERY_PHOTO_JPEG_QUALITY,
  GALLERY_PHOTO_MAX_BYTES,
  GALLERY_PHOTO_MAX_EDGE,
} from '../shared/gallery/photoPolicy.js'

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..')
const GALLERY_PATH = path.join(ROOT, 'src/content/profile_info/gallery.yml')
const WRANGLER_CONFIG = path.join(ROOT, 'admin/wrangler.jsonc')
const BACKUP_DIR = path.join(ROOT, '.gallery-image-backups')

// Must match getGalleryImageById in src/views/Gallery/index.vue.
const MEDIA_BASE = 'https://media.samyabrata.codeium.xyz'

// Shared with the admin's photo upload, which prepares photos to the same limits.
const MAX_EDGE = GALLERY_PHOTO_MAX_EDGE
const MAX_BYTES = GALLERY_PHOTO_MAX_BYTES
const JPEG_QUALITY = GALLERY_PHOTO_JPEG_QUALITY
// A size-only re-encode is uploaded only when it saves at least this much, so a
// photo that is already as small as it will get is not recompressed each run.
const MIN_SAVING = 0.1

// Card image box, width over height, at its narrowest and widest (measured).
const CARD_RATIO = { min: 1.37, max: 1.87 }
const DEFAULT_CROP_BUDGET = 0.2
// Pixel rounding moves a padded photo's ratio by a hair; do not chase it.
const CROP_TOLERANCE = 0.01

// A border this even (mean per-channel standard deviation) counts as plain.
const PLAIN_BORDER_STDEV = 12
// How far from the corner pixel's colour a margin row may stray (JPEG noise).
const TRIM_THRESHOLD = 12
const WHITE = { r: 255, g: 255, b: 255 }

const DOWNLOAD_CONCURRENCY = 6

main().catch((error) => {
  console.error(`fit-gallery-images: ${error.message}`)
  process.exit(1)
})

async function main() {
  const options = parseArgs(process.argv.slice(2))
  const allKeys = galleryImageKeys(YAML.parse(fs.readFileSync(GALLERY_PATH, 'utf8')))
  const keys = options.only ? allKeys.filter(key => options.only.has(key)) : allKeys
  const unknown = [...(options.only ?? []), ...options.whole].filter(key => !allKeys.includes(key))
  if (unknown.length) throw new Error(`not in gallery.yml: ${unknown.join(', ')}`)
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

    const plan = await planFix(buffer, options.whole.has(key) ? 0 : options.maxCrop)
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
  const options = { dryRun: false, maxCrop: DEFAULT_CROP_BUDGET, previewDir: null, only: null, whole: new Set() }

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
    } else if (arg.startsWith('--only=')) {
      options.only = new Set(keyList(arg.slice('--only='.length)))
    } else if (arg.startsWith('--whole=')) {
      keyList(arg.slice('--whole='.length)).forEach(key => options.whole.add(key))
    } else {
      throw new Error(`unknown option ${arg}`)
    }
  }

  if (!(options.maxCrop >= 0 && options.maxCrop <= 0.5)) {
    throw new Error('--max-crop must be between 0 and 0.5')
  }

  return options
}

function keyList(value) {
  return value.split(',').map(key => key.trim()).filter(Boolean)
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

// Cloudflare's edge caches these photos for hours, so a plain request can hand
// back the copy from before an upload. The cache key includes the query string,
// so a fresh one reaches the bucket itself.
function freshImageUrl(key) {
  return `${imageUrl(key)}?fresh=${Date.now()}`
}

async function downloadImage(key) {
  const response = await fetch(freshImageUrl(key), { cache: 'no-store' })
  if (response.status === 404) return { key, buffer: null }
  if (!response.ok) throw new Error(`${key}: HTTP ${response.status}`)
  return { key, buffer: Buffer.from(await response.arrayBuffer()) }
}

/**
 * Where the photo sits inside any plain margin around it: margins this script
 * added, or a document's own white border. Crop is judged against this box, so
 * a card trimming away margin does not count as losing photo.
 */
async function contentBox(buffer, width, height) {
  const { info } = await sharp(buffer)
    .rotate()
    .flatten({ background: WHITE })
    .trim({ threshold: TRIM_THRESHOLD })
    .toBuffer({ resolveWithObject: true })

  // An almost-uniform image trims down to a sliver; judge it whole instead.
  if (info.width < width * 0.2 || info.height < height * 0.2) {
    return { left: 0, top: 0, width, height }
  }

  return {
    left: -(info.trimOffsetLeft ?? 0),
    top: -(info.trimOffsetTop ?? 0),
    width: info.width,
    height: info.height,
  }
}

/**
 * Share of the content object-cover crops away, per axis, at the worst card
 * width. The card shows a centred window of the canvas, as wide as the box
 * shape allows at full height or as tall as it allows at full width. Width is
 * lost worst at the narrowest box and height at the widest.
 */
function cropLoss(canvas, content) {
  const loss = { tall: 0, wide: 0 }

  for (const box of [CARD_RATIO.min, CARD_RATIO.max]) {
    const windowWidth = Math.min(canvas.width, canvas.height * box)
    const windowHeight = Math.min(canvas.height, canvas.width / box)
    loss.wide = Math.max(loss.wide, 1 - shown(canvas.width, windowWidth, content.left, content.width) / content.width)
    loss.tall = Math.max(loss.tall, 1 - shown(canvas.height, windowHeight, content.top, content.height) / content.height)
  }

  return loss
}

/** How much of [start, start + size) falls in a window of `window` centred on [0, total). */
function shown(total, window, start, size) {
  const from = (total - window) / 2
  return Math.max(0, Math.min(start + size, from + window) - Math.max(start, from))
}

async function planFix(buffer, maxCrop) {
  const meta = await sharp(buffer).metadata()
  // EXIF orientations 5-8 display rotated a quarter turn.
  const rotated = (meta.orientation ?? 1) >= 5
  const width = rotated ? meta.height : meta.width
  const height = rotated ? meta.width : meta.height
  const canvas = { width, height }
  const content = await contentBox(buffer, width, height)
  const loss = cropLoss(canvas, content)
  const worst = Math.max(loss.tall, loss.wide)

  const reasons = []
  if (meta.format !== 'jpeg') reasons.push(`${meta.format} saved as .jpeg`)
  if (Math.max(width, height) > MAX_EDGE) reasons.push(`${width}x${height} over ${MAX_EDGE}px`)

  let padding = null
  if (worst > maxCrop + CROP_TOLERANCE) {
    padding = paddingFor(canvas, content, maxCrop)
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
 * Margins that bring the worst-case crop down to the budget. The widest card
 * shows the least height, so the canvas must be wide enough that its window
 * still holds all but `maxCrop` of the content's height; the narrowest card
 * likewise sets how tall it must be for the content's width. A too-tall photo
 * only gains side margins, a too-wide one top and bottom; a zero budget on a
 * photo near the card's own shape can need both.
 */
function paddingFor(canvas, content, maxCrop) {
  // The card's window is centred on the canvas and margins go on evenly, so
  // content sitting off-centre needs the window to reach its far edge.
  const spanWidth = 2 * Math.max(canvas.width / 2 - content.left, content.left + content.width - canvas.width / 2)
  const spanHeight = 2 * Math.max(canvas.height / 2 - content.top, content.top + content.height - canvas.height / 2)
  const windowWidth = Math.max(content.width * (1 - maxCrop), spanWidth - 2 * maxCrop * content.width)
  const windowHeight = Math.max(content.height * (1 - maxCrop), spanHeight - 2 * maxCrop * content.height)
  const width = Math.max(canvas.width, Math.ceil(windowHeight * CARD_RATIO.max))
  const height = Math.max(canvas.height, Math.ceil(windowWidth / CARD_RATIO.min))
  const extraWidth = width - canvas.width
  const extraHeight = height - canvas.height

  return {
    left: Math.floor(extraWidth / 2),
    right: Math.ceil(extraWidth / 2),
    top: Math.floor(extraHeight / 2),
    bottom: Math.ceil(extraHeight / 2),
  }
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

/** Reads the object back through the CDN, past its cache. */
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
