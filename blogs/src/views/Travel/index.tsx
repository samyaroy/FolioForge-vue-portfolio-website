import { useEffect, useMemo, useRef, useState } from 'react'
import * as echarts from 'echarts'
import { PostCard } from '../Blogs/components/PostCard'
import { posts } from '../../lib/posts'
import { TRAVEL_SECTION } from '../../content/sections'
import { PAGE_DESCRIPTIONS } from '../../content/descriptions'
import { isPageDescriptionEnabled } from '../../config/featureFlags'
import {
  CITIES_PER_STATE,
  CITY_VISITS,
  STATE_VISITS,
  TRAVEL_LEGEND_LABELS,
  type Purpose,
} from '../../content/travel/data'
import { TRIPS, type Trip } from '../../content/travel/trips'
import { TripCard } from './components/TripCard'
import {
  INTRO_SECTION_CLASS,
  INTRO_TEXT_CLASS,
  INTRO_TITLE_CLASS,
  POST_LIST_CLASS,
} from '../../lib/ui'
import { geocodeCities, type GeoCity } from './components/geocode'
import { INDIA_MAP_NAME, loadIndiaMap } from './components/indiaMap'

const LEGEND_ROW_CLASS = 'inline-flex items-center gap-[0.35rem]'
const LEGEND_HATCH_CLASS =
  'inline-block size-3 rounded-[3px] border border-border bg-[#f1f5f9]'

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

// Trip cards are sectioned under year dividers (mirroring the portfolio's
// conferences tab). Input is already sorted newest-first, so consecutive
// trips of the same year collapse into one group.
function groupTripsByYear(trips: Trip[]): { year: string; trips: Trip[] }[] {
  return trips.reduce<{ year: string; trips: Trip[] }[]>((groups, trip) => {
    // The YAML loader hands dates over as Date objects at runtime (the Trip
    // type says string), so go through the Date constructor for the year.
    const year = String(new Date(trip.date).getFullYear())
    const last = groups[groups.length - 1]
    if (last?.year === year) {
      last.trips.push(trip)
    } else {
      groups.push({ year, trips: [trip] })
    }
    return groups
  }, [])
}

// How many trip cards are shown initially and added per "See more" click.
const TRIPS_PAGE_SIZE = 7

const byState = new Map(STATE_VISITS.map((s) => [s.state, s]))
const homeState = STATE_VISITS.find((s) => s.home)?.state
const homeCity = CITY_VISITS.find((c) => c.home && !c.stayed)?.name
const stayedCities = CITY_VISITS.filter((c) => c.stayed).map((c) => c.name)

// The home city is marked with a pin (vs plain dots for other cities).
const HOME_CITY_COLOR = '#f59e0b'
const STAYED_CITY_COLOR = '#2563eb'

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
    const d =
      p.data as
        | { visits?: number; home?: boolean; stayed?: boolean; stayReason?: string }
        | undefined
    if (d?.stayed) {
      const reason = d.stayReason ? `<br/><em>${d.stayReason}</em>` : ''
      return `<strong>${p.name}</strong><br/>${TRAVEL_LEGEND_LABELS.stayedTooltip}${reason}`
    }
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
  return lines.join('<br/>')
}

// Shared placement for both geo layers (choropleth + border outline) so they
// always overlap exactly. Slightly below center so the top isn't clipped.
const MAP_LAYOUT_CENTER = ['50%', '52%']
const MAP_LAYOUT_SIZE = '108%'

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
        layoutCenter: MAP_LAYOUT_CENTER,
        layoutSize: MAP_LAYOUT_SIZE,
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
        layoutCenter: MAP_LAYOUT_CENTER,
        layoutSize: MAP_LAYOUT_SIZE,
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
        // Hover feedback is the tooltip alone; no name label beside the dot.
        emphasis: { scale: 1.4 },
        data: cities
          .filter((c) => !c.home && !c.stayed)
          .map((c) => ({
            name: c.name,
            value: [c.lng, c.lat, c.visits ?? 1],
            visits: c.visits ?? 1,
          })),
        zlevel: 1,
      },
      {
        name: TRAVEL_LEGEND_LABELS.stayed,
        type: 'scatter',
        coordinateSystem: 'geo',
        symbol: 'circle',
        symbolSize: 6,
        itemStyle: {
          color: STAYED_CITY_COLOR,
          borderColor: '#ffffff',
          borderWidth: 1.2,
          shadowBlur: 4,
          shadowColor: 'rgba(0,0,0,0.25)',
        },
        emphasis: { scale: 1.4 },
        data: cities
          .filter((c) => c.stayed)
          .map((c) => ({
            name: c.name,
            value: [c.lng, c.lat],
            stayed: true,
            stayReason: c.stayReason,
            home: c.home,
          })),
        zlevel: 2,
      },
      {
        // The home city gets a distinct pin marker, drawn on top of the dots.
        name: TRAVEL_LEGEND_LABELS.homeCity,
        type: 'scatter',
        coordinateSystem: 'geo',
        symbol: 'pin',
        symbolSize: 24,
        // Anchor the pin's tip on the coordinate.
        symbolOffset: [0, '-45%'],
        itemStyle: {
          color: HOME_CITY_COLOR,
          borderColor: '#7c2d12',
          borderWidth: 1,
          shadowBlur: 5,
          shadowColor: 'rgba(0,0,0,0.35)',
        },
        emphasis: { scale: 1.3 },
        data: cities
          .filter((c) => c.home && !c.stayed)
          .map((c) => ({
            name: c.name,
            value: [c.lng, c.lat],
            home: true,
          })),
        zlevel: 2,
      },
      {
        name: TRAVEL_LEGEND_LABELS.homeCityCenter,
        type: 'scatter',
        coordinateSystem: 'geo',
        symbol: 'circle',
        symbolSize: 6.5,
        symbolOffset: [0, -13],
        silent: true,
        itemStyle: {
          color: '#ffffff',
          borderColor: '#7c2d12',
          borderWidth: 0.8,
        },
        data: cities
          .filter((c) => c.home && !c.stayed)
          .map((c) => ({
            name: c.name,
            value: [c.lng, c.lat],
          })),
        zlevel: 3,
      },
    ],
  }
}

export function TravelPage() {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const chartRef = useRef<echarts.ECharts | null>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [visibleTrips, setVisibleTrips] = useState(TRIPS_PAGE_SIZE)
  const showPageDescription = isPageDescriptionEnabled('travel')

  const tripGroups = useMemo(
    () => groupTripsByYear(TRIPS.slice(0, visibleTrips)),
    [visibleTrips],
  )

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

    // The pane is flex-sized on desktop, so watch the container itself
    // (covers window resizes and the loading note appearing/disappearing).
    const observer = new ResizeObserver(() => chart.resize())
    observer.observe(el)

    async function load() {
      try {
        // Map geometry and city coordinates are fetched in parallel.
        const [allStates, cities] = await Promise.all([
          loadIndiaMap(),
          geocodeCities(CITY_VISITS),
        ])
        if (cancelled) return
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
      observer.disconnect()
      chart.dispose()
      chartRef.current = null
    }
  }, [])

  return (
    <div className="ml-[50%] grid w-[min(calc(100vw-1.5rem),84rem)] -translate-x-1/2 grid-cols-1 gap-3 min-[900px]:grid-cols-[55fr_45fr] min-[900px]:items-start">
      <div className="min-w-0">
        <section className={`${INTRO_SECTION_CLASS} mb-4!`}>
          <h1 className={`${INTRO_TITLE_CLASS} [view-transition-name:travel-title]`}>
            {TRAVEL_SECTION.title}
          </h1>
          {showPageDescription && (
            <p className={INTRO_TEXT_CLASS}>{PAGE_DESCRIPTIONS.travel}</p>
          )}
        </section>

        {travelPosts.length > 0 && (
          <div className={POST_LIST_CLASS}>
            {travelPosts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        )}

        {TRIPS.length > 0 && (
          <div className="mt-2 flex flex-col gap-10">
            {tripGroups.map((group) => (
              <div key={group.year}>
                <div className="mb-5 flex items-center gap-4">
                  <span className="text-lg font-semibold text-faint">
                    {group.year}
                  </span>
                  <div className="h-px flex-1 bg-border" />
                </div>
                <div className="flex flex-col gap-6">
                  {group.trips.map((trip) => (
                    <TripCard key={trip.id} trip={trip} />
                  ))}
                </div>
              </div>
            ))}

            {visibleTrips < TRIPS.length && (
              <button
                type="button"
                onClick={() => setVisibleTrips((n) => n + TRIPS_PAGE_SIZE)}
                className="self-end text-sm font-normal text-primary transition-colors duration-200 hover:text-ink"
              >
                See more →
              </button>
            )}
          </div>
        )}
      </div>

      <section
        className="relative rounded-xl border border-border bg-surface p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] [view-transition-name:travel-map] min-[900px]:sticky min-[900px]:top-19 min-[900px]:flex min-[900px]:h-[calc(110vh-4.4rem)] min-[900px]:flex-col min-[900px]:overflow-hidden"
        aria-label="Map of states visited in India"
      >
        <div className="mb-2">
          <h2 className="text-lg font-bold text-ink">{TRAVEL_SECTION.mapTitle}</h2>

          <div className="absolute top-[0.85rem] right-4 z-2 flex flex-col items-end gap-[0.3rem] rounded-lg border border-border bg-[rgba(255,255,255,0.85)] px-[0.6rem] py-2 text-right text-[0.72rem] text-muted backdrop-blur-[2px]">
            <span className={LEGEND_ROW_CLASS}>
              <span>{COUNT_LABELS[0]}</span>
              <span className="inline-flex overflow-hidden rounded-[3px] border border-border">
                {COUNT_PALETTE.map((c) => (
                  <i
                    key={c}
                    className="block h-2.5 w-3.25"
                    style={{ background: c }}
                  />
                ))}
              </span>
              <span>
                {COUNT_LABELS[COUNT_LABELS.length - 1]}{' '}
                {TRAVEL_LEGEND_LABELS.citiesSuffix}
              </span>
            </span>

            <span className={LEGEND_ROW_CLASS}>
              <span
                className={`${LEGEND_HATCH_CLASS} bg-[repeating-linear-gradient(45deg,rgba(15,23,42,0.55)_0_1px,transparent_1px_3px)]`}
              />
              {TRAVEL_LEGEND_LABELS.academic}
            </span>
            <span className={LEGEND_ROW_CLASS}>
              <span
                className={`${LEGEND_HATCH_CLASS} bg-[repeating-linear-gradient(-45deg,rgba(15,23,42,0.55)_0_1px,transparent_1px_3px)]`}
              />
              {TRAVEL_LEGEND_LABELS.travel}
            </span>
            <span className={LEGEND_ROW_CLASS}>
              <span
                className={`${LEGEND_HATCH_CLASS} bg-[radial-gradient(rgba(15,23,42,0.6)_0.5px,transparent_0.6px)] bg-size-[3px_3px]`}
              />
              {TRAVEL_LEGEND_LABELS.both}
            </span>

            {homeState && (
              <span className={LEGEND_ROW_CLASS}>
                <span style={{ background: HOME_COLOR }} />
                {TRAVEL_LEGEND_LABELS.homeState} ({homeState})
              </span>
            )}

            <span className={LEGEND_ROW_CLASS}>
              <span className="inline-block size-2.5 rounded-full border-[1.5px] border-white bg-[#ef4444] shadow-[0_0_0_1px_rgba(15,23,42,0.15)]" />
              {TRAVEL_LEGEND_LABELS.cityVisited}
            </span>

            {stayedCities.length > 0 && (
              <span className={LEGEND_ROW_CLASS}>
                <span className="inline-block size-2.5 rounded-full border-[1.5px] border-white bg-[#2563eb] shadow-[0_0_0_1px_rgba(15,23,42,0.15)]" />
                {TRAVEL_LEGEND_LABELS.stayed}
              </span>
            )}

            {homeCity && (
              <span className={LEGEND_ROW_CLASS}>
                <svg
                  className="inline-block h-3 w-2.25"
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
                {TRAVEL_LEGEND_LABELS.homeCity} ({homeCity})
              </span>
            )}
          </div>
        </div>

        <div className="h-[calc(92vh-1cm)] min-h-[calc(600px-1cm)] w-full overflow-hidden bg-white min-[900px]:h-auto min-[900px]:min-h-0 min-[900px]:flex-1">
          <div
            className="h-[92vh] min-h-150 w-full bg-white min-[900px]:h-full min-[900px]:min-h-0"
            ref={containerRef}
          />
        </div>
        <p className="mt-[0.65rem] text-left text-xs leading-normal text-faint">
          {TRAVEL_SECTION.mapAttribution}
        </p>

        {status === 'loading' && (
          <p className="mt-2 text-sm text-muted">Loading map…</p>
        )}
        {status === 'error' && (
          <p className="mt-2 text-sm text-[#dc2626]">
            Could not load the map data. Please try again later.
          </p>
        )}
      </section>
    </div>
  )
}
