import type { Post } from '../types'
import { parseFrontmatter } from './frontmatter'

// Load every markdown file under content/posts at build time as a raw string.
// Vite inlines these, so there is no runtime fetch and no CMS to operate.
const rawPosts = import.meta.glob('../content/posts/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

const DATE_PREFIX_RE = /^\d{4}-\d{2}-\d{2}-/

function slugFromPath(path: string): string {
  const file = path.split('/').pop() ?? path
  return file.replace(/\.md$/, '').replace(DATE_PREFIX_RE, '')
}

export const posts: Post[] = Object.entries(rawPosts)
  .map(([path, raw]) => {
    const { attributes, body } = parseFrontmatter(raw)
    const slug = slugFromPath(path)
    return {
      slug,
      title: typeof attributes.title === 'string' ? attributes.title : slug,
      date: typeof attributes.date === 'string' ? attributes.date : '',
      description:
        typeof attributes.description === 'string'
          ? attributes.description
          : undefined,
      tags: Array.isArray(attributes.tags) ? attributes.tags : [],
      draft: attributes.draft === true,
      body,
    }
  })
  // Drafts are visible while developing but excluded from production builds.
  .filter((post) => import.meta.env.DEV || !post.draft)
  .sort((a, b) => b.date.localeCompare(a.date))

export function getPost(slug: string): Post | undefined {
  return posts.find((post) => post.slug === slug)
}
