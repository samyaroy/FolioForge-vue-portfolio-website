import { isFeatureEnabled } from '../../../config/featureFlags'
import { MOVIES } from '../../../content/movies/data'
import { READINGS } from '../../../content/readings/data'
import { HOME_LATEST_LABELS as LABELS } from '../../../content/site'
import { TRIPS } from '../../../content/travel/trips'
import { formatDate } from '../../../lib/format'
import { posts } from '../../../lib/posts'

// Rows for the blog home "What's new" panel (HomeLatest.tsx).

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

/** The newest entry from each section that is switched on and non-empty. */
export function latestItems(): LatestItem[] {
  const items: LatestItem[] = []

  const post = posts[0]
  if (post) {
    items.push({
      key: 'post',
      kicker: LABELS.post,
      icon: 'mdi-fountain-pen-tip',
      title: post.title,
      meta: formatDate(post.date),
      image: post.cover,
      to: `/posts/${post.slug}`,
    })
  }

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

  const trip = TRIPS[0]
  if (isFeatureEnabled('showTravel') && trip) {
    items.push({
      key: 'trip',
      kicker: LABELS.trip,
      icon: 'mdi-map-marker-path',
      title: trip.title,
      meta: join(trip.location, formatDate(trip.date)),
      image: trip.coverImage,
      to: `/travel/${trip.id}`,
    })
  }

  return items
}
