// Renders the social cards declared in config/og-card.yml.
//
//   npm run og:build
//
// Why a generator rather than a design file: the card is mostly text that
// repeats what the site already says about itself, and the two cards have to
// stay visually related. Editing YAML keeps them in step and leaves a diff that
// says what changed, which a re-exported binary never does.
//
// Pipeline: config -> SVG -> PNG (rsvg-convert) -> JPEG (sips). Both tools ship
// with a normal macOS + Homebrew setup and neither needs a browser. Text is
// drawn by librsvg through fontconfig, so the FONT_STACK below has to name
// fonts the machine actually has; the output is committed, so it is rendered
// once on a developer machine rather than on every build.
//
// The generated .jpg files are committed and the build does not depend on this
// script — re-run it and commit when the config changes.

import { Buffer } from 'node:buffer'
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { parse as parseYaml } from 'yaml'

const repoRoot = fileURLToPath(new URL('..', import.meta.url))
const configPath = path.join(repoRoot, 'config/og-card.yml')

// Where each element sits on a 1200x630 card. Not in the config: the card has
// one composition, and exposing coordinates would invite a broken layout with
// no way to see it short of re-rendering.
const LAYOUT = {
  /** Full-height brand bar down the left edge. */
  edgeBarWidth: 10,
  /** Left margin for every line of text. */
  textLeft: 88,
  eyebrow: { baseline: 112, size: 19, letterSpacing: 4.2 },
  heading: { baseline: 245, size: 86, maxWidth: 660 },
  /** Short accent rule between the heading and the subtitle. */
  rule: { top: 291, width: 96, height: 5 },
  subtitle: { firstBaseline: 365, size: 26, lineHeight: 47 },
  avatar: { centerX: 999, centerY: 309, radius: 181, ringWidth: 6 },
}

// Helvetica is the face the existing cards were set in and is present on every
// macOS install; the rest are fallbacks for a machine without it.
const FONT_STACK = 'Helvetica, Arial, Liberation Sans, sans-serif'

// Mean advance width of bold Helvetica in mixed-case text, as a fraction of the
// font size. Only used to shrink an over-long heading before it runs into the
// portrait — librsvg gives no way to measure text, so this is an estimate, and
// it is deliberately a little generous.
const BOLD_ADVANCE_RATIO = 0.58

async function main() {
  const config = parseYaml(fs.readFileSync(configPath, 'utf8'))
  const cards = Array.isArray(config?.cards) ? config.cards : []

  if (!cards.length) {
    throw new Error('config/og-card.yml declares no cards')
  }

  requireCommand('rsvg-convert', 'brew install librsvg')
  requireCommand('sips', 'sips ships with macOS; on Linux use ImageMagick instead')

  const workDir = fs.mkdtempSync(path.join(os.tmpdir(), 'og-card-'))

  try {
    for (const card of cards) {
      await renderCard(card, config, workDir)
    }
  } finally {
    fs.rmSync(workDir, { recursive: true, force: true })
  }
}

async function renderCard(card, config, workDir) {
  const { size, theme, quality = 80 } = config
  const outputPath = path.join(repoRoot, card.output)
  const stem = path.basename(card.output, path.extname(card.output))
  const svgPath = path.join(workDir, `${stem}.svg`)
  const pngPath = path.join(workDir, `${stem}.png`)

  const avatar = card.avatar ? await loadImageDataUri(card.avatar) : ''
  fs.writeFileSync(svgPath, buildSvg(card, { size, theme, avatar }))

  execFileSync('rsvg-convert', [
    '--width', String(size.width),
    '--height', String(size.height),
    '--format', 'png',
    '--output', pngPath,
    svgPath,
  ])

  fs.mkdirSync(path.dirname(outputPath), { recursive: true })
  execFileSync('sips', [
    '--setProperty', 'format', 'jpeg',
    '--setProperty', 'formatOptions', String(quality),
    pngPath,
    '--out', outputPath,
  ], { stdio: 'ignore' })

  const { size: bytes } = fs.statSync(outputPath)
  console.log(`${card.output}  ${size.width}x${size.height}  ${(bytes / 1024).toFixed(0)} KB`)
}

function buildSvg(card, { size, theme, avatar }) {
  const { width, height } = size
  const lines = Array.isArray(card.lines) ? card.lines : []
  const headingSize = fitHeadingSize(card.heading ?? '')

  const subtitle = lines
    .map((line, index) => {
      const baseline = LAYOUT.subtitle.firstBaseline + index * LAYOUT.subtitle.lineHeight
      return `  <text x="${LAYOUT.textLeft}" y="${baseline}" font-size="${LAYOUT.subtitle.size}" fill="${theme.muted}">${escapeXml(line)}</text>`
    })
    .join('\n')

  // The portrait is embedded as a data URI: librsvg will not fetch a remote
  // href, and a file href would tie the SVG to this machine's paths.
  const portrait = avatar
    ? `  <circle cx="${LAYOUT.avatar.centerX}" cy="${LAYOUT.avatar.centerY}" r="${LAYOUT.avatar.radius}" fill="none" stroke="${theme.accent}" stroke-width="${LAYOUT.avatar.ringWidth}"/>
  <image href="${avatar}" x="${LAYOUT.avatar.centerX - LAYOUT.avatar.radius}" y="${LAYOUT.avatar.centerY - LAYOUT.avatar.radius}" width="${LAYOUT.avatar.radius * 2}" height="${LAYOUT.avatar.radius * 2}" preserveAspectRatio="xMidYMid slice" clip-path="url(#avatarClip)"/>`
    : ''

  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <clipPath id="avatarClip">
      <circle cx="${LAYOUT.avatar.centerX}" cy="${LAYOUT.avatar.centerY}" r="${LAYOUT.avatar.radius - LAYOUT.avatar.ringWidth / 2}"/>
    </clipPath>
  </defs>

  <rect width="${width}" height="${height}" fill="${theme.background}"/>
  <rect width="${LAYOUT.edgeBarWidth}" height="${height}" fill="${theme.accent}"/>

${portrait}

  <g font-family="${FONT_STACK}">
    <text x="${LAYOUT.textLeft}" y="${LAYOUT.eyebrow.baseline}" font-size="${LAYOUT.eyebrow.size}" font-weight="bold" letter-spacing="${LAYOUT.eyebrow.letterSpacing}" fill="${theme.eyebrow}">${escapeXml((card.eyebrow ?? '').toUpperCase())}</text>
    <text x="${LAYOUT.textLeft}" y="${LAYOUT.heading.baseline}" font-size="${headingSize}" font-weight="bold" fill="${theme.heading}">${escapeXml(card.heading ?? '')}</text>
    <rect x="${LAYOUT.textLeft}" y="${LAYOUT.rule.top}" width="${LAYOUT.rule.width}" height="${LAYOUT.rule.height}" fill="${theme.accent}"/>
${subtitle}
  </g>
</svg>
`
}

/** Shrinks a heading that would otherwise run under the portrait. */
function fitHeadingSize(heading) {
  const { size, maxWidth } = LAYOUT.heading
  const estimatedWidth = heading.length * size * BOLD_ADVANCE_RATIO

  if (estimatedWidth <= maxWidth) return size

  return Math.max(32, Math.floor((maxWidth / estimatedWidth) * size))
}

/** Fetches or reads an image and returns it as a data URI. */
async function loadImageDataUri(source) {
  if (/^https?:\/\//i.test(source)) {
    const response = await fetch(source)
    if (!response.ok) {
      throw new Error(`avatar ${source} responded ${response.status}`)
    }

    const contentType = response.headers.get('content-type') ?? mimeTypeOf(source)
    const body = Buffer.from(await response.arrayBuffer())

    return `data:${contentType};base64,${body.toString('base64')}`
  }

  const filePath = path.join(repoRoot, source)
  if (!fs.existsSync(filePath)) {
    throw new Error(`avatar not found: ${source}`)
  }

  return `data:${mimeTypeOf(source)};base64,${fs.readFileSync(filePath).toString('base64')}`
}

function mimeTypeOf(source) {
  const extension = path.extname(source).toLowerCase()

  if (extension === '.png') return 'image/png'
  if (extension === '.webp') return 'image/webp'
  if (extension === '.svg') return 'image/svg+xml'

  return 'image/jpeg'
}

/** Fails with the install hint rather than a bare ENOENT from deep in the run. */
function requireCommand(command, hint) {
  try {
    execFileSync('which', [command], { stdio: 'ignore' })
  } catch {
    throw new Error(`${command} not found — ${hint}`)
  }
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

main().catch((error) => {
  console.error(`og:build failed — ${error.message}`)
  process.exit(1)
})
