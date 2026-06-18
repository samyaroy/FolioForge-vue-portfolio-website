import { PostCard } from '../components/PostCard'
import { posts } from '../lib/posts'

export function HomePage() {
  return (
    <>
      <section className="intro">
        <h1>Writing</h1>
        <p>Notes on what I&apos;m building, learning, and thinking about.</p>
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
