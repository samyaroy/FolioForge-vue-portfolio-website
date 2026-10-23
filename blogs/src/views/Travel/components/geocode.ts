import type { CityVisit } from '../../../content/travel/data'

// Resolve Indian city names to coordinates via the Open-Meteo geocoding
// API (free, no key, CORS-enabled). Results are cached in localStorage so the
// network is only hit the first time a name is seen.

export type GeoCity = CityVisit & { lat: number; lng: number }

/** Minimal shape a geocoding query needs; CityVisit and TripStop both fit.
    Entries carrying explicit lat/lng bypass the geocoder entirely. */
export type GeocodeQuery = {
  name: string
  state?: string
  lat?: number
  lng?: number
}

const ENDPOINT = 'https://geocoding-api.open-meteo.com/v1/search'
// Old results could point to another country. Re-resolve them under this policy.
const CACHE_KEY = 'travel-geocode-in-v2'
const LOOKUP_TIMEOUT_MS = 8_000
const pendingLookups = new Map<string, Promise<Coord | null>>()

type Coord = { lat: number; lng: number }
type Cache = Record<string, Coord>

type GeoResult = {
  latitude: number
  longitude: number
  country_code?: string
  admin1?: string
}

function readCache(): Cache {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}')
    if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
    return Object.fromEntries(Object.entries(value).filter(([, coord]) => validCoord(coord)))
  } catch {
    return {}
  }
}

function validCoord(value: unknown): value is Coord {
  if (!value || typeof value !== 'object') return false
  const { lat, lng } = value as Coord
  return Number.isFinite(lat) && Math.abs(lat) <= 90 && Number.isFinite(lng) && Math.abs(lng) <= 180
}

function writeCache(cache: Cache): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache))
  } catch {
    /* ignore quota / private-mode failures */
  }
}

function keyFor(city: GeocodeQuery): string {
  return city.state ? `${city.name}|${city.state}` : city.name
}

async function lookup(city: GeocodeQuery): Promise<Coord | null> {
  const params = new URLSearchParams({
    name: city.state ? `${city.name}, ${city.state}` : city.name,
    countryCode: 'IN',
    count: '10',
    language: 'en',
    format: 'json',
  })
  const res = await fetch(`${ENDPOINT}?${params}`, {
    signal: AbortSignal.timeout(LOOKUP_TIMEOUT_MS),
  })
  if (!res.ok) return null
  const data = (await res.json()) as { results?: GeoResult[] }
  const results = data.results ?? []
  // This chart only contains India. A foreign namesake must never move the
  // route camera outside its map, even if the provider ignores our filter.
  const pool = results.filter((r) => r.country_code === 'IN' && validCoord({ lat: r.latitude, lng: r.longitude }))
  if (!pool.length) return null

  let pick = pool[0]
  if (city.state) {
    const want = city.state.toLowerCase()
    const match = pool.find((r) => {
      const a = (r.admin1 ?? '').toLowerCase()
      return a === want || a.includes(want) || want.includes(a)
    })
    if (match) pick = match
  }
  return { lat: pick.latitude, lng: pick.longitude }
}

function lookupOnce(city: GeocodeQuery): Promise<Coord | null> {
  const key = keyFor(city)
  const pending = pendingLookups.get(key)
  if (pending) return pending
  const request = lookup(city).catch(() => null).finally(() => pendingLookups.delete(key))
  pendingLookups.set(key, request)
  return request
}

export async function geocodeCities<T extends GeocodeQuery>(
  cities: T[],
): Promise<(T & Coord)[]> {
  const cache = readCache()
  let dirty = false

  // The async pipeline stays non-generic (Coord | null): Promise.all over
  // the generic T would produce Awaited<T & Coord>, which TypeScript cannot
  // reduce for an unbound T. Coordinates are zipped with the typed cities
  // synchronously afterwards.
  const coords = await Promise.all(
    cities.map(async (city): Promise<Coord | null> => {
      if (validCoord(city)) {
        return { lat: city.lat, lng: city.lng }
      }
      const key = keyFor(city)
      let coord: Coord | undefined = cache[key]
      if (!coord) {
        const found = await lookupOnce(city)
        if (found) {
          coord = found
          cache[key] = found
          dirty = true
        }
      }
      return coord ?? null
    }),
  )

  if (dirty) writeCache(cache)

  const resolved: (T & Coord)[] = []
  cities.forEach((city, i) => {
    const coord = coords[i]
    if (coord) resolved.push({ ...city, ...coord })
  })
  return resolved
}
