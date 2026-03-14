import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import yaml from '@modyfi/vite-plugin-yaml' 
import ViteSitemap from 'vite-plugin-sitemap'
import { fileURLToPath, URL } from 'url'

const publicRoutes = [
  '/projects-publications',
  '/affiliation-memberships',
  '/ongoing-projects',
  '/cocurricular',
  '/workshops-bootcamps-attended',
  '/teachings',
  '/internships-certifications',
  '/professional-activity',
  '/contact',
]

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
