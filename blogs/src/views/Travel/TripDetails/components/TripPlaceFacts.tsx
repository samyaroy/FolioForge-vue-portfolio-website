import { TRAVEL_SECTION } from '../../../../content/sections'
import type { Trip } from '../../../../content/travel/trips'

type TripPlaceFactsProps = {
  facts?: Trip['placeFacts']
}

export function TripPlaceFacts({ facts }: TripPlaceFactsProps) {
  const items = Array.isArray(facts)
    ? facts.filter((fact) => typeof fact === 'string' && fact.trim())
    : []

  if (!items.length) return null

  return (
    <section
      aria-labelledby="trip-place-facts-title"
      className="mt-6 w-full rounded-xl border border-border bg-surface p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] sm:px-5"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:gap-6">
        <h2
          id="trip-place-facts-title"
          className="inline-flex shrink-0 items-start gap-2 text-sm leading-6 font-semibold text-ink"
        >
          <span className="mdi mdi-information-outline text-base text-primary" aria-hidden="true" />
          {TRAVEL_SECTION.placeFactsTitle}
        </h2>
        <ul className="grid min-w-0 flex-1 gap-x-6 gap-y-3 text-sm leading-6 text-muted sm:grid-cols-2">
          {items.map((fact, index) => (
            <li key={`${index}-${fact}`} className="flex min-w-0 items-start gap-2">
              <span className="mt-2.5 size-1 shrink-0 rounded-full bg-primary" aria-hidden="true" />
              <span className="min-w-0 wrap-break-word">{fact}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
