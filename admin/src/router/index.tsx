import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { BlogGalleryPage } from '@/views/BlogGallery'
import { CvBuilderPage } from '@/views/CvBuilder'
import { CvOverviewPage } from '@/views/CvOverview'
import { BlogOverviewPage } from '@/views/BlogOverview'
import { BlogPagesPage } from '@/views/BlogPages'
import { BlogPostsPage } from '@/views/BlogPosts'
import { MediaLibraryPage } from '@/views/MediaLibrary'
import { MetadataPage } from '@/views/Metadata'
import { CredentialsPage } from '@/views/Credentials'
import { HyperlinkMetadataPage } from '@/views/HyperlinkMetadata'
import { NotFoundPage } from '@/views/NotFound'
import { PortfolioOverviewPage } from '@/views/PortfolioOverview'
import { PortfolioContentPage } from '@/views/PortfolioContent'
import { PageQuotesPage } from '@/views/PageQuotes'
import { MentoringProjectsPage } from '@/views/MentoringProjects'
import { PostEditorPage } from '@/views/PostEditor'
import { PublishingPage } from '@/views/Publishing'
import { SettingsPage } from '@/views/Settings'
import { StoragePage } from '@/views/Storage'

export const router = createBrowserRouter([
  {
    element: <AdminLayout />,
    children: [
      { path: '/', element: <PortfolioOverviewPage /> },
      // Career Unlocks is an ordinary collection now; the old address still lands on it.
      { path: '/portfolio/career-unlocks', element: <Navigate to="/portfolio/pages/gallery" replace /> },
      // A single-section page is addressed without its section; see portfolioAdminPath.
      { path: '/portfolio/pages/:pageId', element: <PortfolioContentPage /> },
      { path: '/portfolio/pages/:pageId/:sectionId', element: <PortfolioContentPage /> },
      { path: '/portfolio/pages/quotes', element: <PageQuotesPage /> },
      { path: '/portfolio/pages/teaching/mentoring/:cohortId/projects', element: <MentoringProjectsPage /> },
      { path: '/portfolio/media', element: <MediaLibraryPage /> },
      { path: '/portfolio/metadata', element: <MetadataPage /> },
      { path: '/portfolio/credentials', element: <CredentialsPage /> },
      { path: '/workspace/hyperlinks', element: <HyperlinkMetadataPage /> },
      { path: '/blog', element: <BlogOverviewPage /> },
      { path: '/blog/posts', element: <BlogPostsPage /> },
      { path: '/blog/posts/new', element: <PostEditorPage /> },
      { path: '/blog/gallery', element: <BlogGalleryPage /> },
      { path: '/blog/pages', element: <BlogPagesPage /> },
      { path: '/blog/pages/:pageId', element: <PortfolioContentPage /> },
      { path: '/blog/pages/:pageId/:sectionId', element: <PortfolioContentPage /> },
      { path: '/cv', element: <CvOverviewPage /> },
      { path: '/cv/builder', element: <CvBuilderPage /> },
      { path: '/cv/builder/:presetId', element: <CvBuilderPage /> },
      { path: '/workspace/publishing', element: <PublishingPage /> },
      { path: '/workspace/storage', element: <StoragePage /> },
      { path: '/workspace/settings', element: <SettingsPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
