import { createRouter, createWebHistory } from 'vue-router'
import type { RouteComponent, RouteRecordRaw } from 'vue-router'
import { isFeatureEnabled } from '@/config/featureFlags'
import { areBetaRoutesEnabled } from '@/config/siteEnvironment'
import { BASE_TITLE, pageTitle, routeMetadata } from './routes'

// Path, title, description, and feature flag for every page live in
// ./routes.ts, which the build also reads to emit the sitemap and to prerender
// one HTML file per route. Only the component binding is resolved here, since
// vite.config.ts cannot import .vue files.
declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    description?: string
    flagPath?: string | string[]
    flagMode?: 'all' | 'any'
    betaOnly?: boolean
  }
}

// Each view is a dynamic import, so Rollup emits it as its own chunk and a
// visitor downloads only the route they actually opened. Static imports here
// would pull all fourteen views into the entry bundle.
//
// This does not affect the prerender: scripts/seo-build.ts stamps <head> onto
// the built shell and never renders a component, so route chunking is invisible
// to it.
// vue-router accepts a loader returning the module record; the .vue shim in
// src/vite-env.d.ts types that default export as a component.
const views: Record<string, () => Promise<{ default: RouteComponent }>> = {
  Home: () => import('@/views/Home/index.vue'),
  ProjectsPublications: () => import('@/views/ProjectsPublications/index.vue'),
  Affilications: () => import('@/views/Affilications/index.vue'),
  OngoingProjects: () => import('@/views/OngoingProjects/index.vue'),
  Cocurricular: () => import('@/views/Cocurricular/index.vue'),
  Workshops: () => import('@/views/WorkshopsAttended/index.vue'),
  Teachings: () => import('@/views/Teachings/index.vue'),
  InternshipCertification: () => import('@/views/InternshipCertification/index.vue'),
  ProfessionalAcitivity: () => import('@/views/ProfessionalAcitivity/index.vue'),
  Gallery: () => import('@/views/Gallery/index.vue'),
  Contact: () => import('@/views/Contact.vue'),
  PrivacyPolicy: () => import('@/views/PrivacyPolicy.vue'),
  Resources: () => import('@/views/Resources/index.vue'),
  Facts: () => import('@/views/Facts/index.vue'),
  // Vite removes this import from builds that cannot expose beta routes.
  ...(import.meta.env.VITE_ENABLE_BETA_ROUTES ? {
    CredentialsDashboard: () => import('@/views/CredentialsDashboard/index.vue'),
  } : {}),
}

const routes: RouteRecordRaw[] = [
  ...routeMetadata.map((route): RouteRecordRaw => ({
    path: route.path,
    name: route.name,
    component: views[route.name],
    meta: {
      ...(route.title ? { title: route.title } : {}),
      description: route.description,
      ...(route.flagPath ? { flagPath: route.flagPath } : {}),
      ...(route.flagMode ? { flagMode: route.flagMode } : {}),
      ...(route.betaOnly ? { betaOnly: route.betaOnly } : {}),
    },
  })),
  // Catch-all so an unknown URL renders the 404 page rather than an empty
  // <router-view>. The host serves 404.html (a noindex copy of the shell) for
  // these, so the status code matches what the visitor sees.
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue'),
    meta: { title: 'Page Not Found' },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    if (to.hash) {
      return { el: to.hash, behavior: 'smooth' }
    }
    return { top: 0 }
  }
})

router.beforeEach((to) => {
  if (to.meta?.betaOnly && !areBetaRoutesEnabled()) return { name: 'Home' }

  const flagPath = to.meta?.flagPath
  if (!flagPath) return true

  const mode = to.meta?.flagMode === 'any' ? 'any' : 'all'
  if (isFeatureEnabled(flagPath, { mode })) return true

  if (to.name === 'Home') return true
  return { name: 'Home' }
})

// The prerendered HTML for each route already carries the right title and
// description; this keeps them correct across client-side navigation.
router.afterEach((to) => {
  document.title = to.meta?.title ? pageTitle(to.meta.title) : BASE_TITLE

  const description = document.querySelector('meta[name="description"]')
  if (description && to.meta?.description) {
    description.setAttribute('content', to.meta.description)
  }

  const canonical = document.querySelector('link[rel="canonical"]')
  if (canonical) {
    canonical.setAttribute('href', new URL(to.path, location.origin).href)
  }
})

export default router
