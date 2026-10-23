import { useState } from 'react'
import { MOVIES_SECTION } from '../../content/sections'
import { MOVIES } from '../../content/movies/data'
import { PAGE_DESCRIPTIONS } from '../../content/descriptions'
import { isPageDescriptionEnabled } from '../../config/featureFlags'
import {
  EMPTY_TEXT_CLASS,
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
      <section className={`${INTRO_SECTION_CLASS} mb-[2px]!`}>
        <h1 className={INTRO_TITLE_CLASS}>{MOVIES_SECTION.title}</h1>
        {showPageDescription && (
          <p className={INTRO_TEXT_CLASS}>{PAGE_DESCRIPTIONS.movies}</p>
        )}
      </section>

      {MOVIE_TAGS.length > 0 && (
        <div className="relative z-30 ml-[50%] mb-5 flex w-full -translate-x-1/2 justify-end md:w-[min(calc(100vw-2rem),78rem)]">
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

      {MOVIES.length === 0 ? (
        <p className={EMPTY_TEXT_CLASS}>{MOVIES_SECTION.emptyLabel}</p>
      ) : shownMovies.length === 0 ? (
        <p className={EMPTY_TEXT_CLASS} role="status">
          {MOVIES_SECTION.filteredEmptyLabel}
        </p>
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
