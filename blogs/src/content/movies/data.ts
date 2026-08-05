// Typed accessors over data.yml. Edit the YAML file to add movies.
import raw from './data.yml'

export type MovieItem = {
  id: string
  title: string
  director: string
  genre: string
  /** ISO date string for when it was watched, e.g. "2026-07-12". */
  date: string
  description: string
  /** Release year, shown in the card and modal meta line. */
  year?: number
  /** Poster image: full URL or bare CDN key (resolved like gallery images). */
  image?: string
  /** Longer note shown in the review modal; blank lines split paragraphs. */
  note?: string
  /** Star rating shown in the review modal, 1-5. */
  rating?: number
  /** External link (e.g. Wikipedia, IMDb) shown in the review modal. */
  link?: string
}

const { items } = raw as { items: MovieItem[] }

function resolvePosterImage(entry?: string) {
  if (typeof entry !== 'string') return undefined

  const trimmedEntry = entry.trim()
  if (!trimmedEntry) return undefined

  if (/^https?:\/\//i.test(trimmedEntry)) return trimmedEntry

  return `https://media.samyabrata.codeium.xyz/${encodeURIComponent(trimmedEntry)}.jpeg`
}

export const MOVIES: MovieItem[] = items
  .map((item) => ({ ...item, image: resolvePosterImage(item.image) }))
  .sort((a, b) => b.date.localeCompare(a.date))
