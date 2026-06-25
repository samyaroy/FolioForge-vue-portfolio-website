import { createBrowserRouter } from 'react-router-dom'
import { Layout } from './components/Layout'
import { HomePage } from './views/Home'
import { PostPage } from './views/Post'
import { NotFoundPage } from './views/NotFound'
import { SectionPage } from './views/Section'
import { isFeatureEnabled } from './config/featureFlags'

const optionalRoutes = [
  isFeatureEnabled('showReadings')
    ? {
        path: '/readings',
        element: (
          <SectionPage
            title="Readings"
            description="Notes from books, papers, essays, and the ideas worth returning to."
            tag="readings"
          />
        ),
      }
    : null,
  isFeatureEnabled('showTravel')
    ? {
        path: '/travel',
        element: (
          <SectionPage
            title="Travel"
            description="Places, routes, small observations, and memories collected along the way."
            tag="travel"
          />
        ),
      }
    : null,
  isFeatureEnabled('showHobbies')
    ? {
        path: '/hobbies',
        element: (
          <SectionPage
            title="Hobbies"
            description="Personal notes from the things I do for curiosity, craft, and quiet joy."
            tag="hobbies"
          />
        ),
      }
    : null,
  isFeatureEnabled('showGallery')
    ? {
        path: '/gallery',
        element: (
          <SectionPage
            title="Gallery"
            description="A visual notebook for moments, places, projects, and fragments."
            tag="gallery"
          />
        ),
      }
    : null,
].filter((route) => route !== null)

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      ...(isFeatureEnabled('showBlogHome')
        ? [{ path: '/', element: <HomePage /> }]
        : []),
      ...optionalRoutes,
      { path: '/posts/:slug', element: <PostPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
