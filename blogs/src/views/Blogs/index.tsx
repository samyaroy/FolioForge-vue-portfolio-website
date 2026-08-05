import { Link } from 'react-router-dom'
import { posts } from '../../lib/posts'
import { usePageTitle } from '../../lib/usePageTitle'
import { BLOGS_SECTION } from '../../content/sections'
import { EMPTY_TEXT_CLASS } from '../../lib/ui'
import { HomeHero } from './components/HomeHero'
import { PostCard } from './components/PostCard'

// Posts grouped by year for the sidebar index, newest year first (posts are
// already sorted newest-first, so insertion order is the display order).
const POSTS_BY_YEAR = (() => {
  const groups = new Map<string, typeof posts>()
  for (const post of posts) {
    const year = post.date ? post.date.slice(0, 4) : 'Earlier'
    const group = groups.get(year) ?? []
    group.push(post)
    groups.set(year, group)
  }
  return [...groups.entries()]
})()

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
        // Break out of the layout's default column to 90% of the viewport,
        // like the travel pages do.
        <div className="ml-[50%] grid w-[90vw] -translate-x-1/2 grid-cols-1 gap-10 md:grid-cols-[18%_minmax(0,1fr)] md:items-stretch md:gap-0">
          <aside className="md:pr-6" aria-label={BLOGS_SECTION.allPostsTitle}>
            {/* The cell stretches to match the post list (so the divider runs
                full height); the index itself sticks while scrolling. */}
            {/* Rhythm mirrors the Resources page's External Links pane:
                text-lg heading, text-sm bold group titles, text-sm links. */}
            <div className="md:sticky md:top-24">
              <h2 className="text-lg font-bold text-ink">
                {BLOGS_SECTION.allPostsTitle}
              </h2>
              {POSTS_BY_YEAR.map(([year, yearPosts]) => (
                <div key={year} className="mt-5">
                  <h3 className="text-sm leading-snug font-bold text-ink">
                    {year}
                  </h3>
                  <ul className="mt-2.5 list-disc space-y-2.5 pl-4 marker:text-muted">
                    {yearPosts.map((post) => (
                      <li key={post.slug}>
                        <Link
                          className="text-sm leading-snug font-medium text-ink transition-colors duration-200 hover:text-primary"
                          to={`/posts/${post.slug}`}
                        >
                          {post.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </aside>

          <div className="md:border-l md:border-border md:pl-6">
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
