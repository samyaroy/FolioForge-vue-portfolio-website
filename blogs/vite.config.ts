import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Blog app for https://blogs.samyabrata.codeium.xyz
// Served at the subdomain root, so base stays '/'.
export default defineConfig({
  plugins: [react()],
  base: '/',
})
