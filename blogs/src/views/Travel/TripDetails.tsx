import { lazy, Suspense, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { TRAVEL_SECTION } from '../../content/sections'
import { getTrip, tripStops } from '../../content/travel/trips'
import { formatDate } from '../../lib/format'
import { CARD_ART_BACKDROP_CLASS } from '../../lib/ui'
import { usePageTitle } from '../../lib/usePageTitle'
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

// Minimum tiles per marquee pass in the gallery belt under the map; the
// images repeat until one pass is wider than the article, so the belt
// never shows a gap while it scrolls.
const GALLERY_MIN_TILES = 7

// Marquee pace: seconds each tile takes to cross a fixed point. Scaling the
// loop duration with the tile count keeps the drift speed constant no
// matter how many photos a trip has.
const GALLERY_SECONDS_PER_TILE = 25

export function TripDetailsPage() {
  const { tripId } = useParams<{ tripId: string }>()
  const trip = tripId ? getTrip(tripId) : undefined
  const [showItinerary, setShowItinerary] = useState(true)

  // undefined while the trip is missing: the NotFoundPage owns the title then.
  usePageTitle(trip?.title)

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
  // The gallery belt repeats the images until one marquee pass holds at
  // least GALLERY_MIN_TILES tiles.
  const galleryTiles = gallery.length
    ? Array.from(
        { length: Math.max(GALLERY_MIN_TILES, gallery.length) },
        (_, i) => gallery[i % gallery.length],
      )
    : []

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
      {/* Columns stretch to equal height so the stat cards can pin to the
          pane bottom, level with the map's lower edge. */}
      <div className="grid grid-cols-1 gap-3 min-[900px]:grid-cols-[55fr_45fr]">
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
                <span
                  className={`${CHIP_CLASS} gap-1 font-normal tracking-normal normal-case text-faint`}
                >
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
            <div className="mt-auto grid grid-cols-1 gap-4 sm:grid-cols-3">
              {stats.map((stat) => (
                <div key={stat.label} className={STAT_CARD_CLASS}>
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

        {/* Right column: route map */}
        <div className="min-w-0">
          {(showRoute || mapImage) && (
            <section className="relative rounded-xl border border-border bg-surface p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] [view-transition-name:travel-map]">
              <h2 className="mb-3 text-lg font-bold text-ink">
                {TRAVEL_SECTION.routeMapTitle}
              </h2>
              {showRoute ? (
                <div className="relative">
                  <Suspense
                    fallback={
                      <p className="text-sm text-muted">Loading route…</p>
                    }
                  >
                    <TripRouteMap trip={trip} />
                  </Suspense>
                  {/* Compact itinerary pinned flush to the map's top-right
                      corner, like the legend on the travel page map. The ✕
                      collapses it to an info button that brings it back. */}
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
          )}

        </div>
      </div>

      {/* Thin rule under the map row, spanning the full article width. */}
      <div className="mt-6 h-px w-full bg-border" aria-hidden="true" />

      {galleryTiles.length > 0 && (
        <div className="mt-6 overflow-hidden" aria-label="Trip gallery">
          {/* The track holds the tile sequence twice (the second copy is
              aria-hidden) and gallery-marquee slides it by one copy's width,
              so the belt drifts left forever. Hover pauses it so the tile
              zoom is usable; reduced-motion users get a static strip. */}
          <div
            className="flex w-max gap-4 animate-[gallery-marquee_linear_infinite] hover:[animation-play-state:paused] motion-reduce:animate-none"
            style={{
              animationDuration: `${galleryTiles.length * GALLERY_SECONDS_PER_TILE}s`,
            }}
          >
            {[...galleryTiles, ...galleryTiles].map((src, i) => (
              <div
                key={`${src}-${i}`}
                aria-hidden={i >= galleryTiles.length || undefined}
                className="group relative aspect-square w-40 shrink-0 overflow-hidden rounded-lg border border-border bg-surface-soft sm:w-52"
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
        </div>
      )}
    </article>
  )
}
