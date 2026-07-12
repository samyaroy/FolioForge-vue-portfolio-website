import { Link, useParams } from 'react-router-dom'
import { TRAVEL_SECTION } from '../../../content/sections'
import { getTrip } from '../../../content/travel/trips'
import { usePageTitle } from '../../../lib/usePageTitle'
import { NotFoundPage } from '../../NotFound'
import { TripDetailsPane } from './components/TripDetailsPane'
import { TripImageBelt } from './components/TripImageBelt'
import { TripMapPane } from './components/TripMapPane'

export function TripDetailsPage() {
  const { tripId } = useParams<{ tripId: string }>()
  const trip = tripId ? getTrip(tripId) : undefined

  usePageTitle(trip?.title)

  if (!trip) return <NotFoundPage />

  return (
    <article className="ml-[50%] w-[min(calc(100vw-1.5rem),84rem)] -translate-x-1/2">
      <Link
        className="mb-6 inline-flex text-xs leading-normal font-bold tracking-[0.16em] text-primary uppercase [view-transition-name:travel-title]"
        to="/travel"
        viewTransition
      >
        {TRAVEL_SECTION.backToTravel}
      </Link>

      <div className="grid grid-cols-1 gap-3 min-[900px]:grid-cols-[55fr_45fr]">
        <TripDetailsPane trip={trip} />
        <TripMapPane trip={trip} />
      </div>

      <div className="mt-6 h-px w-full bg-border" aria-hidden="true" />
      <TripImageBelt gallery={trip.gallery} clickedBy={trip.clicked_by} />
    </article>
  )
}
