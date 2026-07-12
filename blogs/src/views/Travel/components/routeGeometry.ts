import type { TransportMode } from '../../../content/travel/trips'

// Resolve a trip leg to real route geometry at runtime: roads and treks via
// OSRM-compatible public routers (free, no key, CORS-enabled), rail via this
// site's own /api/rail-route Worker proxy (which holds the RailRadar key).
// Results are cached in localStorage with a TTL so each device only asks a
// router once per leg per window. Every failure path returns null, and the
// caller falls back to the styled straight line.

export type LegPoint = { lat: number; lng: number }
export type LegTarget = LegPoint & {
  mode?: TransportMode
  train?: string | number
}

/** Route polylines as [lng, lat] pairs — the order ECharts wants. */
export type LegCoords = number[][]

const CACHE_KEY = 'travel-route-v1'
const CACHE_TTL_MS = 6 * 60 * 60 * 1000 // 6 hours
const FETCH_TIMEOUT_MS = 4000

// Public demo routers, intended for light use only — the cache above keeps
// each visitor to one request per leg per TTL window.
const ROAD_ENDPOINT = 'https://router.project-osrm.org/route/v1/driving'
const FOOT_ENDPOINT =
  'https://routing.openstreetmap.de/routed-foot/route/v1/foot'

type CacheEntry = { c: LegCoords; t: number }
type Cache = Record<string, CacheEntry>

function readCache(): Cache {
  try {
    const cache = JSON.parse(
      localStorage.getItem(CACHE_KEY) || '{}',
    ) as Cache
    const now = Date.now()
    for (const key of Object.keys(cache)) {
      if (now - cache[key].t > CACHE_TTL_MS) delete cache[key]
    }
    return cache
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

// ~11 m precision is plenty for a cache key and keeps keys stable across
// float noise in geocoder responses.
function keyFor(kind: string, from: LegPoint, to: LegPoint): string {
  const pt = (p: LegPoint) => `${p.lng.toFixed(4)},${p.lat.toFixed(4)}`
  return `${kind}|${pt(from)}|${pt(to)}`
}

async function fetchJson(url: string): Promise<unknown> {
  const res = await fetch(url, {
    signal: AbortSignal.timeout?.(FETCH_TIMEOUT_MS),
  })
  if (!res.ok) throw new Error(`${url} -> ${res.status}`)
  // The vite dev server (no Worker) answers /api/* with the SPA's index.html;
  // treat anything that isn't JSON as a miss instead of a parse crash.
  if (!res.headers.get('content-type')?.includes('json')) {
    throw new Error(`${url} -> not JSON`)
  }
  return res.json()
}

async function osrmGeometry(
  endpoint: string,
  from: LegPoint,
  to: LegPoint,
): Promise<LegCoords | null> {
  const data = (await fetchJson(
    `${endpoint}/${from.lng},${from.lat};${to.lng},${to.lat}` +
      '?overview=simplified&geometries=geojson',
  )) as { code?: string; routes?: { geometry?: { coordinates?: LegCoords } }[] }
  const coords = data.routes?.[0]?.geometry?.coordinates
  return data.code === 'Ok' && coords && coords.length >= 2 ? coords : null
}

/**
 * Pull a [lng, lat] line out of whatever JSON shape the rail proxy relays.
 * RailRadar wraps a GeoJSON Feature as { data: { geojson: ... } } (docs:
 * /docs/train-route-geometry); the envelope keys below also cover the other
 * shapes it can emit — a bare LineString/MultiLineString/FeatureCollection,
 * or a plain array of {lat, lng}-ish stop points.
 */
function extractLineCoords(payload: unknown): LegCoords | null {
  if (payload == null || typeof payload !== 'object') return null

  if (Array.isArray(payload)) {
    const pts = payload
      .map((p) => {
        if (Array.isArray(p) && p.length >= 2) return [p[0], p[1]]
        const q = p as Record<string, number | undefined>
        const lat = q.lat ?? q.latitude
        const lng = q.lng ?? q.lon ?? q.longitude
        return lat != null && lng != null ? [lng, lat] : null
      })
      .filter((p): p is number[] => p != null)
    return pts.length >= 2 ? pts : null
  }

  const obj = payload as Record<string, unknown>
  // Unwrap known envelopes (in preference order) before shape checks.
  for (const key of ['data', 'geojson', 'geometry', 'route'] as const) {
    if (key in obj) {
      const line = extractLineCoords(obj[key])
      if (line) return line
    }
  }

  if (obj.type === 'FeatureCollection' && Array.isArray(obj.features)) {
    const lines = obj.features
      .map((f) => extractLineCoords(f))
      .filter((c): c is LegCoords => c != null)
    return lines.length ? lines.flat() : null
  }
  if (obj.type === 'Feature') return extractLineCoords(obj.geometry)
  if (
    (obj.type === 'LineString' || obj.type === undefined) &&
    Array.isArray(obj.coordinates)
  ) {
    return extractLineCoords(obj.coordinates)
  }
  if (obj.type === 'MultiLineString' && Array.isArray(obj.coordinates)) {
    return (obj.coordinates as LegCoords[]).flat()
  }

  // Last resort: a station list ({lat, lng} points in travel order).
  if (Array.isArray(obj.stops)) return extractLineCoords(obj.stops)
  return null
}

/**
 * A train's geometry spans its whole run; cut it down to the stretch between
 * the leg's two cities (nearest vertex to each, flipped if the train's
 * direction opposes the leg's).
 */
function trimToLeg(coords: LegCoords, from: LegPoint, to: LegPoint): LegCoords {
  const nearest = (p: LegPoint) => {
    let best = 0
    let bestD = Infinity
    coords.forEach(([lng, lat], i) => {
      const d = (lng - p.lng) ** 2 + (lat - p.lat) ** 2
      if (d < bestD) {
        bestD = d
        best = i
      }
    })
    return best
  }
  const a = nearest(from)
  const b = nearest(to)
  if (a === b) return coords
  const slice = coords.slice(Math.min(a, b), Math.max(a, b) + 1)
  return a > b ? slice.reverse() : slice
}

async function railGeometry(
  train: string,
  from: LegPoint,
  to: LegPoint,
): Promise<LegCoords | null> {
  const payload = await fetchJson(
    `/api/rail-route?train=${encodeURIComponent(train)}`,
  )
  const line = extractLineCoords(payload)
  return line && line.length >= 2 ? trimToLeg(line, from, to) : null
}

/**
 * Douglas–Peucker line simplification. Route geometry is far more detailed
 * than the trip map's fixed zoom can show — mountain-road hairpins collapse
 * into a scribbled blob — so legs are thinned to `tolerance` (in degrees,
 * pick from the visible span) before rendering. The cache keeps the raw line.
 */
export function simplifyLine(coords: LegCoords, tolerance: number): LegCoords {
  if (coords.length <= 2) return coords
  const sqTol = tolerance * tolerance

  const sqSegDist = (p: number[], a: number[], b: number[]): number => {
    let [x, y] = a
    let dx = b[0] - x
    let dy = b[1] - y
    if (dx !== 0 || dy !== 0) {
      const t = ((p[0] - x) * dx + (p[1] - y) * dy) / (dx * dx + dy * dy)
      if (t > 1) {
        x = b[0]
        y = b[1]
      } else if (t > 0) {
        x += dx * t
        y += dy * t
      }
    }
    dx = p[0] - x
    dy = p[1] - y
    return dx * dx + dy * dy
  }

  const keep = new Array<boolean>(coords.length).fill(false)
  keep[0] = keep[coords.length - 1] = true
  const stack: [number, number][] = [[0, coords.length - 1]]
  while (stack.length) {
    const [first, last] = stack.pop()!
    let maxD = 0
    let index = first
    for (let i = first + 1; i < last; i++) {
      const d = sqSegDist(coords[i], coords[first], coords[last])
      if (d > maxD) {
        maxD = d
        index = i
      }
    }
    if (maxD > sqTol) {
      keep[index] = true
      stack.push([first, index], [index, last])
    }
  }
  return coords.filter((_, i) => keep[i])
}

/**
 * Real geometry for the leg that arrives at `to`, or null when the mode has
 * no router (flights stay arcs), the leg lacks the data it needs (trains
 * without a train number), or the lookup fails.
 */
export async function fetchLegGeometry(
  from: LegPoint,
  to: LegTarget,
): Promise<LegCoords | null> {
  let kind: string
  let lookup: () => Promise<LegCoords | null>
  switch (to.mode) {
    case 'car':
    case 'bus':
      kind = 'road'
      lookup = () => osrmGeometry(ROAD_ENDPOINT, from, to)
      break
    case 'foot':
      kind = 'foot'
      lookup = () => osrmGeometry(FOOT_ENDPOINT, from, to)
      break
    case 'train': {
      if (to.train == null) return null
      const train = String(to.train)
      kind = `train:${train}`
      lookup = () => railGeometry(train, from, to)
      break
    }
    default:
      return null
  }

  const key = keyFor(kind, from, to)
  const hit = readCache()[key]
  if (hit) return hit.c

  const coords = await lookup().catch(() => null)
  if (coords) {
    // Re-read before writing: a trip's legs resolve in parallel, and a
    // stale snapshot from before the await would drop their entries.
    const cache = readCache()
    cache[key] = { c: coords, t: Date.now() }
    writeCache(cache)
  }
  return coords
}
