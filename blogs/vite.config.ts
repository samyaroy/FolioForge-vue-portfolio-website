import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Blog app for https://blogs.samyabrata.codeium.xyz
// Served at the subdomain root, so base stays '/'.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/',
})
