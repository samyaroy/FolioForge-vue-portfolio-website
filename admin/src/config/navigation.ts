import {
  BookOpenText,
  Cloud,
  Files,
  GalleryHorizontalEnd,
  Image,
  LayoutDashboard,
  Rocket,
  Settings,
  Tags,
  ShieldCheck,
  Link2,
} from 'lucide-react'
import { blogPages, portfolioAdminPath, portfolioPages, workspacePages } from '@/config/portfolio'
import type { PortfolioPage } from '@/config/portfolio'
import type { NavigationGroup } from '@/types/navigation'

// A page with a single section is its own destination, so it lists no child.
function sectionNavItem(page: PortfolioPage) {
  return {
    label: page.title,
    path: portfolioAdminPath(page),
    icon: page.icon,
    ...(page.sections.length > 1
      ? { children: page.sections.map(section => ({ label: section.title, path: portfolioAdminPath(page, section) })) }
      : {}),
  }
}

export const navigation: NavigationGroup[] = [
  {
    label: 'Portfolio',
    items: [
      { label: 'Overview', path: '/', icon: LayoutDashboard },
      ...portfolioPages.map(sectionNavItem),
    ],
  },
  {
    label: 'Editorial',
    items: [
      { label: 'Overview', path: '/blog', icon: LayoutDashboard },
      {
        label: 'Blog Posts',
        path: '/blog/posts',
        icon: BookOpenText,
        count: 2,
        children: [
          { label: 'All posts', path: '/blog/posts' },
          { label: 'New post', path: '/blog/posts/new' },
        ],
      },
      { label: 'Blog Gallery', path: '/blog/gallery', icon: GalleryHorizontalEnd },
      { label: 'Blog Pages', path: '/blog/pages', icon: Files },
      ...blogPages.map(sectionNavItem),
    ],
  },
  {
    label: 'Workspace',
    items: [
      { label: 'Media Library', path: '/portfolio/media', icon: Image },
      { label: 'Taxonomy & Links', path: '/portfolio/metadata', icon: Tags },
      { label: 'Credentials (Beta)', path: '/portfolio/credentials', icon: ShieldCheck },
      { label: 'Hyperlink Metadata', path: '/workspace/hyperlinks', icon: Link2 },
      ...workspacePages.map(sectionNavItem),
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
