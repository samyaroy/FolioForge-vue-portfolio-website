import { TRAVEL_OVERVIEW_LABELS as LABELS } from '../../../content/travel/data'
import { MODE_ICONS } from './transportModes'
import type { TravelOverview as Overview } from './travelStats'

const TILE_CLASS =
  'min-w-0 rounded-lg border border-border bg-surface px-4 py-3 shadow-[0_1px_2px_rgba(15,23,42,0.04)]'

const LABEL_CLASS =
  'flex items-center gap-1 text-[0.625rem] leading-normal font-semibold tracking-[0.1em] text-faint uppercase'

type TravelOverviewProps = {
  overview: Overview
  /** States + UTs on the map; known once the map geometry has loaded. */
  totalStates?: number
}

function StatTile({
  icon,
  label,
  value,
  sub,
}: {
  icon: string
  label: string
  value: number
  sub?: string
}) {
  return (
    <div className={TILE_CLASS}>
      <dt className={LABEL_CLASS}>
        <span className={`mdi ${icon} text-xs leading-none`} aria-hidden="true" />
        {label}
      </dt>
      <dd className="mt-1 flex items-baseline gap-1.5">
        <span className="text-3xl leading-tight font-black tracking-[-0.033em] text-ink">
          {value.toLocaleString()}
        </span>
        {sub && <span className="text-xs text-muted">{sub}</span>}
      </dd>
    </div>
  )
}

/**
 * The travel page's at-a-glance band: headline counts, how the trips got
 * around (legs per transport mode), and a few standout facts.
 */
export function TravelOverview({ overview, totalStates }: TravelOverviewProps) {
  const maxLegs = Math.max(1, ...overview.modes.map((m) => m.legs))
  const highlights = [
    overview.mostVisitedCity && {
      label: LABELS.mostVisited,
      value: overview.mostVisitedCity.name,
      sub: `${overview.mostVisitedCity.visits} ${LABELS.visits}`,
    },
    overview.mostExploredState && {
      label: LABELS.mostExplored,
      value: overview.mostExploredState.name,
      sub: `${overview.mostExploredState.cities} ${LABELS.citiesSuffix}`,
    },
    overview.since !== undefined && {
      label: LABELS.since,
      value: String(overview.since),
    },
  ].filter(Boolean) as { label: string; value: string; sub?: string }[]

  return (
    <section aria-label="Travel at a glance" className="mb-10">
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile
          icon="mdi-map-outline"
          label={LABELS.states}
          value={overview.states}
          sub={totalStates ? `${LABELS.statesOf} ${totalStates}` : undefined}
        />
        <StatTile
          icon="mdi-city-variant-outline"
          label={LABELS.cities}
          value={overview.cities}
        />
        <StatTile
          icon="mdi-bag-suitcase-outline"
          label={LABELS.trips}
          value={overview.trips}
        />
        <StatTile
          icon="mdi-camera-outline"
          label={LABELS.photos}
          value={overview.photos}
        />
      </dl>

      <div
        className={`${TILE_CLASS} mt-3 grid gap-x-6 gap-y-4 py-4 sm:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]`}
      >
        {overview.modes.length > 0 && (
          <div>
            <h2 className={LABEL_CLASS}>
              <span className="mdi mdi-routes text-xs leading-none" aria-hidden="true" />
              {LABELS.gettingAround}
            </h2>
            <ul className="mt-2.5 flex flex-col gap-2">
              {overview.modes.map(({ mode, legs }) => (
                <li
                  key={mode}
                  className="grid grid-cols-[5.5rem_minmax(0,1fr)_3.25rem] items-center gap-3 text-xs text-muted"
                  title={`${mode}: ${legs} ${LABELS.legs}`}
                >
                  <span className="inline-flex items-center gap-1.5 capitalize">
                    <span
                      className={`mdi ${MODE_ICONS[mode]} text-sm leading-none text-primary`}
                      aria-hidden="true"
                    />
                    {mode}
                  </span>
                  <span className="h-1.5 overflow-hidden rounded-full bg-[#e3eefb]">
                    <span
                      className="block h-full rounded-full bg-primary"
                      style={{ width: `${(legs / maxLegs) * 100}%` }}
                    />
                  </span>
                  <span className="text-right whitespace-nowrap">
                    <span className="font-semibold text-ink">{legs}</span>{' '}
                    {LABELS.legs}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {highlights.length > 0 && (
          <dl className="flex flex-col justify-center gap-3 sm:border-l sm:border-border sm:pl-6">
            {highlights.map((h) => (
              <div key={h.label}>
                <dt className={LABEL_CLASS}>{h.label}</dt>
                <dd className="mt-0.5 text-sm leading-snug">
                  <span className="font-bold text-ink">{h.value}</span>
                  {h.sub && <span className="text-muted"> · {h.sub}</span>}
                </dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </section>
  )
}
