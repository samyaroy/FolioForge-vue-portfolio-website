// Typed accessors for individual trips on the travel page. The trip data
// itself lives in trips.yml; edit that file to add or update trips.
import raw from './trips.yml'

export type TripStat = {
  label: string
  value: string
}

export type Trip = {
  id: string
  title: string
  /** ISO date (YYYY-MM-DD). */
  date: string
  /** Cities/places touched on the trip, in order. */
  places?: string[]
  summary?: string
  /** Full URL or CDN key for a cover photo. */
  coverImage?: string
  tags?: string[]
  /** Long-form paragraphs for the trip details page; falls back to summary. */
  narrative?: string[]
  /** Metric cards on the details page, e.g. { label: Distance, value: 320 km }. */
  stats?: TripStat[]
  /** Image for the details page "Route map" card; falls back to coverImage. */
  routeMapImage?: string
  /** Photo URLs for the details page gallery grid. */
  gallery?: string[]
}

interface TripsContent {
  trips?: Trip[]
}

const content = (raw ?? {}) as TripsContent

/** Trips sorted newest-first by date. */
export const TRIPS: Trip[] = [...(content.trips ?? [])].sort(
  (a, b) => Date.parse(b.date) - Date.parse(a.date),
)

/** Look up a trip by its slug, for the /travel/:tripId details page. */
export function getTrip(id: string): Trip | undefined {
  return TRIPS.find((trip) => trip.id === id)
}
