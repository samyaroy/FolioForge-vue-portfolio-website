import { lazy, Suspense } from 'react'
import { Link, useParams } from 'react-router-dom'
import { TRAVEL_SECTION } from '../../content/sections'
import { getTrip, tripStops } from '../../content/travel/trips'
import { formatDate } from '../../lib/format'
import { CARD_ART_BACKDROP_CLASS } from '../../lib/ui'
import { NotFoundPage } from '../NotFound'
import { TripRoute } from './components/TripRoute'

// The route map pulls in ECharts (~1 MB); load it only when a details page
// with a plottable route actually renders.
const TripRouteMap = lazy(() =>
  import('./components/TripRouteMap').then((m) => ({
    default: m.TripRouteMap,
  })),
)

const CHIP_CLASS =
  'inline-flex items-center rounded-full border border-border bg-surface-soft px-3 py-1 text-xs leading-normal tracking-[0.16em] uppercase'

const STAT_CARD_CLASS =
  'rounded-xl border border-border bg-surface p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]'

export function TripDetailsPage() {
  const { tripId } = useParams<{ tripId: string }>()
  const trip = tripId ? getTrip(tripId) : undefined

  if (!trip) {
    return <NotFoundPage />
  }

  const formattedDate = formatDate(trip.date)
  const paragraphs = trip.narrative?.length
    ? trip.narrative
    : trip.summary
      ? [trip.summary]
      : []
  const mapImage = trip.routeMapImage ?? trip.coverImage
  const stats = trip.stats ?? []
  // The itinerary needs at least one leg; single-stop trips keep the image.
  const showRoute = tripStops(trip).length >= 2
  // Half-filled yml entries can leave null holes in the list; skip them.
  const gallery = (trip.gallery ?? []).filter(Boolean)

  return (
    // Break out of the layout's default column to the same width as the
    // travel page, so both TravelBook views line up edge-to-edge.
    <article className="ml-[50%] w-[min(calc(100vw-1.5rem),84rem)] -translate-x-1/2">
      <Link
        className="mb-6 inline-flex text-xs leading-normal font-bold tracking-[0.16em] text-primary uppercase [view-transition-name:travel-title]"
        to="/travel"
        viewTransition
      >
        {TRAVEL_SECTION.backToTravel}
      </Link>

      {/* Same 55/45 split and gap as the travel page, so the right pane
          matches the map pane's width across both views. */}
      <div className="grid grid-cols-1 gap-3 min-[900px]:grid-cols-[55fr_45fr] min-[900px]:items-start">
        {/* Left column: narrative & metrics */}
        <div className="flex min-w-0 flex-col gap-8">
          <div>
            <h1 className="mb-4 text-4xl leading-[1.1] font-black tracking-[-0.033em] text-ink">
              {trip.title}
            </h1>

            <div className="mb-5 flex flex-wrap gap-2">
              {trip.tags?.map((tag) => (
                <span key={tag} className={`${CHIP_CLASS} font-bold text-muted`}>
                  {tag}
                </span>
              ))}
              {formattedDate && (
                <span className={`${CHIP_CLASS} gap-1 font-normal text-faint`}>
                  <span
                    className="mdi mdi-calendar-blank-outline leading-none"
                    aria-hidden="true"
                  />
                  <time dateTime={trip.date}>{formattedDate}</time>
                </span>
              )}
              {trip.location && (
                <span className={`${CHIP_CLASS} gap-1 font-normal text-faint`}>
                  <span
                    className="mdi mdi-map-marker-outline leading-none"
                    aria-hidden="true"
                  />
                  {trip.location}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-4 text-justify text-base leading-[1.8] text-muted">
              {paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>

          {stats.length > 0 && (
            <div className="grid grid-cols-2 gap-4">
              {stats.map((stat, i) => (
                <div
                  key={stat.label}
                  className={`${STAT_CARD_CLASS} ${
                    // An odd trailing stat spans both columns, like the
                    // full-width "Total trekked" card in the design.
                    i === stats.length - 1 && stats.length % 2 === 1
                      ? 'col-span-2'
                      : ''
                  }`}
                >
                  <div className="text-xs leading-normal font-bold tracking-[0.16em] text-faint uppercase">
                    {stat.label}
                  </div>
                  <div className="mt-2 text-2xl leading-tight font-bold text-ink">
                    {stat.value}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right column: route map & gallery */}
        <div className="flex min-w-0 flex-col gap-6">
          {(showRoute || mapImage) && (
            <section className="relative rounded-xl border border-border bg-surface p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] [view-transition-name:travel-map]">
              <h2 className="mb-3 text-[1.1rem] text-ink">
                {TRAVEL_SECTION.routeMapTitle}
              </h2>
              {showRoute ? (
                <>
                  <Suspense
                    fallback={
                      <p className="text-[0.9rem] text-muted">Loading route…</p>
                    }
                  >
                    <TripRouteMap trip={trip} />
                  </Suspense>
                  {/* Compact itinerary pinned to the pane's corner, like the
                      legend on the travel page map. */}
                  <div className="absolute top-14 right-6 z-2 max-h-[75%] overflow-y-auto rounded-lg border border-border bg-[rgba(255,255,255,0.88)] px-2 py-1 backdrop-blur-[2px]">
                    <TripRoute trip={trip} />
                  </div>
                </>
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
          )}

          {gallery.length > 0 && (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {gallery.map((src) => (
                <div
                  key={src}
                  className="group relative aspect-square overflow-hidden rounded-lg border border-border bg-surface-soft"
                >
                  <img
                    src={src}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </article>
  )
}
