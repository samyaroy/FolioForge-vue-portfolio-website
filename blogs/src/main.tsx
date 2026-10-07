import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { reloadForNewBuild } from '@shared/reloadForNewBuild'
import { router } from './App'
import '@mdi/font/css/materialdesignicons.css'
import './index.css'

// Vite raises this when a lazy chunk fails to load, most often because a
// deploy replaced it after this tab opened. Navigation has already moved the
// URL to the page being loaded, so reloading lands there on the new build. If
// it cannot reload, the error reaches the route's error screen as usual.
window.addEventListener('vite:preloadError', () => {
  reloadForNewBuild()
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
