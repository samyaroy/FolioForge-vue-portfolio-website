import { Link } from 'react-router-dom'
import type { Trip } from '../../../content/travel/trips'
import { TRAVEL_SECTION } from '../../../content/sections'
import { formatDate } from '../../../lib/format'
import { CARD_META_CLASS, CARD_SHELL_CLASS } from '../../../lib/ui'

const DETAILS_LINK_CLASS =
  'mt-3 inline-block text-sm font-semibold text-primary transition-colors duration-200 hover:text-ink'

type TripCardProps = {
  trip: Trip
}

export function TripCard({ trip }: TripCardProps) {
  const dateRange = [
    formatDate(trip.startDate),
    trip.endDate ? formatDate(trip.endDate) : '',
  ]
    .filter(Boolean)
    .join(' – ')
  const isExternal = /^https?:\/\//i.test(trip.detailsUrl ?? '')

  return (
    <article className={`w-[90%] rounded-xl ${CARD_SHELL_CLASS} px-5 py-4`}>
      <h3 className="text-[1.05rem] leading-[1.35] font-bold tracking-[-0.02em] text-ink">
        {trip.title}
      </h3>

      <div className={CARD_META_CLASS}>
        {dateRange && (
          <time
            dateTime={trip.startDate}
            className={
              trip.purpose
                ? "after:ml-2 after:inline-block after:size-1 after:rounded-full after:bg-primary after:align-middle after:content-['']"
                : undefined
            }
          >
            {dateRange}
          </time>
        )}
        {trip.purpose && <span>{trip.purpose}</span>}
      </div>

      {trip.places && trip.places.length > 0 && (
        <p className="mt-2 text-[0.8rem] leading-normal text-faint">
          {trip.places.join(' → ')}
        </p>
      )}

      {trip.summary && (
        <p className="mt-2 text-justify text-[0.9rem] leading-[1.7] text-muted">
          {trip.summary}
        </p>
      )}

      {trip.detailsUrl &&
        (isExternal ? (
          <a
            className={DETAILS_LINK_CLASS}
            href={trip.detailsUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            {TRAVEL_SECTION.detailsLabel}
          </a>
        ) : (
          <Link className={DETAILS_LINK_CLASS} to={trip.detailsUrl}>
            {TRAVEL_SECTION.detailsLabel}
          </Link>
        ))}
    </article>
  )
}
