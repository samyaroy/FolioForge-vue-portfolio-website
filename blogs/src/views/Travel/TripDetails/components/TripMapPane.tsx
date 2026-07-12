import { lazy, Suspense, useState } from 'react'
import { TRAVEL_SECTION } from '../../../../content/sections'
import { tripStops, type Trip } from '../../../../content/travel/trips'
import { CARD_ART_BACKDROP_CLASS } from '../../../../lib/ui'
import { TripRoute } from '../../components/TripRoute'

const TripRouteMap = lazy(() =>
  import('../../components/TripRouteMap').then((module) => ({
    default: module.TripRouteMap,
  })),
)

type TripMapPaneProps = {
  trip: Trip
  onLoadingChange?: (isLoading: boolean) => void
}

export function TripMapPane({ trip, onLoadingChange }: TripMapPaneProps) {
  const [showItinerary, setShowItinerary] = useState(true)
  const mapImage = trip.routeMapImage ?? trip.coverImage
  const showRoute = tripStops(trip).length >= 2

  if (!showRoute && !mapImage) return null

  return (
    <div className="min-w-0">
      <section className="relative rounded-xl border border-border bg-surface p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] [view-transition-name:travel-map]">
        <h2 className="mb-3 text-lg font-bold text-ink">
          {TRAVEL_SECTION.routeMapTitle}
        </h2>
        {showRoute ? (
          <div className="relative">
            <Suspense
              fallback={
                <div className="flex h-105 w-full items-center justify-center bg-white">
                  <p className="text-sm text-muted">Loading route…</p>
                </div>
              }
            >
              <TripRouteMap trip={trip} onLoadingChange={onLoadingChange} />
            </Suspense>
            {showItinerary ? (
              <div className="absolute top-0 right-0 z-2 max-h-full overflow-y-auto rounded-lg rounded-tr-none border border-border bg-[rgba(255,255,255,0.88)] px-2 py-1 backdrop-blur-[2px]">
                <button
                  type="button"
                  className="absolute top-1 right-1 z-10 inline-flex h-5 w-5 items-center justify-center rounded text-muted transition-colors duration-200 hover:text-ink"
                  aria-label="Hide itinerary"
                  onClick={() => setShowItinerary(false)}
                >
                  <span
                    className="mdi mdi-close text-sm leading-none"
                    aria-hidden="true"
                  />
                </button>
                <TripRoute trip={trip} />
              </div>
            ) : (
              <button
                type="button"
                className="absolute top-0 right-0 z-2 inline-flex h-8 w-8 items-center justify-center rounded-lg rounded-tr-none border border-border bg-[rgba(255,255,255,0.88)] text-primary backdrop-blur-[2px] transition-colors duration-200 hover:text-ink"
                aria-label="Show itinerary"
                onClick={() => setShowItinerary(true)}
              >
                <span
                  className="mdi mdi-information-outline text-base leading-none"
                  aria-hidden="true"
                />
              </button>
            )}
          </div>
        ) : (
          <div
            className={`overflow-hidden rounded-lg ${CARD_ART_BACKDROP_CLASS}`}
          >
            <img
              src={mapImage}
              alt={`Route map for ${trip.title}`}
              className="h-105 w-full object-cover"
            />
          </div>
        )}
      </section>
    </div>
  )
}
