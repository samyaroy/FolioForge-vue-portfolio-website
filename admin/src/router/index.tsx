import { createBrowserRouter } from 'react-router-dom'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { BlogGalleryPage } from '@/views/BlogGallery'
import { BlogPagesPage } from '@/views/BlogPages'
import { BlogPostsPage } from '@/views/BlogPosts'
import { CareerUnlocksPage } from '@/views/CareerUnlocks'
import { MediaLibraryPage } from '@/views/MediaLibrary'
import { MetadataPage } from '@/views/Metadata'
import { CredentialsPage } from '@/views/Credentials'
import { HyperlinkMetadataPage } from '@/views/HyperlinkMetadata'
import { NotFoundPage } from '@/views/NotFound'
import { PortfolioOverviewPage } from '@/views/PortfolioOverview'
import { PortfolioContentPage } from '@/views/PortfolioContent'
import { PostEditorPage } from '@/views/PostEditor'
import { PublishingPage } from '@/views/Publishing'
import { SettingsPage } from '@/views/Settings'
import { StoragePage } from '@/views/Storage'

export const router = createBrowserRouter([
  {
    element: <AdminLayout />,
    children: [
      { path: '/', element: <PortfolioOverviewPage /> },
      { path: '/portfolio/career-unlocks', element: <CareerUnlocksPage /> },
      { path: '/portfolio/pages/gallery/career-unlocks', element: <CareerUnlocksPage /> },
      { path: '/portfolio/pages/:pageId/:sectionId', element: <PortfolioContentPage /> },
      { path: '/portfolio/media', element: <MediaLibraryPage /> },
      { path: '/portfolio/metadata', element: <MetadataPage /> },
      { path: '/portfolio/credentials', element: <CredentialsPage /> },
      { path: '/workspace/hyperlinks', element: <HyperlinkMetadataPage /> },
      { path: '/blog/posts', element: <BlogPostsPage /> },
      { path: '/blog/posts/new', element: <PostEditorPage /> },
      { path: '/blog/gallery', element: <BlogGalleryPage /> },
      { path: '/blog/pages', element: <BlogPagesPage /> },
      { path: '/workspace/publishing', element: <PublishingPage /> },
      { path: '/workspace/storage', element: <StoragePage /> },
      { path: '/workspace/settings', element: <SettingsPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
