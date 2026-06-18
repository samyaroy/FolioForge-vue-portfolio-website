import { createBrowserRouter } from 'react-router-dom'
import { Layout } from './components/Layout'
import { HomePage } from './pages/HomePage'
import { PostPage } from './pages/PostPage'
import { NotFoundPage } from './pages/NotFoundPage'

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/posts/:slug', element: <PostPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
