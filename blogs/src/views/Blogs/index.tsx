import { posts } from '../../lib/posts'
import { usePageTitle } from '../../lib/usePageTitle'
import { AllPostsIndex } from '../../components/AllPostsIndex'
import { EMPTY_TEXT_CLASS, RAIL_CONTENT_CLASS, RAIL_GRID_CLASS } from '../../lib/ui'
import { HomeHero } from './components/HomeHero'
import { PostCard } from './components/PostCard'

export function BlogsPage() {
  // null → the base "Samyabrata Roy · Blog" title for the home page.
  usePageTitle(null)

  return (
    <>
      <HomeHero />

      <div
        className="relative ml-[50%] mb-10 h-px w-[90vw] -translate-x-1/2 bg-border"
        aria-hidden="true"
      >
        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-page px-[0.85rem] text-2xl leading-none text-muted">
          ✳
        </span>
      </div>

      {posts.length === 0 ? (
        <p className={EMPTY_TEXT_CLASS}>No posts yet — check back soon.</p>
      ) : (
        <div className={RAIL_GRID_CLASS}>
          <AllPostsIndex />

          <div className={RAIL_CONTENT_CLASS}>
            {/* Exactly 87% of the pane — no max-width cap. */}
            <div className="mx-auto grid w-[87%] grid-cols-1 gap-6">
              {posts.map((post) => (
                <PostCard key={post.slug} post={post} />
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
