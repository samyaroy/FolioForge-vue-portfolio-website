import * as echarts from 'echarts'

// India boundaries pulled from a maintained, post-2019 dataset (Ladakh & J&K
// split, current names) served over a CDN — no GeoJSON is vendored in-repo.
// The GeoJSON names states under `st_nm`.
const INDIA_GEOJSON_URL =
  'https://cdn.jsdelivr.net/gh/udit-001/india-maps-data@main/geojson/india.geojson'

export const INDIA_MAP_NAME = 'india'

type LngLat = number[]
type Ring = LngLat[]

type GeoGeometry =
  | { type: 'Polygon'; coordinates: Ring[] }
  | { type: 'MultiPolygon'; coordinates: Ring[][] }

type GeoFeature = {
  properties?: { st_nm?: string }
  geometry?: GeoGeometry
}

type GeoJson = { features?: GeoFeature[] }

let indiaGeoJson: GeoJson | null = null
let indiaMapPromise: Promise<string[]> | null = null
let stateBordersPromise: Promise<Ring[]> | null = null

/**
 * Fetch and register the India map with ECharts once, shared by the travel
 * page and the trip route map. Resolves to the list of state names. A failed
 * load clears the cache so a later mount can retry.
 */
export function loadIndiaMap(): Promise<string[]> {
  if (!indiaMapPromise) {
    indiaMapPromise = (async () => {
      const res = await fetch(INDIA_GEOJSON_URL)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const geojson = (await res.json()) as GeoJson
      echarts.registerMap(INDIA_MAP_NAME, geojson as never)
      indiaGeoJson = geojson
      return [
        ...new Set(
          (geojson.features ?? [])
            .map((f) => f.properties?.st_nm)
            .filter((n): n is string => Boolean(n)),
        ),
      ]
    })()
    indiaMapPromise.catch(() => {
      indiaMapPromise = null
    })
  }
  return indiaMapPromise
}

function ringsOf(geometry: GeoGeometry | undefined): Ring[] {
  if (!geometry) return []
  if (geometry.type === 'Polygon') return geometry.coordinates
  if (geometry.type === 'MultiPolygon') return geometry.coordinates.flat()
  return []
}

function segmentKey(a: LngLat, b: LngLat): string {
  const ka = `${a[0].toFixed(6)},${a[1].toFixed(6)}`
  const kb = `${b[0].toFixed(6)},${b[1].toFixed(6)}`
  return ka < kb ? `${ka}|${kb}` : `${kb}|${ka}`
}

/**
 * Polylines tracing the inter-state boundaries. The GeoJSON is
 * district-granularity with no separate state geometry, so state borders
 * are derived: an edge shared by districts of two different states is a
 * state border. Adjacent districts share exact coordinates in this dataset,
 * which makes the shared-edge lookup reliable.
 */
export function loadIndiaStateBorders(): Promise<Ring[]> {
  if (!stateBordersPromise) {
    stateBordersPromise = (async () => {
      await loadIndiaMap()
      return computeStateBorders(indiaGeoJson ?? {})
    })()
    stateBordersPromise.catch(() => {
      stateBordersPromise = null
    })
  }
  return stateBordersPromise
}

function computeStateBorders(geojson: GeoJson): Ring[] {
  const features = geojson.features ?? []

  // Pass 1: which states touch each edge segment.
  const segStates = new Map<string, Set<string>>()
  for (const feature of features) {
    const state = feature.properties?.st_nm
    if (!state) continue
    for (const ring of ringsOf(feature.geometry)) {
      for (let i = 0; i < ring.length - 1; i++) {
        const key = segmentKey(ring[i], ring[i + 1])
        let states = segStates.get(key)
        if (!states) segStates.set(key, (states = new Set()))
        states.add(state)
      }
    }
  }

  // Pass 2: walk each ring again and collect runs of consecutive
  // inter-state segments into polylines. Each border is seen from both
  // sides; emitting it only for the alphabetically first state dedupes it.
  const chains: Ring[] = []
  for (const feature of features) {
    const state = feature.properties?.st_nm
    if (!state) continue
    for (const ring of ringsOf(feature.geometry)) {
      let chain: Ring | null = null
      for (let i = 0; i < ring.length - 1; i++) {
        const states = segStates.get(segmentKey(ring[i], ring[i + 1]))
        const isBorder =
          states !== undefined &&
          states.size >= 2 &&
          state === [...states].sort()[0]
        if (isBorder) {
          if (!chain) {
            chain = [ring[i]]
            chains.push(chain)
          }
          chain.push(ring[i + 1])
        } else {
          chain = null
        }
      }
    }
  }
  return chains
}
