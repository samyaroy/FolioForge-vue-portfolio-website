import { Link } from 'react-router-dom'
import { tripStops, type Trip } from '../../../content/travel/trips'
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
  const placeNames = tripStops(trip)
    .map((stop) => stop.name)
    .join(' → ')

  return (
    <article className={`flex rounded-xl ${CARD_SHELL_CLASS}`}>
      <div className={`shrink-0 basis-1/4 ${CARD_ART_BACKDROP_CLASS}`}>
        {trip.coverImage && (
          <img
            src={trip.coverImage}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover"
          />
        )}
      </div>

      <div className="flex min-w-0 basis-3/4 flex-col px-5 py-4">
        <h3 className="text-[1.05rem] leading-[1.35] font-bold tracking-[-0.02em] text-ink">
          {trip.title}
        </h3>

        <div className={CARD_META_CLASS}>
          {formattedDate && (
            <time
              dateTime={trip.date}
              className="inline-flex items-center gap-1 font-normal"
            >
              <span
                className="mdi mdi-calendar-blank-outline leading-none"
                aria-hidden="true"
              />
              {formattedDate}
            </time>
          )}
        </div>

        {placeNames && (
          <p className="mt-2 text-[0.8rem] leading-normal text-faint">
            {placeNames}
          </p>
        )}

        {trip.summary && (
          <p className="mt-2 text-justify text-[0.9rem] leading-[1.7] text-muted">
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
