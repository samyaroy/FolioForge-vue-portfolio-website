import { useEffect, useRef, useState } from 'react'
import * as echarts from 'echarts'
import {
  tripStops,
  type TransportMode,
  type Trip,
  type TripStop,
} from '../../../content/travel/trips'
import { geocodeCities } from './geocode'
import {
  fetchLegGeometry,
  simplifyLine,
  type LegCoords,
} from './routeGeometry'
import {
  INDIA_MAP_NAME,
  loadIndiaMap,
  loadIndiaStateBorders,
} from './indiaMap'

type LocatedStop = TripStop & { lat: number; lng: number }

const ROUTE_COLOR = '#1980e6'
const STOP_COLOR = '#ef4444'
const WATER_COLOR = '#e0f2fe'
const LAND_COLOR = '#f8fafc'

type LineType = 'solid' | 'dashed' | 'dotted' | number[]

// Each leg is drawn in the style of its transport: roads are wide asphalt
// with a dashed centre line, railways a dark bed with sleeper dashes on top,
// flights a dashed arc, walks a dotted trail, ferries a dash-dot water line.
type LegStyle = {
  curveness: number
  base: { color: string; width: number; type: LineType; opacity: number }
  /** Second pass drawn over the base line (road centre line / sleepers). */
  overlay?: { color: string; width: number; type: LineType }
  effect: { symbolSize: number; trailLength: number }
}

const LEG_STYLES = {
  flight: {
    curveness: 0.3,
    base: { color: ROUTE_COLOR, width: 2, type: 'dashed', opacity: 0.75 },
    effect: { symbolSize: 9, trailLength: 0.6 },
  },
  rail: {
    curveness: 0.06,
    base: { color: '#334155', width: 3.5, type: 'solid', opacity: 0.85 },
    overlay: { color: '#f8fafc', width: 1.5, type: [4, 5] },
    effect: { symbolSize: 7, trailLength: 0.25 },
  },
  road: {
    curveness: 0.06,
    base: { color: '#64748b', width: 4.5, type: 'solid', opacity: 0.9 },
    overlay: { color: '#facc15', width: 1.2, type: [6, 6] },
    effect: { symbolSize: 7, trailLength: 0.25 },
  },
  ferry: {
    curveness: 0.1,
    base: { color: '#0891b2', width: 2, type: [8, 3, 2, 3], opacity: 0.8 },
    effect: { symbolSize: 7, trailLength: 0.4 },
  },
  foot: {
    curveness: 0.06,
    base: { color: '#92400e', width: 2.5, type: 'dotted', opacity: 0.9 },
    effect: { symbolSize: 5, trailLength: 0.2 },
  },
  default: {
    curveness: 0.08,
    base: { color: ROUTE_COLOR, width: 2, type: 'solid', opacity: 0.55 },
    effect: { symbolSize: 8, trailLength: 0.6 },
  },
} satisfies Record<string, LegStyle>

type LegStyleKey = keyof typeof LEG_STYLES

const MODE_STYLE_KEY: Record<TransportMode, LegStyleKey> = {
  flight: 'flight',
  train: 'rail',
  bus: 'road',
  car: 'road',
  ferry: 'ferry',
  foot: 'foot',
}

/**
 * Resolve every stop to coordinates: explicit lat/lng from the yml wins,
 * the rest go through the (cached) geocoder. Unresolvable stops are dropped.
 * Only coordinates are taken from the lookup — a round trip visits the same
 * name twice with different modes, and each stop must keep its own fields.
 */
async function locateStops(stops: TripStop[]): Promise<LocatedStop[]> {
  const needsLookup = stops.filter((s) => s.lat == null || s.lng == null)
  const found = await geocodeCities(needsLookup)
  const coordsByName = new Map(
    found.map((s) => [s.name, { lat: s.lat, lng: s.lng }]),
  )
  return stops
    .map((s): LocatedStop | undefined => {
      if (s.lat != null && s.lng != null) return s as LocatedStop
      const coords = coordsByName.get(s.name)
      return coords ? { ...s, ...coords } : undefined
    })
    .filter((s): s is LocatedStop => s != null)
}

function tooltipFormatter(params: unknown): string {
  const p = params as {
    seriesType?: string
    name: string
    data?: { mode?: string; note?: string; legLabel?: string }
  }
  if (p.seriesType === 'lines') {
    return p.data?.legLabel ?? ''
  }
  const lines = [`<strong>${p.name}</strong>`]
  if (p.data?.mode) lines.push(`arrived by ${p.data.mode}`)
  if (p.data?.note) lines.push(`<em>${p.data.note}</em>`)
  return lines.join('<br/>')
}

// Rough extent of the registered India GeoJSON; used to convert the route's
// bounding box into a geo zoom factor relative to the full-map view.
const INDIA_VIEW = { minLng: 68, maxLng: 97.5, minLat: 6.5, maxLat: 37.2 }

// Journey pacing. The camera is fixed from the first paint (framed on the
// destination stops); a single arrow then walks the route leg by leg:
// LEG_TRAVEL_MS to fly a leg, then the arrival's name lingers LEG_DWELL_MS
// before the arrow departs again. After the last stop every name is dropped
// and the arrow retires — the itinerary plays exactly once.
const JOURNEY_START_MS = 600
const LEG_TRAVEL_MS = 1500
const LEG_DWELL_MS = 900

/**
 * Camera that frames the route: bounding box of the stops plus padding
 * (with a minimum span so two nearby cities don't zoom in absurdly far).
 */
function routeCamera(stops: LocatedStop[]): {
  center: [number, number]
  zoom: number
} {
  const lngs = stops.map((s) => s.lng)
  const lats = stops.map((s) => s.lat)
  const padLng = Math.max((Math.max(...lngs) - Math.min(...lngs)) * 0.4, 1.5)
  const padLat = Math.max((Math.max(...lats) - Math.min(...lats)) * 0.4, 1.5)
  const spanLng = Math.max(...lngs) - Math.min(...lngs) + padLng * 2
  const spanLat = Math.max(...lats) - Math.min(...lats) + padLat * 2
  return {
    center: [
      (Math.min(...lngs) + Math.max(...lngs)) / 2,
      (Math.min(...lats) + Math.max(...lats)) / 2,
    ],
    zoom: Math.max(
      1,
      Math.min(
        (INDIA_VIEW.maxLng - INDIA_VIEW.minLng) / spanLng,
        (INDIA_VIEW.maxLat - INDIA_VIEW.minLat) / spanLat,
      ),
    ),
  }
}

/**
 * What the journey animation currently shows: how many legs are drawn, how
 * many stops have been reached (their dots exist), which stop's name is up
 * (null: none), and which leg the single arrow is flying (null: no arrow).
 */
type JourneyView = {
  revealed: number
  reached: number
  labeled: number | null
  active: number | null
}

/**
 * Every chart series: state borders, the revealed route legs, and the stop
 * markers, per the given journey view. Series are stable by name and only
 * ever added to, so renders merge by name — no series is torn down, which
 * keeps the one-shot arrow effects from restarting on unrelated updates.
 * `legGeoms` (aligned with the legs, i.e. stops[1..]) carries real route
 * polylines where a router resolved them; legs without one draw the styled
 * straight line between their two stops.
 */
function buildSeries(
  stops: LocatedStop[],
  stateBorders: number[][][],
  legGeoms: (LegCoords | null)[],
  view: JourneyView,
): object[] {
  const legSeries = stops.slice(1, view.revealed + 1).flatMap((to, i) => {
    const from = stops[i]
    const key: LegStyleKey = to.mode ? MODE_STYLE_KEY[to.mode] : 'default'
    const style = LEG_STYLES[key] as LegStyle
    // Ground legs render in polyline mode so they can carry full route
    // geometry (a 2-point fallback still draws straight). Flights keep the
    // 2-point mode, where curveness bends the leg into its arc.
    const polyline = key !== 'flight'
    const coords = legGeoms[i] ?? [
      [from.lng, from.lat],
      [to.lng, to.lat],
    ]
    const series: object[] = [
      {
        name: `Route leg ${i + 1}`,
        type: 'lines',
        coordinateSystem: 'geo',
        polyline,
        data: [
          {
            coords,
            legLabel: `${from.name} → ${to.name}${to.mode ? ` · ${to.mode}` : ''}`,
          },
        ],
        lineStyle: { ...style.base, curveness: style.curveness },
        // The single travelling arrow: shown only on the active leg, flying
        // it exactly once (the journey scheduler activates each leg in turn
        // and retires the arrow after the final arrival).
        effect: {
          show: i === view.active,
          period: LEG_TRAVEL_MS / 1000,
          loop: false,
          trailLength: style.effect.trailLength,
          symbol: 'arrow',
          symbolSize: style.effect.symbolSize,
          color: style.base.color,
        },
        zlevel: 1,
        z: 2,
      },
    ]
    if (style.overlay) {
      series.push({
        name: `Route leg ${i + 1} overlay`,
        type: 'lines',
        coordinateSystem: 'geo',
        silent: true,
        polyline,
        data: [{ coords }],
        // Must share the base pass's curveness so the two lines coincide.
        lineStyle: { ...style.overlay, curveness: style.curveness },
        zlevel: 1,
        z: 3,
      })
    }
    return series
  })

  return [
    {
      // Solid inter-state boundaries, computed from the district geometry,
      // drawn over the dotted district mesh but under the route.
      name: 'State borders',
      type: 'lines',
      coordinateSystem: 'geo',
      silent: true,
      polyline: true,
      data: stateBorders.map((coords) => ({ coords })),
      lineStyle: { color: '#475569', width: 1.1, opacity: 0.75 },
      zlevel: 0,
      z: 4,
    },
    ...legSeries,
    {
      // Dots pop in as the arrow reaches them; only the just-reached stop
      // shows its name (per-datum label), and the final state shows none —
      // hovering a dot still names it via the tooltip.
      name: 'Stops',
      type: 'effectScatter',
      coordinateSystem: 'geo',
      rippleEffect: { brushType: 'stroke', scale: 3 },
      symbolSize: 9,
      itemStyle: {
        color: STOP_COLOR,
        shadowBlur: 4,
        shadowColor: 'rgba(0,0,0,0.25)',
      },
      label: {
        show: false,
        formatter: '{b}',
        position: 'right',
        fontSize: 11,
        color: '#0e141b',
        textBorderColor: '#ffffff',
        textBorderWidth: 2,
      },
      data: stops.slice(0, view.reached).map((s, i) => ({
        name: s.name,
        value: [s.lng, s.lat],
        mode: s.mode,
        note: s.note,
        label: { show: i === view.labeled },
      })),
      zlevel: 2,
    },
  ]
}

function buildOption(
  stops: LocatedStop[],
  frameStops: LocatedStop[],
  stateBorders: number[][][],
  legGeoms: (LegCoords | null)[],
  view: JourneyView,
): echarts.EChartsCoreOption {
  const camera = routeCamera(frameStops)
  return {
    backgroundColor: WATER_COLOR,
    tooltip: {
      trigger: 'item',
      confine: true,
      borderColor: '#e2e8f0',
      textStyle: { color: '#0e141b', fontSize: 12 },
      formatter: tooltipFormatter,
    },
    // All three layers are framed on the route from the first paint — the
    // camera never moves; only the route animates.
    //
    // Fills and strokes are split into separate layers: when a single layer
    // draws fill+stroke per district, each district's opaque fill paints
    // over the stroke its neighbour already drew, wiping out the thin
    // dotted dividers. A stroke-only pass above every fill keeps them crisp.
    geo: [
      {
        // District borders on top: the registered GeoJSON is district-
        // granularity, so every internal edge renders as a subtle dotted
        // divider. State borders are drawn separately (solid, darker) by
        // the "State borders" lines series so the two read differently.
        map: INDIA_MAP_NAME,
        nameProperty: 'st_nm',
        silent: true,
        z: 3,
        aspectScale: 0.9,
        ...camera,
        itemStyle: {
          areaColor: 'transparent',
          borderColor: 'rgba(100,116,139,0.35)',
          borderWidth: 0.6,
          borderType: 'dotted',
        },
      },
      {
        // Land fill, borderless.
        map: INDIA_MAP_NAME,
        nameProperty: 'st_nm',
        silent: true,
        z: 2,
        aspectScale: 0.9,
        ...camera,
        itemStyle: {
          areaColor: LAND_COLOR,
          borderColor: 'transparent',
          borderWidth: 0,
        },
      },
      {
        // Coastline layer behind: same geometry with a thick solid stroke;
        // only its outer edge shows past the opaque land above, tracing the
        // international boundary against the water.
        map: INDIA_MAP_NAME,
        nameProperty: 'st_nm',
        silent: true,
        z: 1,
        aspectScale: 0.9,
        ...camera,
        itemStyle: {
          areaColor: 'transparent',
          borderColor: '#64748b',
          borderWidth: 2.2,
        },
      },
    ],
    series: buildSeries(stops, stateBorders, legGeoms, view),
  }
}

type TripRouteMapProps = {
  trip: Trip
}

/**
 * Animated route map for the trip details page. The camera frames the
 * destination stops up front and never moves; a single arrow then travels
 * the route leg by leg — exactly once — revealing each stop's dot and
 * (briefly) its name as it arrives. Falls into an error state when fewer
 * than two stops can be located.
 */
export function TripRouteMap({ trip }: TripRouteMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')

  useEffect(() => {
    let cancelled = false
    const timers: number[] = []
    const el = containerRef.current
    if (!el) return

    const chart = echarts.init(el)
    const onResize = () => chart.resize()
    window.addEventListener('resize', onResize)

    async function load() {
      try {
        const [, stops, stateBorders] = await Promise.all([
          loadIndiaMap(),
          locateStops(tripStops(trip)),
          loadIndiaStateBorders(),
        ])
        if (cancelled) return
        if (stops.length < 2) throw new Error('fewer than two locatable stops')

        const legCount = stops.length - 1
        const legGeoms: (LegCoords | null)[] = stops.slice(1).map(() => null)
        // The frame is resolved from the destination stops only — places
        // written as bare names in the yml (the faraway origin, usually) are
        // excluded, so the camera stays on the area the trip is about.
        // Matching is by case-insensitive name, so a return leg to the
        // origin ("kolkata" after a bare "Kolkata") stays out of the frame.
        const bareNames = new Set(
          (trip.places ?? [])
            .filter((p): p is string => typeof p === 'string')
            .map((p) => p.toLowerCase()),
        )
        const framed = stops.filter(
          (s) => !bareNames.has(s.name.toLowerCase()),
        )
        const frameStops = framed.length ? framed : stops
        // First paint: camera already framing the route, only the start dot
        // (named). Everything after is a series-only merge — the geo layers
        // are never touched again, so nothing zooms or pans.
        const view: JourneyView = {
          revealed: 0,
          reached: 1,
          labeled: 0,
          active: null,
        }
        chart.setOption(
          buildOption(stops, frameStops, stateBorders, legGeoms, view),
        )
        setStatus('ready')

        const render = () => {
          chart.setOption({
            series: buildSeries(stops, stateBorders, legGeoms, view),
          })
        }
        const at = (ms: number, step: () => void) => {
          timers.push(
            window.setTimeout(() => {
              if (cancelled) return
              step()
              render()
            }, ms),
          )
        }

        // The journey: for each leg, the arrow departs (previous name goes,
        // dot stays), flies the leg, and on arrival the reached stop pops in
        // with its name for the dwell.
        const stepMs = LEG_TRAVEL_MS + LEG_DWELL_MS
        for (let leg = 0; leg < legCount; leg++) {
          const departMs = JOURNEY_START_MS + leg * stepMs
          at(departMs, () => {
            view.revealed = leg + 1
            view.labeled = null
            view.active = leg
          })
          at(departMs + LEG_TRAVEL_MS, () => {
            view.reached = leg + 2
            view.labeled = leg + 1
            view.active = null
          })
        }
        // Journey done: drop every name and retire the arrow — one full
        // itinerary pass only. Dots and route lines stay.
        at(JOURNEY_START_MS + legCount * stepMs, () => {
          view.labeled = null
          view.active = null
        })

        // Legs upgrade from straight lines to real route geometry (roads,
        // treks, rail tracks) as the routers answer; a failed lookup keeps
        // the straight fallback. Geometry is thinned to what the fixed zoom
        // can resolve, so hairpin roads read as a line, not a scribble.
        const geomTolerance =
          (INDIA_VIEW.maxLng - INDIA_VIEW.minLng) /
          routeCamera(frameStops).zoom /
          400
        stops.slice(1).forEach((to, i) => {
          fetchLegGeometry(stops[i], to).then((coords) => {
            if (cancelled || !coords) return
            legGeoms[i] = simplifyLine(coords, geomTolerance)
            render()
          })
        })
      } catch (err) {
        console.error('Failed to load trip route map', err)
        if (!cancelled) setStatus('error')
      }
    }
    load()

    return () => {
      cancelled = true
      timers.forEach((timer) => window.clearTimeout(timer))
      window.removeEventListener('resize', onResize)
      chart.dispose()
    }
  }, [trip])

  return (
    <div>
      <div ref={containerRef} className="h-105 w-full bg-white" />
      {status === 'loading' && (
        <p className="mt-2 text-sm text-muted">Loading route…</p>
      )}
      {status === 'error' && (
        <p className="mt-2 text-sm text-[#dc2626]">
          Could not load the route map. Please try again later.
        </p>
      )}
    </div>
  )
}
