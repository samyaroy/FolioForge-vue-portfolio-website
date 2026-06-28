import { PostCard } from '../../views/Blogs/components/PostCard'
import { posts } from '../../lib/posts'

type SectionPageProps = {
  title: string
  description: string
  tag?: string
}

function matchesTag(postTags: string[], tag: string): boolean {
  const normalizedTag = tag.toLowerCase()
  return postTags.some((postTag) => postTag.toLowerCase() === normalizedTag)
}

export function SectionPage({ title, description, tag }: SectionPageProps) {
  const sectionPosts = tag
    ? posts.filter((post) => matchesTag(post.tags, tag))
    : []

  return (
    <>
      <section className="intro">
        <h1>{title}</h1>
        <p>{description}</p>
      </section>

      {sectionPosts.length === 0 ? (
        <p className="empty">No posts here yet.</p>
      ) : (
        <div className="post-list">
          {sectionPosts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      )}
    </>
  )
}
