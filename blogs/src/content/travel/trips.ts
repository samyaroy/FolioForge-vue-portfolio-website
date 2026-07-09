// Typed accessors for individual trips on the travel page. The trip data
// itself lives in trips.yml; edit that file to add or update trips.
import raw from './trips.yml'

export type TripStat = {
  label: string
  value: string
}

/** How a stop was reached from the previous one; drives the route animation. */
export type TransportMode =
  | 'flight'
  | 'train'
  | 'bus'
  | 'car'
  | 'ferry'
  | 'foot'

export type TripStop = {
  /** Display name; also the geocoding query for the route map. */
  name: string
  /** State, to disambiguate geocoding between same-named places. */
  state?: string
  /** Explicit coordinates; when set, geocoding is skipped for this stop. */
  lat?: number
  lng?: number
  /** How this stop was reached from the previous one (omit on the first). */
  mode?: TransportMode
  /** Nights stayed here; can size the stop's marker on the map. */
  nights?: number
  /** Short tooltip line, e.g. "Shore temples". */
  note?: string
}

/** A places entry in trips.yml: a bare name, or a stop object with details. */
export type TripPlace = string | TripStop

export type Trip = {
  id: string
  title: string
  /** ISO date (YYYY-MM-DD). */
  date: string
  /** Stops on the trip, in travel order. */
  places?: TripPlace[]
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

/** A trip's places normalized to stop objects (bare names become { name }). */
export function tripStops(trip: Trip): TripStop[] {
  return (trip.places ?? []).map((place) =>
    typeof place === 'string' ? { name: place } : place,
  )
}
