import { useMemo, useState, type ReactNode } from 'react'
import type { PostMeta } from '../../../types'
import { PostCard } from './PostCard'
import { PostTagFilter } from './PostTagFilter'
import { postsWithAnyTag, tagCounts } from './postTags'

type TaggedPostListProps = {
  posts: PostMeta[]
  /** Show the tag filter. Off renders the plain card list. */
  filterable: boolean
  /** Heading over the list, given the filter button to place beside it.
      Without one, the filter sits alone at the list's top right. */
  renderHeading?: (filter: ReactNode) => ReactNode
}

/**
 * The blog home's post cards with an optional tag filter (the portfolio's
 * Career Unlocks filter button). Picked tags are local state, so the rest of
 * the page neither changes nor re-renders when they change.
 */
export function TaggedPostList({ posts, filterable, renderHeading }: TaggedPostListProps) {
  const [selected, setSelected] = useState<string[]>([])
  const tags = useMemo(
    () => (filterable ? tagCounts(posts).map(({ tag }) => tag) : []),
    [filterable, posts],
  )
  const shown = postsWithAnyTag(posts, selected)

  const filter =
    tags.length > 0 ? (
      <PostTagFilter
        options={tags}
        selected={selected}
        onChange={setSelected}
        align={renderHeading ? 'left' : 'right'}
      />
    ) : null

  return (
    <>
      {renderHeading
        ? renderHeading(filter)
        : filter && (
            <div className="relative z-30 mx-auto mb-5 flex w-[87%] justify-end">
              {filter}
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
