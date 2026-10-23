import { useMemo } from 'react'
import { posts } from '../../lib/posts'
import { usePageTitle } from '../../lib/usePageTitle'
import { AllPostsIndex } from '../../components/AllPostsIndex'
import { SectionDivider } from '../../components/SectionDivider'
import { isFeatureEnabled } from '../../config/featureFlags'
import { EMPTY_TEXT_CLASS, RAIL_CONTENT_CLASS, RAIL_GRID_CLASS } from '../../lib/ui'
import { HomeHero } from './components/HomeHero'
import { HomeLatest, OlderPostsHeading } from './components/HomeLatest'
import { latestItems } from './components/latestItems'
import { TaggedPostList } from './components/TaggedPostList'
import { RecommendedTeaser } from './components/RecommendedTeaser'

export function BlogsPage() {
  // null → the base "Samyabrata Roy · Blog" title for the home page.
  usePageTitle(null)

  // With the "What's new" panel on, the newest post is featured there and the
  // list below picks up from the second post. The index rail still lists all.
  const showLatest = isFeatureEnabled('showHomeLatest')
  const featured = showLatest ? posts[0] : undefined
  const extras = showLatest ? latestItems() : []
  const listed = useMemo(() => (featured ? posts.slice(1) : posts), [featured])

  return (
    <>
      <HomeHero
        aside={
          featured || extras.length > 0 ? (
            <HomeLatest post={featured} items={extras} />
          ) : undefined
        }
      />

      {/* Skipped only when the one and only post is already featured above. */}
      {(posts.length === 0 || listed.length > 0) && (
        <>
          <SectionDivider className="mb-10" />

          {posts.length === 0 ? (
            <p className={EMPTY_TEXT_CLASS}>No posts yet — check back soon.</p>
          ) : (
            <div className={RAIL_GRID_CLASS}>
              <AllPostsIndex />

              <div className={RAIL_CONTENT_CLASS}>
                <TaggedPostList
                  posts={listed}
                  filterable={isFeatureEnabled('showPostTagFilter')}
                  renderHeading={
                    featured
                      ? (filter) => (
                          <OlderPostsHeading featured={featured} filter={filter} />
                        )
                      : undefined
                  }
                />
              </div>
            </div>
          )}
        </>
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
