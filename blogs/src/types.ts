export interface PostMeta {
  /** URL slug, derived from the markdown filename. */
  slug: string
  title: string
  /** ISO date string, e.g. "2026-06-18". */
  date: string
  description?: string
  tags: string[]
  draft: boolean
}

export interface Post extends PostMeta {
  /** Raw markdown body (frontmatter stripped). */
  body: string
}
