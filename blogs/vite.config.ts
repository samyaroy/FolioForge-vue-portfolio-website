import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import yaml from '@modyfi/vite-plugin-yaml'

// Blog app for https://blogs.samyabrata.codeium.xyz
// Served at the subdomain root, so base stays '/'.
export default defineConfig({
  plugins: [react(), tailwindcss(), yaml()],
  base: '/',
})
