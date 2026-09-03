import { Link } from 'react-router-dom'
import { RecommendedCard } from '../../../components/RecommendedCard'
import {
  FEATURED_RECOMMENDED,
  RECOMMENDED,
} from '../../../content/recommended/data'
import { RECOMMENDED_SECTION } from '../../../content/sections'
import { CARD_META_CLASS } from '../../../lib/ui'

/**
 * The blog home page's window onto /recommended: the first few entries from
 * content/recommended/data.yml, plus the link through to the whole list.
 */
export function RecommendedTeaser() {
  if (FEATURED_RECOMMENDED.length === 0) return null

  const allLabel = RECOMMENDED_SECTION.allLabel.replace(
    '{count}',
    String(RECOMMENDED.length),
  )

  return (
    <section
      className="mx-auto max-w-6xl"
      aria-labelledby="recommended-teaser-heading"
    >
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className={`${CARD_META_CLASS} mt-0!`}>
            {RECOMMENDED_SECTION.kicker}
          </p>
          <h2
            id="recommended-teaser-heading"
            className="mt-2.5 font-[Poppins,Inter,system-ui,sans-serif] text-[clamp(1.5rem,2.2vw,1.75rem)] leading-[1.2] font-light text-ink"
          >
            {RECOMMENDED_SECTION.title}
          </h2>
        </div>

        {RECOMMENDED.length > FEATURED_RECOMMENDED.length && (
          <Link
            className="inline-flex items-center gap-1.5 pb-1 text-sm leading-[1.3] text-primary transition-colors duration-200 hover:text-primary-hover"
            to="/recommended"
          >
            {allLabel}
            <span
              className="mdi mdi-arrow-right arrow-jiggle shrink-0 leading-none"
              aria-hidden="true"
            />
          </Link>
        )}
      </div>

      <div className="mt-7 grid grid-cols-1 gap-6 md:grid-cols-3">
        {FEATURED_RECOMMENDED.map((item) => (
          <RecommendedCard key={item.id} item={item} compact />
        ))}
      </div>
    </section>
  )
}
