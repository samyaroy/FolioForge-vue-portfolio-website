import { useMemo, useState } from 'react'
import { BLOGS_SECTION } from '../../../content/sections'
import type { PostMeta } from '../../../types'
import { PostCard } from './PostCard'
import { PostTagFilter } from './PostTagFilter'
import { postsWithAnyTag, tagCounts } from './postTags'

type TaggedPostListProps = {
  posts: PostMeta[]
  /** Show the tag filter. Off renders the plain card list. */
  filterable: boolean
}

/**
 * The blog home's post cards, optionally under a toolbar like the portfolio's
 * Career Unlocks page: a rule, the post count and the tag filter. Picked tags
 * are local state, so the rest of the page neither changes nor re-renders.
 */
export function TaggedPostList({ posts, filterable }: TaggedPostListProps) {
  const [selected, setSelected] = useState<string[]>([])
  const tags = useMemo(
    () => (filterable ? tagCounts(posts).map(({ tag }) => tag) : []),
    [filterable, posts],
  )
  const shown = postsWithAnyTag(posts, selected)
  const countLabel =
    posts.length === 1 ? BLOGS_SECTION.postCountOne : BLOGS_SECTION.postCountMany

  return (
    <>
      {tags.length > 0 && (
        <div className="relative z-30 mx-auto mb-5 flex w-[87%] items-center">
          <div className="flex-1">
            <hr className="border-slate-300" />
          </div>
          <div className="flex shrink-0 items-center justify-end gap-3 pl-4">
            <span className="text-xs font-semibold tracking-[0.16em] whitespace-nowrap text-slate-400 uppercase">
              {posts.length} {countLabel}
            </span>
            <PostTagFilter options={tags} selected={selected} onChange={setSelected} />
          </div>
        </div>
      )}

      {/* Exactly 87% of the pane — no max-width cap. */}
      <div className="mx-auto grid w-[87%] grid-cols-1 gap-6">
        {shown.map((post) => (
          <PostCard key={post.slug} post={post} />
        ))}
      </div>
    </>
  )
}
