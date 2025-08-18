import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home/index.vue'
import ProjectPublications from '@/views/ProjectsPublications/index.vue'
import Cocurricular from '@/views/Cocurricular/index.vue'

import WorkshopsAttended from '@/views/WorkshopsAttended/index.vue'
import InternshipCertification from '@/views/InternshipCertification/index.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/projects-publications',
    name: 'ProjectsPublications',
    component: ProjectPublications
  },
  {
    path: '/cocurricular',
    name: 'Cocurricular',
    component: Cocurricular
  },
  {
    path: '/workshops-bootcamps-attended',
    name: 'Workshops',
    component: WorkshopsAttended
  },
  {
    path: '/internships-certifications',
    name: 'InternshipCertification',
    component: InternshipCertification
  },
  {
    path: '/contact',
    name: 'Contact',
    component: () => import('@/views/Contact.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // Always scroll to top when navigating
    return { top: 0 }
  }
})

export default router
