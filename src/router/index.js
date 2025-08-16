import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/projects-publications',
    name: 'ProjectsPublications',
    component: () => import('@/views/ProjectsPublications.vue')
  },
  {
    path: '/cocurricular',
    name: 'Cocurricular',
    component: () => import('@/views/Cocurricular.vue')
  },
  {
    path: '/workshops',
    name: 'Workshops',
    component: () => import('@/views/Workshops.vue')
  },
  {
    path: '/contact',
    name: 'Contact',
    component: () => import('@/views/Contact.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
