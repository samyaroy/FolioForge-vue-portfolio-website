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
import { MovieCard } from './components/MovieCard'

export function MoviesPage() {
  usePageTitle(MOVIES_SECTION.title)
  const showPageDescription = isPageDescriptionEnabled('movies')

  return (
    <>
      <section className={INTRO_SECTION_CLASS}>
        <h1 className={INTRO_TITLE_CLASS}>{MOVIES_SECTION.title}</h1>
        {showPageDescription && (
          <p className={INTRO_TEXT_CLASS}>{PAGE_DESCRIPTIONS.movies}</p>
        )}
      </section>

      {MOVIES.length === 0 ? (
        <p className={EMPTY_TEXT_CLASS}>{MOVIES_SECTION.emptyLabel}</p>
      ) : (
        <div className="ml-[50%] grid w-full max-w-none -translate-x-1/2 grid-cols-1 gap-6 md:w-[min(calc(100vw-2rem),78rem)]">
          {MOVIES.map((movie, index) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              illustrationSide={index % 2 === 0 ? 'left' : 'right'}
            />
          ))}
        </div>
      )}
    </>
  )
}
