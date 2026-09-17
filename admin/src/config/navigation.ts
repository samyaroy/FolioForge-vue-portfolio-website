import {
  BookOpenText,
  Cloud,
  Image,
  LayoutDashboard,
  Rocket,
  Settings,
  Tags,
  ShieldCheck,
  Link2,
} from 'lucide-react'
import { blogPages, portfolioAdminPath, portfolioPages } from '@/config/portfolio'
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
      {
        label: 'Blog',
        path: '/blog/posts',
        icon: BookOpenText,
        count: 2,
        children: [
          { label: 'Posts', path: '/blog/posts' },
          { label: 'New Post', path: '/blog/posts/new' },
          { label: 'Gallery', path: '/blog/gallery' },
          { label: 'Pages', path: '/blog/pages' },
          ...blogPages.flatMap(page => page.sections.map(section => ({
            label: section.title,
            path: portfolioAdminPath(page, section),
          }))),
        ],
      },
    ],
  },
  {
    label: 'Workspace',
    items: [
      { label: 'Media Library', path: '/portfolio/media', icon: Image },
      { label: 'Taxonomy & Links', path: '/portfolio/metadata', icon: Tags },
      { label: 'Credentials', path: '/portfolio/credentials', icon: ShieldCheck },
      { label: 'Hyperlink Metadata', path: '/workspace/hyperlinks', icon: Link2 },
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
