type TaggedItem = { tags?: string[] }

// Tag helpers for the blog home's tag filter. Tags compare case-insensitively,
// so "React" and "react" in different posts count as one tag.

export type TagCount = { tag: string; count: number }

const normalize = (tag: string) => tag.trim().toLowerCase()

/** Each tag used by `posts`, with how many posts carry it; most used first,
    then alphabetical. */
export function tagCounts(posts: TaggedItem[]): TagCount[] {
  const counts = new Map<string, number>()
  for (const post of posts) {
    for (const tag of new Set((post.tags ?? []).map(normalize).filter(Boolean))) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1)
    }
  }
  return [...counts]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag))
}

/** Posts carrying any of `tags`, or every post when none are picked. */
export function postsWithAnyTag<T extends TaggedItem>(posts: T[], tags: string[]): T[] {
  if (tags.length === 0) return posts
  return posts.filter((post) => post.tags?.some((t) => tags.includes(normalize(t))))
}
