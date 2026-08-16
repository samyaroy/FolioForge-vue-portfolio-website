import { Link } from 'react-router-dom'
import { posts } from '../lib/posts'
import { BLOGS_SECTION } from '../content/sections'

// Posts grouped by year, newest year first (posts are already sorted
// newest-first, so insertion order is the display order).
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

type AllPostsIndexProps = {
  /** Slug of the post being read, marked as the current page in the list. */
  activeSlug?: string
  /** Extra classes for the grid cell, e.g. where it sits on small screens. */
  className?: string
}

/**
 * The year-grouped index of every post. Shared by the blog home page and the
 * post pages so the same pane sits in the left column throughout the section.
 */
export function AllPostsIndex({ activeSlug, className = '' }: AllPostsIndexProps) {
  return (
    <aside className={`md:pr-6 ${className}`} aria-label={BLOGS_SECTION.allPostsTitle}>
      {/* The cell stretches to match the column beside it (so the divider runs
          full height); the index itself sticks while scrolling. */}
      {/* Rhythm mirrors the Resources page's External Links pane:
          text-lg heading, text-sm bold group titles, text-sm links. */}
      <div className="md:sticky md:top-24">
        <h2 className="text-lg font-bold text-ink">
          {BLOGS_SECTION.allPostsTitle}
        </h2>
        {POSTS_BY_YEAR.map(([year, yearPosts]) => (
          <div key={year} className="mt-5">
            <h3 className="text-sm leading-snug font-bold text-ink">{year}</h3>
            <ul className="mt-2.5 list-disc space-y-2.5 pl-4 marker:text-muted">
              {yearPosts.map((post) => {
                const isActive = post.slug === activeSlug

                return (
                  <li key={post.slug} className={isActive ? 'marker:text-primary' : ''}>
                    <Link
                      className={`text-sm leading-snug transition-colors duration-200 hover:text-primary ${
                        isActive ? 'font-bold text-primary' : 'font-medium text-ink'
                      }`}
                      to={`/posts/${post.slug}`}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      {post.title}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </div>
    </aside>
  )
}
