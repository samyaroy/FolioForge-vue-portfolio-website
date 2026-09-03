import { posts } from '../../lib/posts'
import { usePageTitle } from '../../lib/usePageTitle'
import { AllPostsIndex } from '../../components/AllPostsIndex'
import { SectionDivider } from '../../components/SectionDivider'
import { isFeatureEnabled } from '../../config/featureFlags'
import { EMPTY_TEXT_CLASS, RAIL_CONTENT_CLASS, RAIL_GRID_CLASS } from '../../lib/ui'
import { HomeHero } from './components/HomeHero'
import { PostCard } from './components/PostCard'
import { RecommendedTeaser } from './components/RecommendedTeaser'

export function BlogsPage() {
  // null → the base "Samyabrata Roy · Blog" title for the home page.
  usePageTitle(null)

  return (
    <>
      <HomeHero />

      <SectionDivider className="mb-10" />

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

      {/* Other people's writing, behind the same ✳ break that separates the
          hero from the post list. */}
      {isFeatureEnabled('showRecommended') && (
        <>
          <SectionDivider className="mt-14 mb-12" />
          <RecommendedTeaser />
        </>
      )}
    </>
  )
}
