import fs from 'node:fs'
import path from 'node:path'
import { defineConfig, type Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import yaml from '@modyfi/vite-plugin-yaml'
import { parse as parseYaml } from 'yaml'
import { fileURLToPath, URL } from 'url'
import { isFeatureEnabled } from './src/config/featureFlags'
import {
  BLOG_URL,
  OG_IMAGE_PATH,
  SITE_NAME,
  SITE_URL,
  pageTitle,
  routeMetadata,
} from './src/router/routes'
import {
  absoluteUrl,
  writeSeoOutput,
  type SeoPage,
  type SeoPrerenderOptions,
} from './scripts/seo-build'

// Which deployment this build is for, declared by the host's build settings
// rather than by anything in the tree -- so it survives V1 -> main tree
// replacement, exactly like the hostname check in src/config/siteEnvironment.ts.
//
// Cloudflare: set VITE_SITE_ENV=beta on the V1 deployment's build variables.
// The main deployment can set 'stable' or leave it unset; only 'beta' changes
// what is emitted. The browser reads the same variable at runtime.
const IS_BETA_BUILD = (process.env.VITE_SITE_ENV ?? '').trim().toLowerCase() === 'beta'

// Routes whose feature flag is off redirect to Home at runtime, so they are
// neither prerendered nor listed in the sitemap.
const publicRoutes = routeMetadata.filter(
  (route) =>
    !route.flagPath ||
    isFeatureEnabled(route.flagPath, { mode: route.flagMode }),
)

interface Profile {
  profile?: { name?: string; about?: string; footer?: string }
  socials?: Record<string, string>
}

function readProfile(): Profile {
  const raw = fs.readFileSync(
    fileURLToPath(new URL('./src/content/profile_info/profile.yml', import.meta.url)),
    'utf8',
  )
  return (parseYaml(raw) ?? {}) as Profile
}

const profile = readProfile()

const PERSON_ID = `${SITE_URL}/#person`
const WEBSITE_ID = `${SITE_URL}/#website`

// The sameAs list is what ties this site, the blog, and every academic and
// social profile to one entity — it is the single strongest signal available
// for getting an author knowledge panel to resolve correctly.
const person = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  '@id': PERSON_ID,
  name: profile.profile?.name ?? SITE_NAME,
  url: `${SITE_URL}/`,
  description: profile.profile?.about,
  jobTitle: profile.profile?.footer,
  sameAs: Object.values(profile.socials ?? {}),
}

const website = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': WEBSITE_ID,
  url: `${SITE_URL}/`,
  name: SITE_NAME,
  inLanguage: 'en',
  publisher: { '@id': PERSON_ID },
}

/** Home → the profile itself; every other page → a WebPage under it. */
function jsonLdFor(route: (typeof routeMetadata)[number]): unknown[] {
  if (route.path === '/') {
    return [
      person,
      website,
      {
        '@context': 'https://schema.org',
        '@type': 'ProfilePage',
        url: `${SITE_URL}/`,
        mainEntity: { '@id': PERSON_ID },
        isPartOf: { '@id': WEBSITE_ID },
      },
    ]
  }

  const url = absoluteUrl(SITE_URL, route.path)
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      url,
      name: route.title,
      description: route.description,
      isPartOf: { '@id': WEBSITE_ID },
      about: { '@id': PERSON_ID },
      inLanguage: 'en',
    },
    // Breadcrumbs are what let Google render "Home › Projects & Publications"
    // in place of a bare URL in the result.
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
        { '@type': 'ListItem', position: 2, name: route.title, item: url },
      ],
    },
  ]
}

const pages: SeoPage[] = publicRoutes.map((route) => ({
  path: route.path,
  title: pageTitle(route.title),
  socialTitle: route.title ?? SITE_NAME,
  description: route.description,
  image: OG_IMAGE_PATH,
  imageSize: { width: 1200, height: 630 },
  imageAlt: `${SITE_NAME} — portfolio`,
  jsonLd: jsonLdFor(route),
}))

// Thin wrapper so the shared implementation never has to import Vite's types;
// see scripts/seo-build.ts.
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

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    yaml(),
    seoPrerender({
      siteName: SITE_NAME,
      siteUrl: SITE_URL,
      pages,
      sitemap: !IS_BETA_BUILD,
      // The beta site is a byte-identical copy of production on another host,
      // and the stable footer links to it, so it is both duplicate content and
      // genuinely reachable. Runtime hostname checks cannot help here: this
      // <head> is stamped at build time, when there is no hostname.
      noindex: IS_BETA_BUILD,
      // The portfolio has no dated content of its own; the feed lives on the blog.
      rssUrl: `${BLOG_URL}/rss.xml`,
      rssTitle: `${SITE_NAME} · Blog`,
      notFound: {
        path: '/404',
        title: `Page Not Found · ${SITE_NAME}`,
        description: 'This page does not exist.',
        noindex: true,
      },
    }),
  ],
  base: '/',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
