import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import yaml from '@modyfi/vite-plugin-yaml' 
import ViteSitemap from 'vite-plugin-sitemap'


// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), yaml(), ViteSitemap({
      hostname: 'https://samyabrata.codeium.xyz',
      routes: [
        '#/',
        '#/projects-publications',
        '#/cocurricular',
        '#/contact',
        '#/projects-publications?tab=publications',
        '#/ongoing-projects',
        '#/internships-certifications'
      ],
    })
  ],
  base: '/',
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
})

