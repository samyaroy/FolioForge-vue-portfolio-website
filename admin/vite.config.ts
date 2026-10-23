import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
// The admin's own copy. Loading the root project's instead failed wherever only
// this app's dependencies are installed, as in the Cloudflare build.
import { parse } from 'yaml'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'portfolio-content-yaml',
      transform(source, id) {
        if (!id.endsWith('.yml')) return
        return { code: `export default ${JSON.stringify(parse(source))}`, map: null }
      },
    },
  ],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  server: {
    fs: { allow: [fileURLToPath(new URL('..', import.meta.url))] },
  },
  // Keep the portfolio's PostCSS configuration outside this app's build.
  css: { postcss: { plugins: [] } },
})
