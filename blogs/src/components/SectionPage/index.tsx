import { PostCard } from '../../views/Blogs/components/PostCard'
import { posts } from '../../lib/posts'
import { isPageDescriptionEnabled } from '../../config/featureFlags'
import {
  EMPTY_TEXT_CLASS,
  INTRO_SECTION_CLASS,
  INTRO_TEXT_CLASS,
  INTRO_TITLE_CLASS,
  POST_LIST_CLASS,
} from '../../lib/ui'

type SectionPageProps = {
  title: string
  description: string
  pageKey: string
  tag?: string
}

function matchesTag(postTags: string[], tag: string): boolean {
  const normalizedTag = tag.toLowerCase()
  return postTags.some((postTag) => postTag.toLowerCase() === normalizedTag)
}

export function SectionPage({
  title,
  description,
  pageKey,
  tag,
}: SectionPageProps) {
  const sectionPosts = tag
    ? posts.filter((post) => matchesTag(post.tags, tag))
    : []
  const showPageDescription = isPageDescriptionEnabled(pageKey)

  return (
    <>
      <section className={INTRO_SECTION_CLASS}>
        <h1 className={INTRO_TITLE_CLASS}>{title}</h1>
        {showPageDescription && <p className={INTRO_TEXT_CLASS}>{description}</p>}
      </section>

      {sectionPosts.length === 0 ? (
        <p className={EMPTY_TEXT_CLASS}>No posts here yet.</p>
      ) : (
        <div className={POST_LIST_CLASS}>
          {sectionPosts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      )}
    </>
  )
}
