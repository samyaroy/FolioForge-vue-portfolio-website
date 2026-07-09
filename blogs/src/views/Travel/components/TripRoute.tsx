import {
  tripStops,
  type TransportMode,
  type Trip,
} from '../../../content/travel/trips'

const MODE_ICONS: Record<TransportMode, string> = {
  flight: 'mdi-airplane',
  train: 'mdi-train',
  bus: 'mdi-bus',
  car: 'mdi-car',
  ferry: 'mdi-ferry',
  foot: 'mdi-walk',
}

// The rail column: markers and connector lines share this width so the
// vertical line runs straight through the stop markers.
const RAIL_CLASS = 'flex w-5 flex-none justify-center'

type TripRouteProps = {
  trip: Trip
}

/**
 * Vertical itinerary for the trip details page: stops as timeline nodes,
 * with the transport mode of each leg on the connector between them.
 * Renders nothing for trips with fewer than two stops — the caller falls
 * back to the cover image instead.
 */
export function TripRoute({ trip }: TripRouteProps) {
  const stops = tripStops(trip)
  if (stops.length < 2) return null

  const last = stops.length - 1

  return (
    <ol className="flex flex-col px-2 py-3">
      {stops.map((stop, i) => (
        <li key={`${stop.name}-${i}`} className="flex flex-col">
          {i > 0 && (
            <div className="flex items-stretch gap-3">
              <span className={RAIL_CLASS}>
                <span className="min-h-10 w-0.5 rounded-full bg-border" />
              </span>
              {stop.mode && (
                <span className="inline-flex items-center gap-1.5 self-center text-xs leading-normal font-normal tracking-[0.16em] text-muted uppercase">
                  <span
                    className={`mdi ${MODE_ICONS[stop.mode]} text-sm leading-none text-primary`}
                    aria-hidden="true"
                  />
                  {stop.mode}
                </span>
              )}
            </div>
          )}

          <div className="flex items-start gap-3">
            <span className={`${RAIL_CLASS} pt-1`}>
              {i === last ? (
                <span
                  className="mdi mdi-map-marker -mt-0.5 text-lg leading-none text-primary"
                  aria-hidden="true"
                />
              ) : i === 0 ? (
                <span className="size-3 rounded-full bg-primary shadow-[0_0_0_4px_rgba(25,128,230,0.15)]" />
              ) : (
                <span className="size-2.5 rounded-full border-2 border-primary bg-surface" />
              )}
            </span>

            <div className="min-w-0">
              <div className="text-[0.95rem] leading-[1.35] font-bold text-ink">
                {stop.name}
              </div>
              {stop.note && (
                <div className="mt-0.5 text-[0.8rem] leading-normal text-muted">
                  {stop.note}
                </div>
              )}
            </div>
          </div>
        </li>
      ))}
    </ol>
  )
}
