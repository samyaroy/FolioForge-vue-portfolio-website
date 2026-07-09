import * as echarts from 'echarts'

// India boundaries pulled from a maintained, post-2019 dataset (Ladakh & J&K
// split, current names) served over a CDN — no GeoJSON is vendored in-repo.
// The GeoJSON names states under `st_nm`.
const INDIA_GEOJSON_URL =
  'https://cdn.jsdelivr.net/gh/udit-001/india-maps-data@main/geojson/india.geojson'

export const INDIA_MAP_NAME = 'india'

type GeoFeature = { properties?: { st_nm?: string } }

let indiaMapPromise: Promise<string[]> | null = null

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
      const geojson = await res.json()
      echarts.registerMap(INDIA_MAP_NAME, geojson)
      return ((geojson.features ?? []) as GeoFeature[])
        .map((f) => f.properties?.st_nm)
        .filter((n): n is string => Boolean(n))
    })()
    indiaMapPromise.catch(() => {
      indiaMapPromise = null
    })
  }
  return indiaMapPromise
}
