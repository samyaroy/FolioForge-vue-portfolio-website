// Unfurls the links on the ongoing-project cards the way a chat app unfurls a
// pasted URL: reads each page's Open Graph tags (title, description, image) and
// writes them to src/content/linkPreviews.json.
//
//   npm run previews:build
//
// A browser cannot read another site's HTML (no CORS headers), so the card
// cannot unfurl a link itself. This script does it ahead of time. The JSON is
// committed and the build does not run this script; scripts/hooks/pre-commit
// re-runs it whenever a commit touches ongoing_projects.yml.
//
// A link that cannot be read (a private repository, a page that refuses bots,
// no network) keeps the preview it had before. With none, the card builds a
// plain preview from the URL alone. So a failed fetch only warns; the script
// fails only when the content file itself cannot be read.

import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { parse as parseYaml } from 'yaml'
import { ongoingProjectLinkCategories } from '../src/config/projectLinkCategories.ts'
import { isEntryEnabled } from '../src/config/entryStatus.ts'

const repoRoot = fileURLToPath(new URL('..', import.meta.url))
const sourcePath = path.join(repoRoot, 'src/content/profile_info/ongoing_projects.yml')
const outputPath = path.join(repoRoot, 'src/content/linkPreviews.json')

const USER_AGENT = 'Mozilla/5.0 (compatible; FolioForgeLinkPreview/1.0)'
const TIMEOUT_MS = 10_000
/** Open Graph tags sit in the <head>; there is no need to scan a whole page. */
const MAX_HTML_CHARS = 512_000
const MAX_TITLE = 140
const MAX_DESCRIPTION = 300

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' }

function decodeEntities(value) {
  return value.replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, (match, entity) => {
    if (entity[0] !== '#') return ENTITIES[entity.toLowerCase()] ?? match
    const code = entity[1].toLowerCase() === 'x' ? Number.parseInt(entity.slice(2), 16) : Number.parseInt(entity.slice(1), 10)
    try {
      return String.fromCodePoint(code)
    } catch {
      return match
    }
  })
}

const clean = value => decodeEntities(String(value ?? '')).replace(/\s+/g, ' ').trim()

function clip(value, max) {
  return value.length <= max ? value : `${value.slice(0, max - 1).trimEnd()}…`
}

function isWebUrl(value) {
  try {
    const { protocol } = new URL(value)
    return protocol === 'https:' || protocol === 'http:'
  } catch {
    return false
  }
}

/** `property`/`name` → `content` for every <meta> tag, first one winning. */
function readMeta(html) {
  const meta = {}
  for (const [tag] of html.matchAll(/<meta\b[^>]*>/gi)) {
    const attributes = {}
    for (const [, name, , doubleQuoted, singleQuoted, bare] of tag.matchAll(/([\w:-]+)\s*=\s*("([^"]*)"|'([^']*)'|([^\s"'>]+))/g)) {
      attributes[name.toLowerCase()] = doubleQuoted ?? singleQuoted ?? bare
    }
    const key = (attributes.property ?? attributes.name ?? '').toLowerCase()
    if (key && attributes.content !== undefined && !(key in meta)) meta[key] = clean(attributes.content)
  }
  return meta
}

function titleTag(html) {
  const match = html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)
  return match ? clean(match[1]) : ''
}

/** An image URL made absolute, and only if it is a web URL a card can load. */
function imageUrl(value, pageUrl) {
  if (!value) return undefined
  try {
    const url = new URL(value, pageUrl)
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : undefined
  } catch {
    return undefined
  }
}

async function fetchPreview(url) {
  const response = await fetch(url, {
    headers: { 'user-agent': USER_AGENT, accept: 'text/html,application/xhtml+xml' },
    redirect: 'follow',
    signal: AbortSignal.timeout(TIMEOUT_MS),
  })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  if (!/html/i.test(response.headers.get('content-type') ?? '')) throw new Error('not an HTML page')

  const html = (await response.text()).slice(0, MAX_HTML_CHARS)
  const meta = readMeta(html)
  const siteName = meta['og:site_name'] ?? ''
  let title = meta['og:title'] || meta['twitter:title'] || titleTag(html)
  // GitHub and others title the page "GitHub - owner/repo: …"; the card shows
  // the site separately, so the prefix only repeats it.
  if (siteName && title.startsWith(`${siteName} - `)) title = title.slice(siteName.length + 3)
  const description = meta['og:description'] || meta['twitter:description'] || meta.description || ''
  const image = imageUrl(meta['og:image'] || meta['og:image:url'] || meta['twitter:image'], response.url)

  if (!title && !description && !image) throw new Error('the page has no preview tags')
  return Object.fromEntries(
    Object.entries({
      title: clip(title, MAX_TITLE),
      description: clip(description, MAX_DESCRIPTION),
      image,
      siteName,
    }).filter(([, value]) => value),
  )
}

/** Every link an ongoing-project card renders, in content order, once each. */
function cardLinks(content) {
  const projects = Array.isArray(content?.ongoing_projects) ? content.ongoing_projects : []
  const urls = projects
    .filter(isEntryEnabled)
    .flatMap(project => Object.keys(ongoingProjectLinkCategories).map(key => clean(project?.cred_link?.[key])))
    .filter(isWebUrl)
  return [...new Set(urls)]
}

function readPrevious() {
  try {
    return JSON.parse(fs.readFileSync(outputPath, 'utf8'))
  } catch {
    return {}
  }
}

async function main() {
  const urls = cardLinks(parseYaml(fs.readFileSync(sourcePath, 'utf8')))
  const previous = readPrevious()

  const results = await Promise.all(
    urls.map(async url => {
      try {
        return [url, await fetchPreview(url)]
      } catch (error) {
        const kept = previous[url]
        console.warn(`link previews: ${url}: ${error.message}; ${kept ? 'kept the previous preview' : 'the card will show a plain preview'}.`)
        return kept ? [url, kept] : null
      }
    }),
  )

  // Links no longer on any card drop out, so the file only ever describes
  // the current content.
  const previews = Object.fromEntries(results.filter(Boolean).sort(([a], [b]) => a.localeCompare(b)))
  fs.writeFileSync(outputPath, `${JSON.stringify(previews, null, 2)}\n`)
  console.log(`link previews: ${Object.keys(previews).length} of ${urls.length} links unfurled into ${path.relative(repoRoot, outputPath)}.`)
}

main().catch(error => {
  console.error(`link previews: ${error.message}`)
  process.exit(1)
})
