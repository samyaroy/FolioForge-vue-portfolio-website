import { createRouter, createWebHistory } from 'vue-router'
import type { Component } from 'vue'
import type { RouteRecordRaw } from 'vue-router'
import Home from '@/views/Home/index.vue'
import Gallery from '@/views/Gallery/index.vue'
import ProjectPublications from '@/views/ProjectsPublications/index.vue'
import OngoingProjects from '@/views/OngoingProjects/index.vue'
import Cocurricular from '@/views/Cocurricular/index.vue'
import Affilications from '@/views/Affilications/index.vue'

import WorkshopsAttended from '@/views/WorkshopsAttended/index.vue'
import InternshipCertification from '@/views/InternshipCertification/index.vue'
import Teachings from '@/views/Teachings/index.vue'
import ProfessionalAcitivity from '@/views/ProfessionalAcitivity/index.vue'
import Contact from '@/views/Contact.vue'
import Resources from '@/views/Resources/index.vue'
import Facts from '@/views/Facts/index.vue'
import PrivacyPolicy from '@/views/PrivacyPolicy.vue'
import NotFound from '@/views/NotFound.vue'
import { isFeatureEnabled } from '@/config/featureFlags'
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
  }
}

const views: Record<string, Component> = {
  Home,
  ProjectsPublications: ProjectPublications,
  Affilications,
  OngoingProjects,
  Cocurricular,
  Workshops: WorkshopsAttended,
  Teachings,
  InternshipCertification,
  ProfessionalAcitivity,
  Gallery,
  Contact,
  PrivacyPolicy,
  Resources,
  Facts,
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
    },
  })),
  // Catch-all so an unknown URL renders the 404 page rather than an empty
  // <router-view>. The host serves 404.html (a noindex copy of the shell) for
  // these, so the status code matches what the visitor sees.
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound,
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
