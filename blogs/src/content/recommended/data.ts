import { withoutDisabledEntries } from '../../../../src/config/entryStatus'
import { RECOMMENDED_SECTION } from '../sections'
// Typed accessors over data.yml. Edit the YAML file to add recommendations.
import raw from './data.yml'

export type RecommendedCategory = {
  id: string
  label: string
  /** One line under the shelf heading on /recommended. */
  blurb?: string
  /** Material Design Icons class, e.g. "mdi-brain". */
  icon?: string
}

export type RecommendedItem = {
  id: string
  title: string
  author: string
  /** Domain the piece lives on, e.g. "colah.github.io". */
  source: string
  /** Publication name, e.g. "Aeon"; `source` stands in when it is unset. */
  publisher?: string
  /** Id of one of data.yml's categories. */
  category?: string
  /** Full external URL; every card links straight off this site. */
  url: string
  year?: number
  /** ISO date the original was published, e.g. "2017-05-18". */
  published?: string
  /** One-line hook shown on the card. */
  subtitle?: string
  /** One or two sentences on why it is here, in your own voice. */
  note?: string
  readingMinutes?: number
  level?: string
}

export type RecommendedShelf = {
  category: RecommendedCategory
  items: RecommendedItem[]
}

const { categories = [], items } = raw as {
  categories?: RecommendedCategory[]
  items: RecommendedItem[]
}

// Deliberately unsorted: the order in data.yml is a curatorial choice, and
// FEATURED_RECOMMENDED takes it from the top.
export const RECOMMENDED: RecommendedItem[] = withoutDisabledEntries(items)

/** How many recommendations the blog home page carousel shows. */
export const FEATURED_COUNT = 8

export const FEATURED_RECOMMENDED: RecommendedItem[] = RECOMMENDED.slice(
  0,
  FEATURED_COUNT,
)

const CATEGORIES = withoutDisabledEntries(categories)
const CATEGORY_BY_ID = new Map(CATEGORIES.map((category) => [category.id, category]))

/** Catch-all shelf for entries whose `category` is unset or unknown. */
const OTHER_CATEGORY: RecommendedCategory = {
  id: 'other',
  label: RECOMMENDED_SECTION.otherCategoryLabel,
}

export function categoryOf(item: RecommendedItem): RecommendedCategory {
  return (item.category && CATEGORY_BY_ID.get(item.category)) || OTHER_CATEGORY
}

/** Every non-empty category in data.yml's order, the catch-all shelf last. */
export const RECOMMENDED_SHELVES: RecommendedShelf[] = [
  ...CATEGORIES,
  OTHER_CATEGORY,
]
  .map((category) => ({
    category,
    items: RECOMMENDED.filter((item) => categoryOf(item) === category),
  }))
  .filter((shelf) => shelf.items.length > 0)

// The admin writes every field back on save, blank where an entry has no
// value, so an empty publisher or date means "unset".
export function publisherOf(item: RecommendedItem): string {
  return item.publisher?.trim() || item.source
}

export function yearOf(item: RecommendedItem): number | undefined {
  if (typeof item.year === 'number') return item.year
  const year = Number(item.published?.slice(0, 4))
  return year > 0 ? year : undefined
}
