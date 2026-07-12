import fs from 'node:fs'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import yaml from '@modyfi/vite-plugin-yaml'
import ViteSitemap from 'vite-plugin-sitemap'
import { parse as parseYaml } from 'yaml'
import { fileURLToPath, URL } from 'url'
import { isFeatureEnabled } from './src/config/featureFlags'

const SITE_URL = 'https://samyabrata.codeium.xyz'

// Mirrors the route table in src/router/index.js (path + flagPath + flagMode).
// Keep the two in sync when adding a page. Routes whose feature flag is off
// redirect to Home at runtime, so they are left out of the sitemap too.
// '/' is added by the sitemap plugin automatically.
const routeFlags = [
  ['/projects-publications', 'showProjectsPublications', 'any'],
  ['/affiliation-memberships', 'showAffiliations', 'any'],
  ['/ongoing-projects', 'showOngoingProjects'],
  ['/cocurricular', 'showCocurricular', 'any'],
  ['/workshops-bootcamps-attended', 'showWorkshopsAttended', 'any'],
  ['/teachings', 'showTeachings', 'any'],
  ['/internships-certifications', 'showInternshipCertifications', 'any'],
  ['/professional-activity', 'showProfessionalActivity', 'any'],
  ['/gallery', 'showGallery'],
  ['/contact'],
  ['/privacy-policy'],
  ['/resources', 'showResources.main'],
  ['/facts', 'showFacts'],
]

const publicRoutes = routeFlags
  .filter(([, flagPath, flagMode]) => !flagPath || isFeatureEnabled(flagPath, { mode: flagMode }))
  .map(([path]) => path)

// schema.org Person built from profile.yml and injected into the page head,
// so crawlers get it from the static HTML without executing the app. The
// sameAs links let search engines tie the portfolio, blog, and social
// profiles to one entity.
function personJsonLd() {
  const raw = fs.readFileSync(
    fileURLToPath(new URL('./src/content/profile_info/profile.yml', import.meta.url)),
    'utf8',
  )
  const content = parseYaml(raw)
  const person = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: content?.profile?.name,
    url: `${SITE_URL}/`,
    description: content?.profile?.about,
    sameAs: Object.values(content?.socials ?? {}),
  }
  // "<" is escaped so the JSON can never close the inline script tag.
  return JSON.stringify(person).replace(/</g, '\\u003c')
}

function jsonLdPlugin() {
  return {
    name: 'person-json-ld',
    transformIndexHtml() {
      return [
        {
          tag: 'script',
          attrs: { type: 'application/ld+json' },
          children: personJsonLd(),
          injectTo: 'head',
        },
      ]
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), yaml(), ViteSitemap({
      hostname: SITE_URL,
      dynamicRoutes: publicRoutes,
      exclude: ['/googlef62b25008a7b041d', '/googlef62b25008a7b041d.html'],
      generateRobotsTxt: false,
    }),
    jsonLdPlugin(),
  ],
  base: '/',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
