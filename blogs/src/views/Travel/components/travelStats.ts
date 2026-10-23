import {
  CITIES_PER_STATE,
  CITY_VISITS,
  STATE_VISITS,
} from '../../../content/travel/data'
import {
  tripStops,
  type TransportMode,
  type Trip,
} from '../../../content/travel/trips'

// Everything the travel page's at-a-glance band shows, derived from the map
// data (data.yml) and the trips (trips.yml) so it can never go stale.

export type ModeCount = { mode: TransportMode; legs: number }

export type TravelOverview = {
  states: number
  cities: number
  trips: number
  photos: number
  /** Earliest trip year, or undefined when there are no dated trips. */
  since?: number
  /** Legs per transport mode across all trips, most-used first. */
  modes: ModeCount[]
  mostVisitedCity?: { name: string; visits: number }
  mostExploredState?: { name: string; cities: number }
}

export function buildTravelOverview(trips: Trip[]): TravelOverview {
  const legs = new Map<TransportMode, number>()
  for (const trip of trips) {
    for (const stop of tripStops(trip)) {
      if (stop.mode) legs.set(stop.mode, (legs.get(stop.mode) ?? 0) + 1)
    }
  }

  const years = trips
    .map((trip) => new Date(trip.date).getFullYear())
    .filter((year) => !Number.isNaN(year))

  // Home doesn't count as a destination for the "most visited" highlight.
  const mostVisitedCity = CITY_VISITS.filter((c) => !c.home).reduce<
    TravelOverview['mostVisitedCity']
  >((best, c) => {
    const visits = c.visits ?? 1
    return !best || visits > best.visits ? { name: c.name, visits } : best
  }, undefined)

  const mostExploredState = Object.entries(CITIES_PER_STATE).reduce<
    TravelOverview['mostExploredState']
  >(
    (best, [name, cities]) =>
      !best || cities > best.cities ? { name, cities } : best,
    undefined,
  )

  return {
    states: STATE_VISITS.length,
    cities: CITY_VISITS.length,
    trips: trips.length,
    photos: trips.reduce((sum, trip) => sum + (trip.gallery?.length ?? 0), 0),
    since: years.length > 0 ? Math.min(...years) : undefined,
    modes: [...legs]
      .map(([mode, count]) => ({ mode, legs: count }))
      .sort((a, b) => b.legs - a.legs),
    mostVisitedCity,
    mostExploredState,
  }
}

export type TripMapTargets = { states: string[]; cities: string[] }

const normalize = (name: string) => name.trim().toLowerCase()

const cityByName = new Map(CITY_VISITS.map((c) => [normalize(c.name), c]))
const stateByName = new Map(STATE_VISITS.map((s) => [normalize(s.state), s.state]))

/**
 * The map states and city markers a trip touched, for lighting them up while
 * the trip's card is hovered. Stops are matched by name against the map's
 * cities (and, for stops like "Delhi", its states); the trip's location line
 * adds any state it names. The home city is left out — nearly every trip
 * starts there, so it would light up on every card.
 */
export function tripMapTargets(trip: Trip): TripMapTargets {
  const states = new Set<string>()
  const cities = new Set<string>()

  for (const stop of tripStops(trip)) {
    const city = cityByName.get(normalize(stop.name))
    if (city && !city.home) {
      cities.add(city.name)
      if (city.state) states.add(city.state)
      continue
    }
    const state = stateByName.get(normalize(stop.name))
    if (state) states.add(state)
  }

  for (const part of trip.location?.split(',') ?? []) {
    const state = stateByName.get(normalize(part))
    if (state) states.add(state)
  }

  return { states: [...states], cities: [...cities] }
}

/** A trip's stops for the short route line on its card: the first few, then
    "+N" for the hidden middle, then the final stop. A lone hidden stop is
    shown instead, since "+1" would take about as much room. */
export function routePreview(trip: Trip, maxShown = 4) {
  const stops = tripStops(trip)
  if (stops.length <= maxShown + 1) return { head: stops, hidden: 0, tail: [] }
  return {
    head: stops.slice(0, maxShown - 1),
    hidden: stops.length - maxShown,
    tail: stops.slice(-1),
  }
}
