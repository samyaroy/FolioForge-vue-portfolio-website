// Typed accessors over data.yml. Edit the YAML file to add readings.
import raw from './data.yml'

export type ReadingItem = {
  id: string
  title: string
  author: string
  genre: string
  /** ISO date string, e.g. "2026-06-20". */
  date: string
  description: string
  /** Cover image: full URL or bare CDN key (resolved like gallery images). */
  image?: string
  /** Longer note shown in the review modal; blank lines split paragraphs. */
  note?: string
  /** Star rating shown in the review modal, 1-5. */
  rating?: number
  /** External link (e.g. Wikipedia, Goodreads) shown in the review modal. */
  link?: string
}

const { items } = raw as { items: ReadingItem[] }

function resolveCoverImage(entry?: string) {
  if (typeof entry !== 'string') return undefined

  const trimmedEntry = entry.trim()
  if (!trimmedEntry) return undefined

  if (/^https?:\/\//i.test(trimmedEntry)) return trimmedEntry

  return `https://media.samyabrata.codeium.xyz/${encodeURIComponent(trimmedEntry)}.jpeg`
}

export const READINGS: ReadingItem[] = items
  .map((item) => ({ ...item, image: resolveCoverImage(item.image) }))
  .sort((a, b) => b.date.localeCompare(a.date))
