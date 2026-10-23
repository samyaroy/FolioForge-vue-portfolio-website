import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { Trip, TripStop } from '../../../content/travel/trips'
import { TRAVEL_SECTION } from '../../../content/sections'
import { formatDate } from '../../../lib/format'
import {
  CARD_ART_BACKDROP_CLASS,
  CARD_META_CLASS,
  CARD_SHELL_CLASS,
} from '../../../lib/ui'
import { MODE_ICONS } from './transportModes'
import { routePreview } from './travelStats'

const DETAILS_LINK_CLASS =
  'ml-auto shrink-0 text-sm font-normal text-primary transition-colors duration-200 hover:text-ink'

const CHIP_CLASS =
  'inline-flex items-center rounded-full border border-border bg-surface-soft px-2.5 py-0.5 text-[0.7rem] leading-normal'

type TripCardProps = {
  trip: Trip
  /** Called with the trip while its card is hovered or focused, and with
      null when that ends; the page uses it to light the trip up on the map. */
  onActiveChange?: (trip: Trip | null) => void
}

// The leg's connector stays on the same line as the stop it leads to.
function RouteStop({ stop }: { stop: TripStop }) {
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
      {stop.mode && (
        <span
          className="inline-flex items-center gap-1 text-faint"
          title={stop.mode}
        >
          <span className="h-px w-2.5 bg-border" aria-hidden="true" />
          <span
            className={`mdi ${MODE_ICONS[stop.mode]} text-sm leading-none text-primary`}
            aria-hidden="true"
          />
          <span className="sr-only">by {stop.mode} to</span>
          <span className="h-px w-2.5 bg-border" aria-hidden="true" />
        </span>
      )}
      <span className="font-semibold text-ink">{stop.name}</span>
    </span>
  )
}

export function TripCard({ trip, onActiveChange }: TripCardProps) {
  const formattedDate = formatDate(trip.date)
  const [coverFailed, setCoverFailed] = useState(false)
  const route = routePreview(trip)
  const photos = trip.gallery?.length ?? 0
  const activate = () => onActiveChange?.(trip)
  const deactivate = () => onActiveChange?.(null)

  return (
    <article
      className={`flex min-h-52 overflow-hidden rounded-xl max-sm:flex-col ${CARD_SHELL_CLASS}`}
      onMouseEnter={activate}
      onMouseLeave={deactivate}
      onFocus={activate}
      onBlur={deactivate}
    >
      <div
        className={`relative shrink-0 basis-[30%] max-sm:h-52 max-sm:basis-auto ${CARD_ART_BACKDROP_CLASS}`}
      >
        {trip.coverImage && !coverFailed ? (
          <img
            src={trip.coverImage}
            alt=""
            loading="lazy"
            onError={() => setCoverFailed(true)}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-primary/50">
            <span className="mdi mdi-map-marker-path text-4xl leading-none" aria-hidden="true" />
          </div>
        )}
        {photos > 0 && (
          <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full bg-[rgba(14,20,27,0.62)] px-2 py-0.5 text-[0.7rem] font-semibold text-white backdrop-blur-[2px]">
            <span className="mdi mdi-image-multiple-outline leading-none" aria-hidden="true" />
            {photos}
          </span>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col px-5 py-4">
        <h3 className="text-lg leading-[1.35] font-bold tracking-[-0.02em] text-ink">
          {trip.title}
        </h3>

        <div className={`${CARD_META_CLASS} mt-2!`}>
          {formattedDate && (
            <time
              dateTime={trip.date}
              className="inline-flex items-center gap-1 font-normal tracking-normal normal-case"
            >
              <span
                className="mdi mdi-calendar-blank-outline leading-none"
                aria-hidden="true"
              />
              {formattedDate}
            </time>
          )}
          {trip.location && (
            <span className="inline-flex items-center gap-1 font-normal">
              <span
                className="mdi mdi-map-marker-outline leading-none"
                aria-hidden="true"
              />
              {trip.location}
            </span>
          )}
        </div>

        {route.head.length > 1 && (
          <p className="mt-3 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[0.8rem] leading-normal">
            {route.head.map((stop, i) => (
              <RouteStop key={`${stop.name}-${i}`} stop={stop} />
            ))}
            {route.hidden > 0 && (
              <span className="rounded-full bg-surface-soft px-1.5 text-[0.7rem] text-muted ring-1 ring-border">
                +{route.hidden}
              </span>
            )}
            {route.tail.map((stop, i) => (
              <RouteStop key={`tail-${stop.name}-${i}`} stop={stop} />
            ))}
          </p>
        )}

        {trip.stats && trip.stats.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {trip.stats.map((stat) => (
              <li key={stat.label} className={`${CHIP_CLASS} gap-1 text-muted`}>
                <span className="font-bold text-ink">{stat.value}</span>
                {stat.label.toLowerCase()}
              </li>
            ))}
          </ul>
        )}

        {trip.summary && (
          <p className="mt-3 overflow-hidden text-justify text-sm leading-[1.7] text-muted [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]">
            {trip.summary}
          </p>
        )}

        <div className="mt-auto flex items-end gap-3 pt-3">
          {trip.tags && trip.tags.length > 0 && (
            <ul className="flex min-w-0 flex-wrap gap-1.5">
              {trip.tags.map((tag) => (
                <li
                  key={tag}
                  className="rounded bg-blue-100/50 px-1.5 py-0.5 text-[10px] font-semibold tracking-[0.10em] text-slate-600 uppercase"
                >
                  {tag}
                </li>
              ))}
            </ul>
          )}
          <Link
            className={DETAILS_LINK_CLASS}
            to={`/travel/${trip.id}`}
            viewTransition
          >
            {TRAVEL_SECTION.detailsLabel}
          </Link>
        </div>
      </div>
    </article>
  )
}
