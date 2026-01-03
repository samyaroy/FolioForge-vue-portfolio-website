import { createRouter, createWebHistory, createWebHashHistory } from 'vue-router'
import Home from '@/views/Home/index.vue'
import ProjectPublications from '@/views/ProjectsPublications/index.vue'
import OngoingProjects from '@/views/OngoingProjects/index.vue'
import Cocurricular from '@/views/Cocurricular/index.vue'

import WorkshopsAttended from '@/views/WorkshopsAttended/index.vue'
import InternshipCertification from '@/views/InternshipCertification/index.vue'
import Teachings from '@/views/Teachings/index.vue'

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
    path: '/ongoing-projects',
    name: 'OngoingProjects',
    component: OngoingProjects
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
    path: '/teachings',
    name: 'Teachings',
    component: Teachings
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

export default router
