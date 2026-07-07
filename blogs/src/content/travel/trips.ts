// Typed accessors for individual trips on the travel page. The trip data
// itself lives in trips.yml; edit that file to add or update trips.
import raw from './trips.yml'
import type { Purpose } from './data'

export type Trip = {
  id: string
  title: string
  /** ISO date (YYYY-MM-DD). */
  startDate: string
  /** Omitted for single-day trips. */
  endDate?: string
  purpose?: Purpose
  /** Cities/places touched on the trip, in order. */
  places?: string[]
  summary?: string
  /** Full URL or CDN key for a cover photo. */
  coverImage?: string
  tags?: string[]
}

interface TripsContent {
  trips?: Trip[]
}

const content = (raw ?? {}) as TripsContent

/** Trips sorted newest-first by start date. */
export const TRIPS: Trip[] = [...(content.trips ?? [])].sort(
  (a, b) => Date.parse(b.startDate) - Date.parse(a.startDate),
)
