import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import yaml from '@modyfi/vite-plugin-yaml'
import ViteSitemap from 'vite-plugin-sitemap'
import { fileURLToPath, URL } from 'url'
import { isFeatureEnabled } from './src/config/featureFlags'

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

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), yaml(), ViteSitemap({
      hostname: 'https://samyabrata.codeium.xyz',
      dynamicRoutes: publicRoutes,
      exclude: ['/googlef62b25008a7b041d', '/googlef62b25008a7b041d.html'],
      generateRobotsTxt: false,
    })
  ],
  base: '/',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
