import { useEffect, useMemo, useRef, useState } from 'react'
import * as echarts from 'echarts'
import { PostCard } from '../../components/PostCard'
import { posts } from '../../lib/posts'
import {
  CITIES_PER_STATE,
  CITY_VISITS,
  STATE_VISITS,
  type Purpose,
} from './data'
import { geocodeCities, type GeoCity } from './geocode'

// India boundaries pulled from a maintained, post-2019 dataset (Ladakh & J&K
// split, current names) served over a CDN — no GeoJSON is vendored in-repo.
const INDIA_GEOJSON_URL =
  'https://cdn.jsdelivr.net/gh/udit-001/india-maps-data@main/geojson/india.geojson'
const INDIA_MAP_NAME = 'india'

const PURPOSE_LABEL: Record<Purpose, string> = {
  academic: 'Academic',
  travel: 'Travel',
  both: 'Academic + Travel',
}

// States are shaded by how many cities I've visited there, using a fixed
// diverging palette (brown → cream → teal) applied as discrete count buckets.
const COUNT_PALETTE = [
  '#703a00',
  '#bd944d',
  '#ecdbaf',
  '#f5f7ea',
  '#b9e4dd',
  '#52a8a0',
  '#03524b',
]
// Upper bound (inclusive) of each bucket; anything higher falls in the last.
const COUNT_UPPER = [1, 2, 3, 4, 5, 6]
const COUNT_LABELS = ['1', '2', '3', '4', '5', '6', '7+']

const NOT_VISITED = '#ffffff'

// Purpose is annotated with hatching (rendered directly on geo.regions):
// academic is one diagonal, travel the other, and "both" is cross-hatch.
const DECAL_BASE = {
  color: 'rgba(15, 23, 42, 0.26)',
  dashArrayX: [1, 0] as number[],
  dashArrayY: [4, 4] as number[],
  symbolSize: 1,
}
const DECAL_ACADEMIC = { ...DECAL_BASE, rotation: Math.PI / 4 } // ╱
const DECAL_TRAVEL = { ...DECAL_BASE, rotation: -Math.PI / 4 } // ╲

// "both" = a woven grid (dashes on both axes) — a single decal can't draw two
// line directions, so this checker reads as a distinct "combined" texture.
const DECAL_BOTH = {
  color: 'rgba(15, 23, 42, 0.3)',
  symbol: 'rect',
  dashArrayX: [2, 4] as number[],
  dashArrayY: [2, 4] as number[],
  symbolSize: 1,
  rotation: Math.PI / 4,
}

const PURPOSE_DECAL: Record<Purpose, object> = {
  academic: DECAL_ACADEMIC,
  travel: DECAL_TRAVEL,
  both: DECAL_BOTH,
}

// The home state is painted a distinct colour (deliberately outside the count
// palette and the red city markers) so it stands apart at a glance.
const HOME_COLOR = '#7c3aed'

const byState = new Map(STATE_VISITS.map((s) => [s.state, s]))
const homeState = STATE_VISITS.find((s) => s.home)?.state
const homeCity = CITY_VISITS.find((c) => c.home)?.name

// The home city is marked with a pin (vs plain dots for other cities).
const HOME_CITY_COLOR = '#f59e0b'

function bucketFor(count: number): number {
  const i = COUNT_UPPER.findIndex((u) => count <= u)
  return i === -1 ? COUNT_PALETTE.length - 1 : i
}

function colorFor(state: string): string {
  if (!byState.has(state)) return NOT_VISITED
  return COUNT_PALETTE[bucketFor(CITIES_PER_STATE[state] ?? 0)]
}

function tooltipFormatter(params: unknown): string {
  const p = params as {
    seriesType?: string
    name: string
    data?: { visits?: number }
  }
  if (p.seriesType === 'scatter') {
    const d = p.data as { visits?: number; home?: boolean } | undefined
    if (d?.home) {
      return `<strong>${p.name}</strong><br/>⭐ <em>home city</em>`
    }
    const v = d?.visits ?? 0
    return `<strong>${p.name}</strong><br/>${v} visit${v === 1 ? '' : 's'}`
  }
  const s = byState.get(p.name)
  if (!s) {
    return `<strong>${p.name}</strong><br/><span style="color:#94a3b8">Not visited yet</span>`
  }
  const homeTag = s.home ? ' 🏠 <em>home state</em>' : ''
  const cities = CITIES_PER_STATE[p.name] ?? 0
  const lines = [`<strong>${p.name}</strong>${homeTag}`]
  if (cities > 0) {
    lines.push(`Cities visited: ${cities}`)
  }
  lines.push(`Purpose: ${PURPOSE_LABEL[s.purpose]}`)
  return lines.join('<br/>')
}

function buildOption(
  cities: GeoCity[],
  allStates: string[],
): echarts.EChartsCoreOption {
  return {
    backgroundColor: '#ffffff',
    tooltip: {
      trigger: 'item',
      confine: true,
      borderColor: '#e2e8f0',
      textStyle: { color: '#0e141b', fontSize: 12 },
      formatter: tooltipFormatter,
    },
    geo: [
      {
        // Choropleth layer (on top). Opaque fills cover the dark internal
        // borders of the outline layer below, so only the international
        // boundary ends up dark. The CDN GeoJSON names states under `st_nm`.
        map: INDIA_MAP_NAME,
        nameProperty: 'st_nm',
        z: 3,
        tooltip: { show: true, formatter: tooltipFormatter },
        // Zoom in to make better use of the (now taller) pane width.
        layoutCenter: ['50%', '46%'],
        layoutSize: '108%',
        // Mild horizontal stretch (default 0.75 squeezes longitude; higher widens).
        aspectScale: 0.9,
        itemStyle: {
          areaColor: NOT_VISITED,
          borderColor: '#cbd5e1',
          borderWidth: 0.6,
        },
        emphasis: {
          label: { show: false },
          itemStyle: {
            areaColor: '#fde68a',
            borderColor: '#475569',
            borderWidth: 1,
          },
        },
        select: { disabled: true },
        // Choropleth fills, computed in JS — reliable across versions.
        // The home state is painted its own distinct colour instead.
        regions: STATE_VISITS.map((s) => ({
          name: s.state,
          itemStyle: {
            areaColor: s.home ? HOME_COLOR : colorFor(s.state),
            ...(s.home
              ? { borderColor: '#4c1d95', borderWidth: 1.4 }
              : {}),
          },
        })),
      },
      {
        // International-border layer (behind): same geometry, thick dark
        // stroke, no fill. Only its outer edge shows past the choropleth above.
        map: INDIA_MAP_NAME,
        nameProperty: 'st_nm',
        z: 1,
        silent: true,
        layoutCenter: ['50%', '46%'],
        layoutSize: '108%',
        aspectScale: 0.9,
        itemStyle: {
          areaColor: 'transparent',
          borderColor: '#0f172a',
          borderWidth: 3,
        },
      },
    ],
    series: [
      {
        // Purpose hatching lives on this map series (geo.regions can't render
        // decals). It spans every state so that, as the topmost interactive
        // layer, its tooltip/hover name all regions — including not-visited
        // ones — while the transparent fill keeps the choropleth colour below.
        name: 'Purpose',
        type: 'map',
        geoIndex: 0,
        emphasis: {
          label: { show: false },
          itemStyle: { areaColor: 'rgba(253, 230, 138, 0.85)' },
        },
        data: allStates.map((name) => {
          const v = byState.get(name)
          return {
            name,
            itemStyle: {
              areaColor: 'rgba(0, 0, 0, 0.003)',
              ...(v ? { decal: PURPOSE_DECAL[v.purpose] } : {}),
            },
          }
        }),
      },
      {
        name: 'Cities',
        type: 'scatter',
        coordinateSystem: 'geo',
        symbolSize: (val: number[]) => 3 + Math.sqrt(val[2] ?? 1) * 2,
        itemStyle: {
          color: '#ef4444',
          borderColor: '#ffffff',
          borderWidth: 1.2,
          shadowBlur: 4,
          shadowColor: 'rgba(0,0,0,0.25)',
        },
        emphasis: {
          scale: 1.4,
          label: { show: true },
        },
        label: {
          show: false,
          formatter: '{b}',
          position: 'right',
          fontSize: 10,
          color: '#0e141b',
        },
        data: cities
          .filter((c) => !c.home)
          .map((c) => ({
            name: c.name,
            value: [c.lng, c.lat, c.visits],
            visits: c.visits,
          })),
        zlevel: 1,
      },
      {
        // The home city gets a distinct pin marker, drawn on top of the dots.
        name: 'Home city',
        type: 'scatter',
        coordinateSystem: 'geo',
        symbol: 'pin',
        symbolSize: 28,
        // Anchor the pin's tip on the coordinate.
        symbolOffset: [0, '-45%'],
        itemStyle: {
          color: HOME_CITY_COLOR,
          borderColor: '#7c2d12',
          borderWidth: 1,
          shadowBlur: 5,
          shadowColor: 'rgba(0,0,0,0.35)',
        },
        emphasis: { scale: 1.3, label: { show: true } },
        label: {
          show: false,
          formatter: '{b}',
          position: 'right',
          fontSize: 10,
          color: '#0e141b',
        },
        data: cities
          .filter((c) => c.home)
          .map((c) => ({
            name: c.name,
            value: [c.lng, c.lat],
            home: true,
          })),
        zlevel: 2,
      },
    ],
  }
}

export function TravelPage() {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const chartRef = useRef<echarts.ECharts | null>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')

  const travelPosts = useMemo(
    () =>
      posts.filter((post) =>
        post.tags.some((tag) => tag.toLowerCase() === 'travel'),
      ),
    [],
  )

  // Register the map + initialise the chart once.
  useEffect(() => {
    let cancelled = false
    const el = containerRef.current
    if (!el) return

    const chart = echarts.init(el)
    chartRef.current = chart

    const onResize = () => chart.resize()
    window.addEventListener('resize', onResize)

    async function load() {
      try {
        // Map geometry and city coordinates are fetched in parallel.
        const [res, cities] = await Promise.all([
          fetch(INDIA_GEOJSON_URL),
          geocodeCities(CITY_VISITS),
        ])
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const geojson = await res.json()
        if (cancelled) return
        echarts.registerMap(INDIA_MAP_NAME, geojson)
        const allStates: string[] = (geojson.features ?? [])
          .map((f: { properties?: { st_nm?: string } }) => f.properties?.st_nm)
          .filter((n: string | undefined): n is string => Boolean(n))
        chart.setOption(buildOption(cities, allStates))
        setStatus('ready')
      } catch (err) {
        console.error('Failed to load India map', err)
        if (!cancelled) setStatus('error')
      }
    }
    load()

    return () => {
      cancelled = true
      window.removeEventListener('resize', onResize)
      chart.dispose()
      chartRef.current = null
    }
  }, [])

  return (
    <div className="travel-layout">
      <div className="travel-layout__main">
        <section className="intro">
          <h1>Travel</h1>
          <p>
            States I have been to for academic work, travel, or both — shaded by
            how many cities I've visited there, with those cities marked on top.
            Hover a state for its purpose and city count.
          </p>
        </section>

        {travelPosts.length > 0 && (
          <div className="post-list">
            {travelPosts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        )}
      </div>

      <section
        className="travel-map travel-layout__map"
        aria-label="Map of states visited in India"
      >
        <div className="travel-map__head">
          <h2>States &amp; cities visited</h2>

          <div className="travel-map__legend">
            <span className="travel-legend__row">
              <span>{COUNT_LABELS[0]}</span>
              <span className="travel-legend__strip">
                {COUNT_PALETTE.map((c) => (
                  <i key={c} style={{ background: c }} />
                ))}
              </span>
              <span>{COUNT_LABELS[COUNT_LABELS.length - 1]} cities</span>
            </span>

            <span className="travel-legend__row">
              <span className="travel-legend__hatch travel-legend__hatch--academic" />
              Academic
            </span>
            <span className="travel-legend__row">
              <span className="travel-legend__hatch travel-legend__hatch--travel" />
              Travel
            </span>
            <span className="travel-legend__row">
              <span className="travel-legend__hatch travel-legend__hatch--both" />
              Both
            </span>

            {homeState && (
              <span className="travel-legend__row">
                <span
                  className="travel-legend__swatch"
                  style={{ background: HOME_COLOR }}
                />
                Home state ({homeState})
              </span>
            )}

            <span className="travel-legend__row">
              <span className="travel-legend__dot" />
              City visited
            </span>

            {homeCity && (
              <span className="travel-legend__row">
                <svg
                  className="travel-legend__pin"
                  viewBox="0 0 24 32"
                  aria-hidden="true"
                >
                  <path
                    d="M12 0C5.4 0 0 5.4 0 12c0 8 12 20 12 20s12-12 12-20C24 5.4 18.6 0 12 0z"
                    fill={HOME_CITY_COLOR}
                    stroke="#7c2d12"
                  />
                  <circle cx="12" cy="12" r="4.5" fill="#fff" />
                </svg>
                Home city ({homeCity})
              </span>
            )}
          </div>
        </div>

        <div className="travel-map__canvas" ref={containerRef} />

        {status === 'loading' && (
          <p className="travel-map__status">Loading map…</p>
        )}
        {status === 'error' && (
          <p className="travel-map__status travel-map__status--error">
            Could not load the map data. Please try again later.
          </p>
        )}
      </section>
    </div>
  )
}
