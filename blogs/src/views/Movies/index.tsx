import { useState } from 'react'
import { MOVIES_SECTION } from '../../content/sections'
import { MOVIES } from '../../content/movies/data'
import { PAGE_DESCRIPTIONS } from '../../content/descriptions'
import { isPageDescriptionEnabled } from '../../config/featureFlags'
import { EmptyState } from '../../components/EmptyState'
import {
  INTRO_SECTION_CLASS,
  INTRO_TEXT_CLASS,
  INTRO_TITLE_CLASS,
} from '../../lib/ui'
import { usePageTitle } from '../../lib/usePageTitle'
import { CreatorShoutouts } from './components/CreatorShoutouts'
import { MovieCard } from './components/MovieCard'
import { PostTagFilter } from '../Blogs/components/PostTagFilter'
import { postsWithAnyTag, tagCounts } from '../Blogs/components/postTags'

const MOVIE_TAGS = tagCounts(MOVIES).map(({ tag }) => tag)

export function MoviesPage() {
  usePageTitle(MOVIES_SECTION.title)
  const showPageDescription = isPageDescriptionEnabled('movies')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const shownMovies = postsWithAnyTag(MOVIES, selectedTags)

  return (
    <>
      <section className={`${INTRO_SECTION_CLASS} mb-5! lg:mb-12!`}>
        <h1 className={INTRO_TITLE_CLASS}>
          <span className="mdi mdi-popcorn mr-2.5 align-[-0.04em] leading-none text-primary" aria-hidden="true" />
          {MOVIES_SECTION.title}
        </h1>
        {/* As wide as the card list below and centred like it, so the
            description, centred inside, sits exactly where it would without
            this row, and the filter lines up with the cards' right edge.
            From lg the filter floats on the description's line, out of flow;
            narrower, a long description could run into it, so it drops under
            the line. z-30 sits on the row because its transform makes it the
            stacking context the filter's popover has to clear the cards in. */}
        <div className="relative z-30 ml-[50%] w-full -translate-x-1/2 md:w-[min(calc(100vw-2rem),78rem)]">
          {showPageDescription && (
            <p className={INTRO_TEXT_CLASS}>{PAGE_DESCRIPTIONS.movies}</p>
          )}
          {MOVIE_TAGS.length > 0 && (
            <div
              className={`mt-[2px] flex justify-end text-left ${
                showPageDescription
                  ? 'lg:absolute lg:top-1/2 lg:right-0 lg:mt-0 lg:-translate-y-1/2'
                  : ''
              }`}
            >
              <PostTagFilter
                options={MOVIE_TAGS}
                selected={selectedTags}
                onChange={setSelectedTags}
                title={MOVIES_SECTION.tagFilterTitle}
                openLabel={MOVIES_SECTION.tagFilterOpen}
                clearLabel={MOVIES_SECTION.tagFilterClear}
              />
            </div>
          )}
        </div>
      </section>

      {MOVIES.length === 0 ? (
        <EmptyState icon="mdi-popcorn">{MOVIES_SECTION.emptyLabel}</EmptyState>
      ) : shownMovies.length === 0 ? (
        <EmptyState icon="mdi-filter-off-outline" role="status">
          {MOVIES_SECTION.filteredEmptyLabel}
        </EmptyState>
      ) : (
        <div className="ml-[50%] grid w-full max-w-none -translate-x-1/2 grid-cols-1 gap-6 md:w-[min(calc(100vw-2rem),78rem)]">
          {shownMovies.map((movie, index) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              illustrationSide={index % 2 === 0 ? 'left' : 'right'}
            />
          ))}
        </div>
      )}

      <CreatorShoutouts />
    </>
  )
}
