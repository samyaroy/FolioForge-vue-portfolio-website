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
}

const { items } = raw as { items: ReadingItem[] }

export const READINGS: ReadingItem[] = [...items].sort((a, b) =>
  b.date.localeCompare(a.date),
)
