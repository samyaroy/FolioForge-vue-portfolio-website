import { lazy, Suspense } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import { Layout } from './components/Layout'
import { BlogsPage } from './views/Blogs'
import { PostPage } from './views/Post'
import { NotFoundPage } from './views/NotFound'
import { ReadingsPage } from './views/Readings'
import { HobbiesPage } from './views/Hobbies'
import { GalleryPage } from './views/Gallery'
import { isFeatureEnabled } from './config/featureFlags'

// Travel pulls in ECharts (~1 MB); load it only when the route is visited.
const TravelPage = lazy(() =>
  import('./views/Travel').then((m) => ({ default: m.TravelPage })),
)

const optionalRoutes = [
  isFeatureEnabled('showReadings')
    ? {
        path: '/readings',
        element: <ReadingsPage />,
      }
    : null,
  isFeatureEnabled('showTravel')
    ? {
        path: '/travel',
        element: (
          <Suspense fallback={<p className="empty">Loading map…</p>}>
            <TravelPage />
          </Suspense>
        ),
      }
    : null,
  isFeatureEnabled('showHobbies')
    ? {
        path: '/hobbies',
        element: <HobbiesPage />,
      }
    : null,
  isFeatureEnabled('showGallery')
    ? {
        path: '/gallery',
        element: <GalleryPage />,
      }
    : null,
].filter((route) => route !== null)

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      ...(isFeatureEnabled('showBlogHome')
        ? [{ path: '/', element: <BlogsPage /> }]
        : []),
      ...optionalRoutes,
      { path: '/posts/:slug', element: <PostPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
