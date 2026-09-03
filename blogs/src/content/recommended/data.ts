// Typed accessors over data.yml. Edit the YAML file to add recommendations.
import raw from './data.yml'

export type RecommendedItem = {
  id: string
  title: string
  author: string
  /** Domain the piece lives on, e.g. "colah.github.io". */
  source: string
  /** Full external URL; every card links straight off this site. */
  url: string
  year?: number
  /** One or two sentences on why it is here, in your own voice. */
  note?: string
}

const { items } = raw as { items: RecommendedItem[] }

// Deliberately unsorted: the order in data.yml is a curatorial choice, and
// FEATURED_RECOMMENDED takes it from the top.
export const RECOMMENDED: RecommendedItem[] = items

/** How many recommendations the blog home page teases. */
export const FEATURED_COUNT = 3

export const FEATURED_RECOMMENDED: RecommendedItem[] = RECOMMENDED.slice(
  0,
  FEATURED_COUNT,
)
