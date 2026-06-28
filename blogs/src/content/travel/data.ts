// Personal visit data. State names MUST match the `st_nm` property in the
// CDN GeoJSON (udit-001/india-maps-data). Edit these two arrays to keep the
// map up to date; everything else is derived automatically.

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
  /** Optional state, used only to disambiguate geocoding (matches admin1). */
  state?: string
  /** Places where you lived/stayed for college, work, or similar reasons. */
  stayed?: boolean
  stayReason?: string
  /** Marks your home city; drawn with a distinct marker. */
  home?: boolean
}

export const STATE_VISITS: StateVisit[] = [
  { state: 'Delhi', purpose: 'both' },
  { state: 'Tamil Nadu', purpose: 'academic' },
  { state: 'Telangana', purpose: 'both' },
  { state: 'Uttar Pradesh', purpose: 'travel' },
  { state: 'Uttarakhand', purpose: 'travel' },
  { state: 'Odisha', purpose: 'travel' },
  { state: 'Punjab', purpose: 'academic' },
  { state: 'Andhra Pradesh', purpose: 'travel' },
  { state: 'West Bengal', purpose: 'both', home: true },
]

export const CITY_VISITS: CityVisit[] = [
  // Delhi
  { name: 'New Delhi', visits: 2, state: 'Delhi' },

  // Tamil Nadu
  { name: 'Chennai', visits: 5, state: 'Tamil Nadu', stayed: true },
  { name: 'Mamallapuram', visits: 1, state: 'Tamil Nadu' },

  // Telangana
  { name: 'Hyderabad', visits: 4, state: 'Telangana' },

  // Uttar Pradesh
  { name: 'Varanasi', visits: 1, state: 'Uttar Pradesh' },
  { name: 'Agra', visits: 1, state: 'Uttar Pradesh' },

  // Uttarakhand
  { name: 'Rishikesh', visits: 2, state: 'Uttarakhand' },
  { name: 'Kedarnath', visits: 1, state: 'Uttarakhand' },
  { name: 'Mussoorie', visits: 1, state: 'Uttarakhand' },
  { name: 'Rudraprayag', visits: 1, state: 'Uttarakhand' },
  { name: 'Haridwar', visits: 2, state: 'Uttarakhand' },
  { name: 'Dehradun', visits: 1, state: 'Uttarakhand' },
  { name: 'Nainital', visits: 1, state: 'Uttarakhand' },
  { name: 'Uttarkashi', visits: 1, state: 'Uttarakhand' },
  { name: 'Badrinath', visits: 1, state: 'Uttarakhand' },
  { name: 'Ranikhet', visits: 1, state: 'Uttarakhand' },
  { name: 'Gaurikund', visits: 1, state: 'Uttarakhand' },

  // Odisha
  { name: 'Puri', visits: 7, state: 'Odisha' },
  { name: 'Bhubaneswar', visits: 1, state: 'Odisha' },

  // Punjab
  { name: 'Rupnagar', visits: 1, state: 'Punjab' },
  { name: 'Chandigarh', visits: 1, state: 'Punjab' },

  // Andhra Pradesh
  { name: 'Visakhapatnam', visits: 1, state: 'Andhra Pradesh' },

  // West Bengal
  { name: 'Kolkata', visits: 1, state: 'West Bengal', home: true },
  { name: 'Darjeeling', visits: 1, state: 'West Bengal' },
  { name: 'Digha', visits: 2, state: 'West Bengal' },
  { name: 'Mandarmani', visits: 1, state: 'West Bengal' },
  { name: 'Krishnagar', visits: 1, state: 'West Bengal' },
]

export const TRAVEL_LEGEND_LABELS = {
  citiesSuffix: 'cities',
  academic: 'Academic',
  travel: 'Travel',
  both: 'Both',
  homeState: 'Home state',
  cityVisited: 'City visited',
  stayed: 'Stayed / lived',
  stayedTooltip: 'Stayed / lived here',
  homeCity: 'Home city',
  homeCityCenter: 'Home city center',
}

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
