import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '@/views/Home/index.vue'
import ProjectPublications from '@/views/ProjectsPublications/index.vue'
import OngoingProjects from '@/views/OngoingProjects/index.vue'
import Cocurricular from '@/views/Cocurricular/index.vue'
import Affilications from '@/views/Affilications/index.vue'

import WorkshopsAttended from '@/views/WorkshopsAttended/index.vue'
import InternshipCertification from '@/views/InternshipCertification/index.vue'
import Teachings from '@/views/Teachings/index.vue'
import ProfessionalAcitivity from '@/views/ProfessionalAcitivity/index.vue'
import Contact from '@/views/Contact.vue'
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
      flagPath: 'showProjectsPublications',
      flagMode: 'any',
    },
  },
  {
    path: '/affiliation-memberships',
    name: 'Affilications',
    component: Affilications,
    meta: {
      flagPath: 'showAffiliations',
      flagMode: 'any',
    },
  },
  {
    path: '/ongoing-projects',
    name: 'OngoingProjects',
    component: OngoingProjects,
    meta: {
      flagPath: 'showOngoingProjects',
    },
  },
  {
    path: '/cocurricular',
    name: 'Cocurricular',
    component: Cocurricular,
    meta: {
      flagPath: 'showCocurricular',
      flagMode: 'any',
    },
  },
  {
    path: '/workshops-bootcamps-attended',
    name: 'Workshops',
    component: WorkshopsAttended,
    meta: {
      flagPath: 'showWorkshopsAttended',
      flagMode: 'any',
    },
  },
  {
    path: '/teachings',
    name: 'Teachings',
    component: Teachings,
    meta: {
      flagPath: 'showTeachings',
      flagMode: 'any',
    },
  },
  {
    path: '/internships-certifications',
    name: 'InternshipCertification',
    component: InternshipCertification,
    meta: {
      flagPath: 'showInternshipCertifications',
      flagMode: 'any',
    },
  },
  {
    path: '/professional-activity',
    name: 'ProfessionalAcitivity',
    component: ProfessionalAcitivity,
    meta: {
      flagPath: 'showProfessionalActivity',
      flagMode: 'any',
    },
  },
  {
    path: '/contact',
    name: 'Contact',
    component: Contact
  }
]

const router = createRouter({
  history: createWebHashHistory(),
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

export default router
