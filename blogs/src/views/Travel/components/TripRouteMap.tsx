import { useEffect, useRef, useState } from 'react'
import * as echarts from 'echarts'
import {
  tripStops,
  type Trip,
  type TripStop,
} from '../../../content/travel/trips'
import { geocodeCities } from './geocode'
import { INDIA_MAP_NAME, loadIndiaMap } from './indiaMap'

type LocatedStop = TripStop & { lat: number; lng: number }

const ROUTE_COLOR = '#1980e6'
const STOP_COLOR = '#ef4444'

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
    data?: { mode?: string; nights?: number; note?: string; legLabel?: string }
  }
  if (p.seriesType === 'lines') {
    return p.data?.legLabel ?? ''
  }
  const lines = [`<strong>${p.name}</strong>`]
  if (p.data?.mode) lines.push(`arrived by ${p.data.mode}`)
  if (p.data?.nights != null) {
    lines.push(`${p.data.nights} night${p.data.nights === 1 ? '' : 's'}`)
  }
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

  const legs = stops.slice(1).map((to, i) => {
    const from = stops[i]
    return {
      coords: [
        [from.lng, from.lat],
        [to.lng, to.lat],
      ],
      legLabel: `${from.name} → ${to.name}${to.mode ? ` · ${to.mode}` : ''}`,
      // Flights get a visibly arced path; ground legs stay near-straight.
      lineStyle: { curveness: to.mode === 'flight' ? 0.25 : 0.08 },
    }
  })

  return {
    backgroundColor: '#ffffff',
    tooltip: {
      trigger: 'item',
      confine: true,
      borderColor: '#e2e8f0',
      textStyle: { color: '#0e141b', fontSize: 12 },
      formatter: tooltipFormatter,
    },
    geo: {
      map: INDIA_MAP_NAME,
      nameProperty: 'st_nm',
      silent: true,
      boundingCoords: [
        [Math.min(...lngs) - padLng, Math.max(...lats) + padLat],
        [Math.max(...lngs) + padLng, Math.min(...lats) - padLat],
      ],
      itemStyle: {
        areaColor: '#f8fafc',
        borderColor: '#cbd5e1',
        borderWidth: 0.6,
      },
    },
    series: [
      {
        name: 'Route',
        type: 'lines',
        coordinateSystem: 'geo',
        data: legs,
        lineStyle: {
          color: ROUTE_COLOR,
          width: 2,
          opacity: 0.55,
          curveness: 0.08,
        },
        // The moving comet that travels each leg — the "live" animation.
        effect: {
          show: true,
          period: 4,
          trailLength: 0.6,
          symbol: 'arrow',
          symbolSize: 8,
          color: ROUTE_COLOR,
        },
        zlevel: 1,
      },
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
        },
        data: stops.map((s) => ({
          name: s.name,
          value: [s.lng, s.lat],
          mode: s.mode,
          nights: s.nights,
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
