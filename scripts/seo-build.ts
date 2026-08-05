import fs from 'node:fs'
import path from 'node:path'

// Both apps are client-rendered, so the bundle's index.html reaches crawlers as
// an empty shell: one <title> for every route, no description, and no Open
// Graph tags at all. Social crawlers (LinkedIn, X, WhatsApp, Slack) never run
// JavaScript, so a shared link renders as a blank card no matter what the app
// sets at runtime.
//
// This plugin fixes that without a headless browser or a server: after the
// bundle is written it stamps out one HTML file per known route, each a copy of
// the shell with that route's own <title>, description, canonical, Open Graph,
// Twitter card, and JSON-LD baked into the head. Static hosts serve
// dist/<route>/index.html directly for /<route>, and the SPA still boots and
// takes over navigation exactly as before.

export interface SeoPage {
  /** Route path, e.g. '/' or '/contact'. */
  path: string
  /** Full <title>, used verbatim. */
  title: string
  /**
   * Headline for the social card. Defaults to `title`, but cards already show
   * og:site_name beside the headline, so a title carrying its own " · Site"
   * suffix reads as a stutter — pass the bare page name here.
   */
  socialTitle?: string
  description: string
  /** og:type — 'website' for pages, 'article' for posts. */
  type?: string
  /** Site-relative or absolute image URL for the social card. */
  image?: string
  imageAlt?: string
  /**
   * Pixel dimensions of `image`. Only set them when they are known to be
   * right — a wrong og:image:width makes crawlers lay out the card against
   * dimensions that do not match the file they fetch.
   */
  imageSize?: { width: number; height: number }
  /** ISO date, emitted as article:published_time on `type: 'article'` pages. */
  publishedTime?: string
  /** Emitted as article:tag, one per entry. */
  tags?: string[]
  /** Serialized JSON-LD objects, one <script> each. */
  jsonLd?: unknown[]
  /** Keeps the page out of search results; used for the 404 shell. */
  noindex?: boolean
  /**
   * ISO date this page's content last changed. Omitted unless the date is
   * real: Google discards a sitemap's lastmod wholesale once it catches the
   * field tracking deploys rather than edits.
   */
  lastmod?: string
}

export interface SeoPrerenderOptions {
  siteName: string
  /** Canonical origin, no trailing slash. */
  siteUrl: string
  pages: SeoPage[]
  /** Rendered to dist/404.html, which hosts serve with a real 404 status. */
  notFound?: SeoPage
  /** Feed advertised via <link rel="alternate">, if the site has one. */
  rssUrl?: string
  /** Feed title; defaults to siteName. */
  rssTitle?: string
  /** Emits sitemap.xml alongside the pages. */
  sitemap?: boolean
}

function escapeAttribute(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

/** "<" is escaped so nothing inside the data can close the script tag. */
function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c')
}

export function absoluteUrl(siteUrl: string, pathOrUrl: string): string {
  if (/^https?:\/\//.test(pathOrUrl)) return pathOrUrl
  return `${siteUrl}${pathOrUrl.startsWith('/') ? '' : '/'}${pathOrUrl}`
}

function headFor(page: SeoPage, options: SeoPrerenderOptions): string {
  const url = absoluteUrl(options.siteUrl, page.path)
  const image = page.image ? absoluteUrl(options.siteUrl, page.image) : undefined
  const socialTitle = page.socialTitle ?? page.title
  const tags: string[] = [
    `<title>${escapeHtml(page.title)}</title>`,
    `<meta name="description" content="${escapeAttribute(page.description)}" />`,
  ]

  if (page.noindex) {
    tags.push('<meta name="robots" content="noindex, follow" />')
  } else {
    tags.push(`<link rel="canonical" href="${escapeAttribute(url)}" />`)
  }

  tags.push(
    `<meta property="og:type" content="${escapeAttribute(page.type ?? 'website')}" />`,
    `<meta property="og:site_name" content="${escapeAttribute(options.siteName)}" />`,
    `<meta property="og:title" content="${escapeAttribute(socialTitle)}" />`,
    `<meta property="og:description" content="${escapeAttribute(page.description)}" />`,
    `<meta property="og:url" content="${escapeAttribute(url)}" />`,
    `<meta property="og:locale" content="en_US" />`,
  )

  if (image) {
    tags.push(`<meta property="og:image" content="${escapeAttribute(image)}" />`)
    if (page.imageSize) {
      tags.push(
        `<meta property="og:image:width" content="${page.imageSize.width}" />`,
        `<meta property="og:image:height" content="${page.imageSize.height}" />`,
      )
    }
    tags.push(
      `<meta property="og:image:alt" content="${escapeAttribute(page.imageAlt ?? socialTitle)}" />`,
      // summary_large_image needs an image; without one the card degrades badly.
      '<meta name="twitter:card" content="summary_large_image" />',
      `<meta name="twitter:image" content="${escapeAttribute(image)}" />`,
    )
  } else {
    tags.push('<meta name="twitter:card" content="summary" />')
  }

  if (page.publishedTime) {
    tags.push(
      `<meta property="article:published_time" content="${escapeAttribute(page.publishedTime)}" />`,
    )
  }

  for (const tag of page.tags ?? []) {
    tags.push(`<meta property="article:tag" content="${escapeAttribute(tag)}" />`)
  }

  tags.push(
    `<meta name="twitter:title" content="${escapeAttribute(socialTitle)}" />`,
    `<meta name="twitter:description" content="${escapeAttribute(page.description)}" />`,
  )

  if (options.rssUrl) {
    tags.push(
      `<link rel="alternate" type="application/rss+xml" title="${escapeAttribute(options.rssTitle ?? options.siteName)}" href="${escapeAttribute(options.rssUrl)}" />`,
    )
  }

  for (const data of page.jsonLd ?? []) {
    tags.push(
      `<script type="application/ld+json">${serializeJsonLd(data)}</script>`,
    )
  }

  return tags.map((tag) => `    ${tag}`).join('\n')
}

/**
 * Strips the head tags this plugin owns, so the values it injects are the only
 * ones present and re-running against an already-stamped shell is harmless.
 */
function stripManagedTags(html: string): string {
  return html
    .replace(/[ \t]*<title>[\s\S]*?<\/title>\s*\n?/gi, '')
    .replace(/[ \t]*<meta\s+name="description"[^>]*>\s*\n?/gi, '')
    .replace(/[ \t]*<link\s+rel="canonical"[^>]*>\s*\n?/gi, '')
    .replace(
      /[ \t]*<link\s+rel="alternate"\s+type="application\/rss\+xml"[^>]*>\s*\n?/gi,
      '',
    )
}

/**
 * <loc> plus a real <lastmod> where one exists, and nothing else. `priority`
 * and `changefreq` are ignored by every major engine, and emitting them
 * uniformly (every URL at priority 1.0) conveys no ordering anyway.
 */
function buildSitemap(options: SeoPrerenderOptions): string {
  const entries = options.pages
    .filter((page) => !page.noindex)
    .map((page) => {
      const loc = escapeHtml(absoluteUrl(options.siteUrl, page.path))
      const lastmod = page.lastmod ? `\n    <lastmod>${page.lastmod}</lastmod>` : ''
      return `  <url>\n    <loc>${loc}</loc>${lastmod}\n  </url>`
    })

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join('\n')}
</urlset>
`
}

/**
 * Rewrites a finished bundle in place: one HTML file per page, plus 404.html
 * and sitemap.xml. Call this from a `closeBundle` hook.
 *
 * The two apps install Vite separately, so a `Plugin` typed against one of the
 * two copies is not assignable in the other. Keeping this a plain function and
 * letting each vite.config wrap it in its own plugin object avoids importing
 * Vite's types across that boundary at all.
 */
export function writeSeoOutput(outDir: string, options: SeoPrerenderOptions): void {
  const shellPath = path.join(outDir, 'index.html')
  if (!fs.existsSync(shellPath)) return

  // Read once up front: writing the home page overwrites this same file.
  const shell = stripManagedTags(fs.readFileSync(shellPath, 'utf8'))

  const render = (page: SeoPage): string =>
    shell.replace(/\s*<\/head>/, `\n${headFor(page, options)}\n  </head>`)

  for (const page of options.pages) {
    const target =
      page.path === '/'
        ? shellPath
        : path.join(outDir, page.path.replace(/^\/+/, ''), 'index.html')

    fs.mkdirSync(path.dirname(target), { recursive: true })
    fs.writeFileSync(target, render(page))
  }

  if (options.notFound) {
    fs.writeFileSync(path.join(outDir, '404.html'), render(options.notFound))
  }

  if (options.sitemap) {
    fs.writeFileSync(path.join(outDir, 'sitemap.xml'), buildSitemap(options))
  }
}
