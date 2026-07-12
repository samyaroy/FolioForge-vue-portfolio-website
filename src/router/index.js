import { createRouter, createWebHistory } from 'vue-router'
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
import { isFeatureEnabled } from '@/config/featureFlags'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/projects-publications',
    name: 'ProjectsPublications',
    component: ProjectPublications,
    meta: {
      title: 'Projects & Publications',
      flagPath: 'showProjectsPublications',
      flagMode: 'any',
    },
  },
  {
    path: '/affiliation-memberships',
    name: 'Affilications',
    component: Affilications,
    meta: {
      title: 'Affiliations & Memberships',
      flagPath: 'showAffiliations',
      flagMode: 'any',
    },
  },
  {
    path: '/ongoing-projects',
    name: 'OngoingProjects',
    component: OngoingProjects,
    meta: {
      title: 'Ongoing Projects',
      flagPath: 'showOngoingProjects',
    },
  },
  {
    path: '/cocurricular',
    name: 'Cocurricular',
    component: Cocurricular,
    meta: {
      title: 'Co-curricular',
      flagPath: 'showCocurricular',
      flagMode: 'any',
    },
  },
  {
    path: '/workshops-bootcamps-attended',
    name: 'Workshops',
    component: WorkshopsAttended,
    meta: {
      title: 'Workshops & Bootcamps',
      flagPath: 'showWorkshopsAttended',
      flagMode: 'any',
    },
  },
  {
    path: '/teachings',
    name: 'Teachings',
    component: Teachings,
    meta: {
      title: 'Teaching',
      flagPath: 'showTeachings',
      flagMode: 'any',
    },
  },
  {
    path: '/internships-certifications',
    name: 'InternshipCertification',
    component: InternshipCertification,
    meta: {
      title: 'Internships & Certifications',
      flagPath: 'showInternshipCertifications',
      flagMode: 'any',
    },
  },
  {
    path: '/professional-activity',
    name: 'ProfessionalAcitivity',
    component: ProfessionalAcitivity,
    meta: {
      title: 'Professional Activity',
      flagPath: 'showProfessionalActivity',
      flagMode: 'any',
    },
  },
  {
    path: '/gallery',
    name: 'Gallery',
    component: Gallery,
    meta: {
      title: 'Gallery',
      flagPath: 'showGallery',
    },
  },
  {
    path: '/contact',
    name: 'Contact',
    component: Contact,
    meta: {
      title: 'Contact',
    },
  },
  {
    path: '/privacy-policy',
    name: 'PrivacyPolicy',
    component: PrivacyPolicy,
    meta: {
      title: 'Privacy Policy',
    },
  },
  {
    path: '/resources',
    name: 'Resources',
    component: Resources,
    meta: {
      title: 'Resources',
      flagPath: 'showResources.main',
    },
  },
  {
    path: '/facts',
    name: 'Facts',
    component: Facts,
    meta: {
      title: 'Did You Know?',
      flagPath: 'showFacts',
    },
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
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

// Keep in sync with the static <title> in index.html, which is what crawlers
// and the first paint see before the app mounts.
const BASE_TITLE = 'Samyabrata Roy - Portfolio'

router.afterEach((to) => {
  document.title = to.meta?.title ? `${to.meta.title} · Samyabrata Roy` : BASE_TITLE
})

export default router
