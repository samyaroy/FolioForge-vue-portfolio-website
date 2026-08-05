import { Link } from 'react-router-dom'
import type { Trip } from '../../../content/travel/trips'
import { TRAVEL_SECTION } from '../../../content/sections'
import { formatDate } from '../../../lib/format'
import {
  CARD_ART_BACKDROP_CLASS,
  CARD_META_CLASS,
  CARD_SHELL_CLASS,
} from '../../../lib/ui'

const DETAILS_LINK_CLASS =
  'mt-auto self-end pt-3 text-sm font-normal text-primary transition-colors duration-200 hover:text-ink'

type TripCardProps = {
  trip: Trip
}

export function TripCard({ trip }: TripCardProps) {
  const formattedDate = formatDate(trip.date)

  return (
    <article
      className={`flex max-h-62 min-h-56 overflow-hidden rounded-xl max-sm:max-h-none max-sm:flex-col ${CARD_SHELL_CLASS}`}
    >
      <div
        className={`h-auto shrink-0 basis-[28%] max-sm:h-56 max-sm:basis-auto ${CARD_ART_BACKDROP_CLASS}`}
      >
        {trip.coverImage && (
          <img
            src={trip.coverImage}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover"
          />
        )}
      </div>

      <div className="flex min-w-0 basis-[72%] flex-col overflow-hidden px-5 py-4 max-sm:basis-auto">
        <h3 className="text-lg leading-[1.35] font-bold tracking-[-0.02em] text-ink">
          {trip.title}
        </h3>

        <div className={CARD_META_CLASS}>
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

        {trip.summary && (
          <p className="mt-2 overflow-hidden text-justify text-sm leading-[1.7] text-muted [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:4]">
            {trip.summary}
          </p>
        )}

        <Link
          className={DETAILS_LINK_CLASS}
          to={`/travel/${trip.id}`}
          viewTransition
        >
          {TRAVEL_SECTION.detailsLabel}
        </Link>
      </div>
    </article>
  )
}
