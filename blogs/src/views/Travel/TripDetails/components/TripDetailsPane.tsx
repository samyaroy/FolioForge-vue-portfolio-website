import type { Trip } from '../../../../content/travel/trips'
import { formatDate } from '../../../../lib/format'

const CHIP_CLASS =
  'inline-flex items-center rounded-full border border-border bg-surface-soft px-3 py-1 text-xs leading-normal tracking-[0.16em] uppercase'

const STAT_CARD_CLASS =
  'rounded-xl border border-border bg-surface p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]'

type TripDetailsPaneProps = {
  trip: Trip
}

export function TripDetailsPane({ trip }: TripDetailsPaneProps) {
  const formattedDate = formatDate(trip.date)
  const paragraphs = trip.narrative?.length
    ? trip.narrative
    : trip.summary
      ? [trip.summary]
      : []
  const stats = trip.stats ?? []

  return (
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
  )
}
