// Typed accessors and derived values for the travel map. The visit data
// itself lives in data.yml; edit that file to keep the map up to date.
import raw from './data.yml'

export type Purpose = 'academic' | 'travel' | 'both'

export type StateVisit = {
  state: string
  purpose: Purpose
  /** Marks your home state; gets a hatched pattern overlay on the map. */
  home?: boolean
}

export type CityVisit = {
  name: string
  visits?: number
  /** Filled in from the parent state entry; used to disambiguate geocoding. */
  state?: string
  /** Places where you lived/stayed for college, work, or similar reasons. */
  stayed?: boolean
  stayReason?: string
  /** Marks your home city; drawn with a distinct marker. */
  home?: boolean
}

export interface TravelLegendLabels {
  citiesSuffix: string
  academic: string
  travel: string
  both: string
  homeState: string
  cityVisited: string
  stayed: string
  stayedTooltip: string
  homeCity: string
  homeCityCenter: string
}

interface StateEntry extends StateVisit {
  cities?: Omit<CityVisit, 'state'>[]
}

interface TravelContent {
  legendLabels: TravelLegendLabels
  states: StateEntry[]
}

const travel = raw as TravelContent

export const STATE_VISITS: StateVisit[] = travel.states.map(
  ({ state, purpose, home }) => ({ state, purpose, home }),
)

export const CITY_VISITS: CityVisit[] = travel.states.flatMap((entry) =>
  (entry.cities ?? []).map((city) => ({ ...city, state: entry.state })),
)

export const TRAVEL_LEGEND_LABELS: TravelLegendLabels = travel.legendLabels

/**
 * Number of distinct cities visited per state. This drives the choropleth
 * shade, and stayed places still count as cities for this bucket.
 */
export const CITIES_PER_STATE: Record<string, number> = CITY_VISITS.reduce(
  (acc, city) => {
    if (city.state) acc[city.state] = (acc[city.state] ?? 0) + 1
    return acc
  },
  {} as Record<string, number>,
)
