import {
  BookOpenText,
  Cloud,
  FilePenLine,
  Files,
  GalleryHorizontalEnd,
  Image,
  LayoutDashboard,
  Rocket,
  Settings,
  Tags,
} from 'lucide-react'
import { portfolioAdminPath, portfolioPages } from '@/config/portfolio'
import type { NavigationGroup } from '@/types/navigation'

export const navigation: NavigationGroup[] = [
  {
    label: 'Portfolio',
    items: [
      { label: 'Overview', path: '/', icon: LayoutDashboard },
      ...portfolioPages.map(page => ({
        label: page.title,
        path: portfolioAdminPath(page),
        icon: page.icon,
        children: page.sections.map(section => ({
          label: section.title,
          path: portfolioAdminPath(page, section),
        })),
      })),
    ],
  },
  {
    label: 'Editorial',
    items: [
      { label: 'Blog Posts', path: '/blog/posts', icon: BookOpenText, count: 2 },
      { label: 'New Post', path: '/blog/posts/new', icon: FilePenLine },
      { label: 'Blog Gallery', path: '/blog/gallery', icon: GalleryHorizontalEnd },
      { label: 'Blog Pages', path: '/blog/pages', icon: Files },
    ],
  },
  {
    label: 'Workspace',
    items: [
      { label: 'Media Library', path: '/portfolio/media', icon: Image },
      { label: 'Taxonomy & Links', path: '/portfolio/metadata', icon: Tags },
      { label: 'Publishing', path: '/workspace/publishing', icon: Rocket },
      { label: 'Media Storage', path: '/workspace/storage', icon: Cloud },
      { label: 'Settings', path: '/workspace/settings', icon: Settings },
    ],
  },
]

export const searchableNavigationItems = navigation.flatMap(group => group.items.flatMap(item => [
  item,
  ...(item.children ?? []).map(child => ({ ...child, icon: item.icon })),
]))
