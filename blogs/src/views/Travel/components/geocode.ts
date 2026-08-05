import type { CityVisit } from '../../../content/travel/data'

// Resolve city names to coordinates at runtime via the Open-Meteo geocoding
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
const CACHE_KEY = 'travel-geocode-v1'

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
    return JSON.parse(localStorage.getItem(CACHE_KEY) || '{}') as Cache
  } catch {
    return {}
  }
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
  const url = `${ENDPOINT}?name=${encodeURIComponent(
    city.name,
  )}&count=10&language=en&format=json`
  const res = await fetch(url)
  if (!res.ok) return null
  const data = (await res.json()) as { results?: GeoResult[] }
  const results = data.results ?? []
  // Prefer Indian matches; if a state is given, prefer the one in that state.
  const inIndia = results.filter((r) => r.country_code === 'IN')
  const pool = inIndia.length ? inIndia : results
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
      if (city.lat != null && city.lng != null) {
        return { lat: city.lat, lng: city.lng }
      }
      const key = keyFor(city)
      let coord: Coord | undefined = cache[key]
      if (!coord) {
        const found = await lookup(city).catch(() => null)
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
