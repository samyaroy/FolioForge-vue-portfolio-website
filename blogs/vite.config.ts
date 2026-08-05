import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import yaml from '@modyfi/vite-plugin-yaml'
import { parse as parseYaml } from 'yaml'
import { parseFrontmatter } from './src/lib/frontmatter'
import { isFeatureEnabled } from './src/config/featureFlags'
import { SITE_URL } from './src/lib/seo'
// Shared with the portfolio build; see ../scripts/seo-build.ts for why the
// head has to be stamped at build time rather than by the app.
import {
  absoluteUrl,
  writeSeoOutput,
  type SeoPage,
  type SeoPrerenderOptions,
} from '../scripts/seo-build'

const contentDir = fileURLToPath(new URL('./src/content', import.meta.url))

// Every prerendered page, the sitemap, and the RSS feed are derived from the
// same sources the app renders from: feature flags and sections.yml for the
// fixed pages, markdown files for /posts/:slug, and trips.yml for
// /travel/:tripId. Nothing here restates content that lives in src/content.
const DATE_PREFIX_RE = /^\d{4}-\d{2}-\d{2}-/
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/

const PORTFOLIO_URL = 'https://samyabrata.codeium.xyz'
const PERSON_ID = `${PORTFOLIO_URL}/#person`
const BLOG_ID = `${SITE_URL}/#blog`

/** 1200x630 social card, committed at public/og-image.jpg. Replace the file to change it. */
const OG_IMAGE_PATH = '/og-image.jpg'
const OG_IMAGE_SIZE = { width: 1200, height: 630 }

interface PostMeta {
  slug: string
  title: string
  date: string
  description?: string
  cover?: string
  tags: string[]
}

function readYaml<T>(relativePath: string): T {
  const raw = fs.readFileSync(path.join(contentDir, relativePath), 'utf8')
  return (parseYaml(raw) ?? {}) as T
}

// Mirrors the slug/title/draft handling in src/lib/posts.ts (which uses
// import.meta.glob and so cannot run here in the config).
function loadPosts(): PostMeta[] {
  const postsDir = path.join(contentDir, 'posts')
  return fs
    .readdirSync(postsDir)
    .filter((file) => file.endsWith('.md'))
    .map((file) => {
      const raw = fs.readFileSync(path.join(postsDir, file), 'utf8')
      const { attributes } = parseFrontmatter(raw)
      const slug = file.replace(/\.md$/, '').replace(DATE_PREFIX_RE, '')
      return {
        slug,
        title: typeof attributes.title === 'string' ? attributes.title.trim() : slug,
        date: typeof attributes.date === 'string' ? attributes.date : '',
        description:
          typeof attributes.description === 'string'
            ? attributes.description
            : undefined,
        cover: typeof attributes.cover === 'string' ? attributes.cover : undefined,
        tags: Array.isArray(attributes.tags)
          ? attributes.tags.filter((tag): tag is string => typeof tag === 'string')
          : [],
        draft: attributes.draft === true,
      }
    })
    .filter((post) => !post.draft)
    .sort((a, b) => b.date.localeCompare(a.date))
}

interface Trip {
  id?: unknown
  title?: unknown
  date?: unknown
  location?: unknown
  summary?: unknown
  coverImage?: unknown
}

function loadTrips(): Trip[] {
  const parsed = readYaml<{ trips?: Trip[] }>('travel/trips.yml')
  return (parsed.trips ?? []).filter(
    (trip) => typeof trip.id === 'string' && trip.id.length > 0,
  )
}

const sections = readYaml<Record<string, { title?: string }>>('sections.yml')
const descriptions = readYaml<Record<string, string>>('descriptions.yml')
const site = readYaml<{ profile?: { name?: string } }>('site.yml')

const SITE_NAME = site.profile?.name ?? 'Samyabrata Roy'
const BASE_TITLE = `${SITE_NAME} · Blog`
const BLOG_DESCRIPTION = descriptions.blogs ?? `Blog by ${SITE_NAME}`

const posts = loadPosts()
const trips = isFeatureEnabled('showTravel') ? loadTrips() : []

function pageTitle(title: string | null): string {
  return title ? `${title} · ${BASE_TITLE}` : BASE_TITLE
}

/** A sitemap lastmod is only worth emitting when the date is a real one. */
function lastmodOf(date: unknown): string | undefined {
  return typeof date === 'string' && ISO_DATE_RE.test(date) ? date : undefined
}

const author = {
  '@type': 'Person',
  '@id': PERSON_ID,
  name: SITE_NAME,
  url: PORTFOLIO_URL,
}

const blog = {
  '@context': 'https://schema.org',
  '@type': 'Blog',
  '@id': BLOG_ID,
  url: `${SITE_URL}/`,
  name: BASE_TITLE,
  description: BLOG_DESCRIPTION,
  inLanguage: 'en',
  author,
  publisher: author,
}

// ---------------------------------------------------------------------------
// Pages
// ---------------------------------------------------------------------------

const homePage: SeoPage = {
  path: '/',
  title: BASE_TITLE,
  socialTitle: sections.blogs?.title ?? BASE_TITLE,
  description: BLOG_DESCRIPTION,
  image: OG_IMAGE_PATH,
  imageSize: OG_IMAGE_SIZE,
  imageAlt: BASE_TITLE,
  jsonLd: [
    blog,
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      itemListElement: posts.map((post, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: `${SITE_URL}/posts/${post.slug}`,
        name: post.title,
      })),
    },
  ],
}

const SECTION_KEYS = ['readings', 'movies', 'travel', 'hobbies', 'gallery'] as const
const SECTION_FLAGS: Record<(typeof SECTION_KEYS)[number], string> = {
  readings: 'showReadings',
  movies: 'showMovies',
  travel: 'showTravel',
  hobbies: 'showHobbies',
  gallery: 'showGallery',
}

const sectionPages: SeoPage[] = SECTION_KEYS.filter((key) =>
  isFeatureEnabled(SECTION_FLAGS[key]),
).map((key) => {
  const title = sections[key]?.title ?? key
  const url = `${SITE_URL}/${key}`
  return {
    path: `/${key}`,
    title: pageTitle(title),
    socialTitle: title,
    description: descriptions[key] ?? BLOG_DESCRIPTION,
    image: OG_IMAGE_PATH,
    imageSize: OG_IMAGE_SIZE,
    imageAlt: BASE_TITLE,
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        url,
        name: title,
        description: descriptions[key],
        isPartOf: { '@id': BLOG_ID },
        inLanguage: 'en',
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Writing', item: `${SITE_URL}/` },
          { '@type': 'ListItem', position: 2, name: title, item: url },
        ],
      },
    ],
  }
})

const postPages: SeoPage[] = posts.map((post) => {
  const url = `${SITE_URL}/posts/${post.slug}`
  // A post without a description falls back to the blog's own line rather than
  // an excerpt: a truncated first paragraph makes a worse snippet than a
  // deliberate sentence, and Google rewrites weak descriptions anyway.
  const description = post.description ?? BLOG_DESCRIPTION
  const cover = post.cover ? absoluteUrl(SITE_URL, post.cover) : undefined

  return {
    path: `/posts/${post.slug}`,
    title: pageTitle(post.title),
    socialTitle: post.title,
    description,
    type: 'article',
    // Only the generated card has known dimensions; a post cover is whatever
    // the author dropped in, so its size is left unstated.
    image: cover ?? OG_IMAGE_PATH,
    imageSize: cover ? undefined : OG_IMAGE_SIZE,
    imageAlt: post.title,
    publishedTime: post.date || undefined,
    tags: post.tags,
    lastmod: lastmodOf(post.date),
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: post.title,
        url,
        mainEntityOfPage: url,
        datePublished: post.date || undefined,
        description,
        image: cover,
        keywords: post.tags.length ? post.tags.join(', ') : undefined,
        isPartOf: { '@id': BLOG_ID },
        author,
        publisher: author,
        inLanguage: 'en',
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Writing', item: `${SITE_URL}/` },
          { '@type': 'ListItem', position: 2, name: post.title, item: url },
        ],
      },
    ],
  }
})

const tripPages: SeoPage[] = trips.map((trip) => {
  const id = trip.id as string
  const title = typeof trip.title === 'string' ? trip.title : id
  const location = typeof trip.location === 'string' ? trip.location : undefined
  const summary = typeof trip.summary === 'string' ? trip.summary.trim() : ''
  const url = `${SITE_URL}/travel/${id}`

  // Several trips still carry placeholder summaries from the template, which
  // would make useless snippets; anything that short is treated as absent and
  // a description is composed from the fields that are real.
  const description =
    summary.length >= 40
      ? summary
      : [title, location, `Travel notes by ${SITE_NAME}.`]
          .filter(Boolean)
          .join(' · ')

  const cover =
    typeof trip.coverImage === 'string'
      ? absoluteUrl(SITE_URL, trip.coverImage)
      : undefined

  return {
    path: `/travel/${id}`,
    title: pageTitle(title),
    socialTitle: title,
    description,
    type: 'article',
    image: cover ?? OG_IMAGE_PATH,
    imageSize: cover ? undefined : OG_IMAGE_SIZE,
    imageAlt: title,
    publishedTime: lastmodOf(trip.date),
    lastmod: lastmodOf(trip.date),
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: title,
        url,
        mainEntityOfPage: url,
        datePublished: lastmodOf(trip.date),
        description,
        image: cover,
        contentLocation: location ? { '@type': 'Place', name: location } : undefined,
        isPartOf: { '@id': BLOG_ID },
        author,
        publisher: author,
        inLanguage: 'en',
      },
    ],
  }
})

// Set-dedupe by path: duplicate URLs are invalid in a sitemap and would make
// two pages overwrite each other on disk (e.g. two trips sharing an id).
const pages: SeoPage[] = [
  ...(isFeatureEnabled('showBlogHome') ? [homePage] : []),
  ...sectionPages,
  ...postPages,
  ...tripPages,
].filter(
  (page, index, all) => all.findIndex((other) => other.path === page.path) === index,
)

// ---------------------------------------------------------------------------
// RSS
// ---------------------------------------------------------------------------

function xmlEscape(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function buildRss(): string {
  const items = posts.map((post) => {
    const url = `${SITE_URL}/posts/${post.slug}`
    const lines = [
      '    <item>',
      `      <title>${xmlEscape(post.title)}</title>`,
      `      <link>${url}</link>`,
      `      <guid isPermaLink="true">${url}</guid>`,
    ]
    if (post.date) {
      lines.push(
        `      <pubDate>${new Date(`${post.date}T00:00:00Z`).toUTCString()}</pubDate>`,
      )
    }
    if (post.description) {
      lines.push(`      <description>${xmlEscape(post.description)}</description>`)
    }
    lines.push('    </item>')
    return lines.join('\n')
  })

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${xmlEscape(BASE_TITLE)}</title>
    <link>${SITE_URL}/</link>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml"/>
    <description>${xmlEscape(BLOG_DESCRIPTION)}</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items.join('\n')}
  </channel>
</rss>
`
}

// Writes the RSS feed next to the bundle; announced by the
// <link rel="alternate"> the SEO plugin stamps into every page.
function rssPlugin(): Plugin {
  let outDir = 'dist'
  return {
    name: 'blog-rss',
    apply: 'build',
    configResolved(config) {
      outDir = path.resolve(config.root, config.build.outDir)
    },
    closeBundle() {
      fs.writeFileSync(path.join(outDir, 'rss.xml'), buildRss())
    },
  }
}

// Thin wrapper so the shared implementation never has to import Vite's types;
// see ../scripts/seo-build.ts.
function seoPrerender(options: SeoPrerenderOptions): Plugin {
  let outDir = 'dist'
  return {
    name: 'seo-prerender',
    apply: 'build',
    configResolved(config) {
      outDir = path.resolve(config.root, config.build.outDir)
    },
    closeBundle() {
      writeSeoOutput(outDir, options)
    },
  }
}

// Blog app for https://blogs.samyabrata.codeium.xyz
// Served at the subdomain root, so base stays '/'.
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    yaml(),
    seoPrerender({
      siteName: BASE_TITLE,
      siteUrl: SITE_URL,
      pages,
      sitemap: true,
      rssUrl: `${SITE_URL}/rss.xml`,
      rssTitle: BASE_TITLE,
      notFound: {
        path: '/404',
        title: `Page Not Found · ${BASE_TITLE}`,
        description: 'This page does not exist.',
        noindex: true,
      },
    }),
    rssPlugin(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  base: '/',
})
