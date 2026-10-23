import { isFeatureEnabled } from '../../../config/featureFlags'
import { MOVIES } from '../../../content/movies/data'
import { READINGS } from '../../../content/readings/data'
import { HOME_LATEST_LABELS as LABELS } from '../../../content/site'

// Rows under the featured post in the blog home "What's new" panel
// (HomeLatest.tsx). The newest post itself is the panel's featured card.

export type LatestItem = {
  key: string
  kicker: string
  icon: string
  title: string
  meta?: string
  image?: string
  to: string
}

const join = (...parts: (string | number | undefined)[]) =>
  parts.filter((p) => p !== undefined && p !== '').join(' · ')

/** The newest reading and movie, for each section that is on and non-empty. */
export function latestItems(): LatestItem[] {
  const items: LatestItem[] = []

  const reading = READINGS[0]
  if (isFeatureEnabled('showReadings') && reading) {
    items.push({
      key: 'reading',
      kicker: LABELS.reading,
      icon: 'mdi-book-open-page-variant-outline',
      title: reading.title,
      meta: reading.author,
      image: reading.image,
      to: '/readings',
    })
  }

  const movie = MOVIES[0]
  if (isFeatureEnabled('showMovies') && movie) {
    items.push({
      key: 'movie',
      kicker: LABELS.movie,
      icon: 'mdi-movie-open-outline',
      title: movie.title,
      meta: join(movie.director, movie.year),
      image: movie.image,
      to: '/movies',
    })
  }

  return items
}
