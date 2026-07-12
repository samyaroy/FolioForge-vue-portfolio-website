import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import yaml from '@modyfi/vite-plugin-yaml'
import ViteSitemap from 'vite-plugin-sitemap'
import { parse as parseYaml } from 'yaml'
import { parseFrontmatter } from './src/lib/frontmatter'
import { isFeatureEnabled } from './src/config/featureFlags'
import { SITE_URL } from './src/lib/seo'

const contentDir = fileURLToPath(new URL('./src/content', import.meta.url))

// Sitemap and RSS routes are derived from the same sources the app renders
// from: feature flags for the fixed pages, markdown files for /posts/:slug and
// trips.yml for /travel/:tripId. '/' is added by the sitemap plugin itself.
const DATE_PREFIX_RE = /^\d{4}-\d{2}-\d{2}-/

interface PostMeta {
  slug: string
  title: string
  date: string
  description?: string
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
        draft: attributes.draft === true,
      }
    })
    .filter((post) => !post.draft)
    .sort((a, b) => b.date.localeCompare(a.date))
}

function tripRoutes(): string[] {
  const raw = fs.readFileSync(path.join(contentDir, 'travel/trips.yml'), 'utf8')
  const parsed = parseYaml(raw) as { trips?: Array<{ id?: unknown }> } | null
  return (parsed?.trips ?? [])
    .map((trip) => trip.id)
    .filter((id): id is string => typeof id === 'string' && id.length > 0)
    .map((id) => `/travel/${id}`)
}

const staticRoutes = [
  isFeatureEnabled('showReadings') ? '/readings' : null,
  isFeatureEnabled('showTravel') ? '/travel' : null,
  isFeatureEnabled('showHobbies') ? '/hobbies' : null,
  isFeatureEnabled('showGallery') ? '/gallery' : null,
].filter((route): route is string => route !== null)

const posts = loadPosts()

// Set-dedupe: duplicate URLs are invalid in a sitemap (e.g. two trips
// accidentally sharing an id in trips.yml).
const dynamicRoutes = [
  ...new Set([
    ...staticRoutes,
    ...posts.map((post) => `/posts/${post.slug}`),
    ...(isFeatureEnabled('showTravel') ? tripRoutes() : []),
  ]),
]

function xmlEscape(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function siteName(): string {
  const raw = fs.readFileSync(path.join(contentDir, 'site.yml'), 'utf8')
  const parsed = parseYaml(raw) as { profile?: { name?: unknown } } | null
  const name = parsed?.profile?.name
  return typeof name === 'string' ? name : 'Samyabrata Roy'
}

function channelDescription(): string {
  const raw = fs.readFileSync(path.join(contentDir, 'descriptions.yml'), 'utf8')
  const parsed = parseYaml(raw) as { blogs?: unknown } | null
  return typeof parsed?.blogs === 'string' ? parsed.blogs : 'Blog by Samyabrata Roy'
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
    <title>${xmlEscape(siteName())} · Blog</title>
    <link>${SITE_URL}/</link>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml"/>
    <description>${xmlEscape(channelDescription())}</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items.join('\n')}
  </channel>
</rss>
`
}

// Writes the RSS feed next to the bundle; announced by the
// <link rel="alternate"> in index.html and robots-discoverable at /rss.xml.
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

// Blog app for https://blogs.samyabrata.codeium.xyz
// Served at the subdomain root, so base stays '/'.
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    yaml(),
    ViteSitemap({
      hostname: SITE_URL,
      dynamicRoutes,
      // robots.txt is a static file in public/ (same setup as the main site).
      generateRobotsTxt: false,
    }),
    rssPlugin(),
  ],
  base: '/',
})
