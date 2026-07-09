import { useEffect, useRef, useState } from 'react'
import * as echarts from 'echarts'
import {
  tripStops,
  type TransportMode,
  type Trip,
  type TripStop,
} from '../../../content/travel/trips'
import { geocodeCities } from './geocode'
import { INDIA_MAP_NAME, loadIndiaMap } from './indiaMap'

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
 */
async function locateStops(stops: TripStop[]): Promise<LocatedStop[]> {
  const needsLookup = stops.filter((s) => s.lat == null || s.lng == null)
  const found = await geocodeCities(needsLookup)
  const byName = new Map(found.map((s) => [s.name, s]))
  return stops
    .map((s) =>
      s.lat != null && s.lng != null ? (s as LocatedStop) : byName.get(s.name),
    )
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

function buildOption(stops: LocatedStop[]): echarts.EChartsCoreOption {
  // Frame the camera on the route: bounding box of the stops plus padding
  // (with a minimum span so two nearby cities don't zoom in absurdly far).
  const lngs = stops.map((s) => s.lng)
  const lats = stops.map((s) => s.lat)
  const padLng = Math.max((Math.max(...lngs) - Math.min(...lngs)) * 0.4, 1.5)
  const padLat = Math.max((Math.max(...lats) - Math.min(...lats)) * 0.4, 1.5)

  const boundingCoords = [
    [Math.min(...lngs) - padLng, Math.max(...lats) + padLat],
    [Math.max(...lngs) + padLng, Math.min(...lats) - padLat],
  ]

  // Group the legs by drawing style so each style becomes one lines series
  // (plus its overlay pass, when the style has one).
  const legsByStyle = new Map<
    LegStyleKey,
    { coords: number[][]; legLabel: string }[]
  >()
  stops.slice(1).forEach((to, i) => {
    const from = stops[i]
    const key: LegStyleKey = to.mode ? MODE_STYLE_KEY[to.mode] : 'default'
    const group = legsByStyle.get(key) ?? []
    group.push({
      coords: [
        [from.lng, from.lat],
        [to.lng, to.lat],
      ],
      legLabel: `${from.name} → ${to.name}${to.mode ? ` · ${to.mode}` : ''}`,
    })
    legsByStyle.set(key, group)
  })

  const legSeries = [...legsByStyle.entries()].flatMap(([key, legs]) => {
    const style = LEG_STYLES[key] as LegStyle
    const series: object[] = [
      {
        name: `Route (${key})`,
        type: 'lines',
        coordinateSystem: 'geo',
        data: legs,
        lineStyle: { ...style.base, curveness: style.curveness },
        // The moving comet that travels each leg — the "live" animation.
        effect: {
          show: true,
          period: 4,
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
        name: `Route (${key}) overlay`,
        type: 'lines',
        coordinateSystem: 'geo',
        silent: true,
        data: legs.map(({ coords }) => ({ coords })),
        // Must share the base pass's curveness so the two lines coincide.
        lineStyle: { ...style.overlay, curveness: style.curveness },
        zlevel: 1,
        z: 3,
      })
    }
    return series
  })

  return {
    backgroundColor: WATER_COLOR,
    tooltip: {
      trigger: 'item',
      confine: true,
      borderColor: '#e2e8f0',
      textStyle: { color: '#0e141b', fontSize: 12 },
      formatter: tooltipFormatter,
    },
    geo: [
      {
        // Land on top: the registered GeoJSON is district-granularity, so
        // every internal edge (district and state alike) renders as a
        // dotted, semi-transparent divider over the opaque land fill.
        map: INDIA_MAP_NAME,
        nameProperty: 'st_nm',
        silent: true,
        z: 2,
        boundingCoords,
        itemStyle: {
          areaColor: LAND_COLOR,
          borderColor: 'rgba(100,116,139,0.45)',
          borderWidth: 0.7,
          borderType: 'dotted',
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
        boundingCoords,
        itemStyle: {
          areaColor: 'transparent',
          borderColor: '#64748b',
          borderWidth: 2.2,
        },
      },
    ],
    series: [
      ...legSeries,
      {
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
          show: true,
          formatter: '{b}',
          position: 'right',
          fontSize: 11,
          color: '#0e141b',
          textBorderColor: '#ffffff',
          textBorderWidth: 2,
        },
        data: stops.map((s) => ({
          name: s.name,
          value: [s.lng, s.lat],
          mode: s.mode,
          note: s.note,
        })),
        zlevel: 2,
      },
    ],
  }
}

type TripRouteMapProps = {
  trip: Trip
}

/**
 * Animated route map for the trip details page: the trip's stops on the
 * India map, connected by legs with a travelling-comet effect and pulsing
 * stop markers. Falls into an error state when fewer than two stops can be
 * located.
 */
export function TripRouteMap({ trip }: TripRouteMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')

  useEffect(() => {
    let cancelled = false
    const el = containerRef.current
    if (!el) return

    const chart = echarts.init(el)
    const onResize = () => chart.resize()
    window.addEventListener('resize', onResize)

    async function load() {
      try {
        const [, stops] = await Promise.all([
          loadIndiaMap(),
          locateStops(tripStops(trip)),
        ])
        if (cancelled) return
        if (stops.length < 2) throw new Error('fewer than two locatable stops')
        chart.setOption(buildOption(stops))
        setStatus('ready')
      } catch (err) {
        console.error('Failed to load trip route map', err)
        if (!cancelled) setStatus('error')
      }
    }
    load()

    return () => {
      cancelled = true
      window.removeEventListener('resize', onResize)
      chart.dispose()
    }
  }, [trip])

  return (
    <div>
      <div ref={containerRef} className="h-105 w-full bg-white" />
      {status === 'loading' && (
        <p className="mt-2 text-[0.9rem] text-muted">Loading route…</p>
      )}
      {status === 'error' && (
        <p className="mt-2 text-[0.9rem] text-[#dc2626]">
          Could not load the route map. Please try again later.
        </p>
      )}
    </div>
  )
}
