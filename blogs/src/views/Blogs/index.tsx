import { posts } from '../../lib/posts'
import { BLOGS_SECTION } from '../../content/sections'
import { PostCard } from './components/PostCard'

export function BlogsPage() {
  return (
    <>
      <section className="intro">
        <h1>{BLOGS_SECTION.title}</h1>
        <p>{BLOGS_SECTION.description}</p>
      </section>

      {posts.length === 0 ? (
        <p className="empty">No posts yet — check back soon.</p>
      ) : (
        <div className="post-list">
          {posts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      )}
    </>
  )
}
