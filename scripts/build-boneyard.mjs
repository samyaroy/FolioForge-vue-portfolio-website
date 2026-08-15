// Captures boneyard skeletons for every page the app actually serves.
//
// The URL list is derived from src/router/routes.ts rather than written out
// here, so a route added there is captured without touching this file -- the
// same reason vite.config.ts derives the sitemap and prerender list from it.
// Node runs that .ts import directly via its built-in type stripping.
//
// Usage:
//   npm run boneyard:build                  # every enabled route
//   npm run boneyard:build -- <url> [...]   # explicit URLs instead
//   BONEYARD_BASE_URL=http://localhost:4173 npm run boneyard:build
//   BONEYARD_URLS=a,b npm run boneyard:build
//
// Requires a dev/preview server already running at the base URL, and a
// one-time `npx playwright install chromium` for the headless browser.

import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import process from 'node:process'

import { routeMetadata } from '../src/router/routes.ts'
import { isFeatureEnabled } from '../src/config/featureFlags.ts'

const outputDir = './src/bones'
const cliPath = './node_modules/boneyard-js/bin/cli.js'

// Which file the CLI writes depends on its version: it emitted registry.js and
// a React import in 1.6, and emits a Vue-aware registry.ts in 1.9. src/main.ts
// imports it extensionless so either resolves.
const registryPaths = [`${outputDir}/registry.ts`, `${outputDir}/registry.js`]

// `localhost`, not `127.0.0.1`: Vite binds the dev server to whatever
// `localhost` resolves to, which on macOS is the IPv6 loopback `[::1]`. Nothing
// listens on the IPv4 address, so a hardcoded 127.0.0.1 is refused outright.
const baseUrl = (process.env.BONEYARD_BASE_URL || 'http://localhost:5173').replace(/\/+$/, '')

// Tab state lives in a `?tab=` query param, so each tab is a capturable URL.
// Only the ids are listed: a tab whose feature flag is off is ignored by the
// page, which falls back to its first enabled tab -- that captures a duplicate
// of the default view rather than the wrong page, so it needs no flag gating
// here. Update a list only when a page's tab ids change.
const tabVariants = {
  '/projects-publications': ['projects', 'articles', 'publications', 'posters'],
  '/affiliation-memberships': ['affiliations', 'collaborators', 'memberships'],
  '/workshops-bootcamps-attended': ['conferences', 'fdps'],
  '/teachings': ['courses', 'projects', 'others'],
  '/internships-certifications': ['internships', 'certifications'],
  '/professional-activity': ['invited-talks', 'hosted-events'],
  '/resources': ['study-material', 'worth-exploring'],
}

// A route whose flag is off redirects to Home at runtime, so capturing it would
// silently snapshot the home page under that route's name. vite.config.ts skips
// them from the sitemap and prerender for the same reason.
function enabledRoutes() {
  return routeMetadata.filter(
    route => !route.flagPath || isFeatureEnabled(route.flagPath, { mode: route.flagMode }),
  )
}

function routeUrls() {
  return enabledRoutes().flatMap((route) => {
    // The app uses createWebHistory, so paths are real paths. They were once
    // written `/#/gallery`, which under history routing loads `/` and drops the
    // fragment -- every such URL quietly captured the home page instead.
    const pageUrl = `${baseUrl}${route.path}`
    const tabs = tabVariants[route.path] || []

    return [pageUrl, ...tabs.map(tab => `${pageUrl}?tab=${encodeURIComponent(tab)}`)]
  })
}

function explicitUrls() {
  if (process.argv.length > 2) return process.argv.slice(2)

  return process.env.BONEYARD_URLS
    ? process.env.BONEYARD_URLS.split(',').map(url => url.trim()).filter(Boolean)
    : null
}

// Older CLI versions emitted a React registry, so it had to be rewritten for the
// Vue adapter. 1.9 emits a Vue-aware one already, hence the no-op path.
function normalizeRegistry() {
  const written = registryPaths.filter(path => existsSync(path))

  if (written.length === 0) {
    throw new Error(`Expected the CLI to write one of: ${registryPaths.join(', ')}`)
  }

  // Whichever the CLI just wrote is authoritative. A leftover from a previous
  // version is not just clutter: main.ts resolves the import extensionless, so a
  // stale sibling can win and silently register an out-of-date set of bones.
  const [current, ...stale] = written

  for (const path of stale) {
    rmSync(path)
    process.stdout.write(`Removed stale ${path} left by an earlier CLI version.\n`)
  }

  const source = readFileSync(current, 'utf8')

  // Every boneyard import must come from 'boneyard-js/vue', including
  // `registerBones` -- which the CLI emits from the bare 'boneyard-js' entry.
  //
  // That bare specifier is not cosmetic. Vite pre-bundles it to
  // .vite/deps/boneyard-js.js, while the Vue adapter is the raw
  // dist/Skeleton.vue, which reads the registry through its own relative
  // ./registry.js import. Those are two module instances with two separate
  // registries: bones get registered in one and looked up in the other, so
  // every <Skeleton> silently finds no bones and renders nothing.
  // dist/Skeleton.vue re-exports `registerBones` precisely so both sides can
  // share one instance.
  const patched = source
    .replace(/^"use client"\s*\n/, '')
    .replace(/from ['"]boneyard-js\/react['"]/g, "from 'boneyard-js/vue'")
    .replace(/from ['"]boneyard-js['"]/g, "from 'boneyard-js/vue'")

  if (patched === source) {
    process.stdout.write(`${current} already imports everything from the Vue adapter.\n`)
    return
  }

  writeFileSync(current, patched)
  process.stdout.write(`Pointed ${current} at the Vue adapter (single registry instance).\n`)
}

const targetUrls = explicitUrls() ?? routeUrls()

process.stdout.write(`Capturing ${targetUrls.length} URL(s) from ${baseUrl}:\n`)
for (const url of targetUrls) {
  process.stdout.write(`  ${url}\n`)
}

const skipped = routeMetadata.length - enabledRoutes().length
if (!explicitUrls() && skipped > 0) {
  process.stdout.write(`(${skipped} route(s) skipped: feature flag off, they redirect to Home)\n`)
}

const cliResult = spawnSync(
  process.execPath,
  [cliPath, 'build', ...targetUrls, '--out', outputDir],
  { stdio: 'inherit', env: process.env },
)

if (cliResult.status !== 0) {
  process.exit(cliResult.status || 1)
}

normalizeRegistry()
