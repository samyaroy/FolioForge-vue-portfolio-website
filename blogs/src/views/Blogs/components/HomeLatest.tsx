import { useState } from 'react'
import { Link } from 'react-router-dom'
import { HOME_LATEST_LABELS as LABELS } from '../../../content/site'
import { CARD_ART_BACKDROP_CLASS, CARD_META_CLASS } from '../../../lib/ui'
import type { LatestItem } from './latestItems'

// Square thumbnail; falls back to the section icon when there's no image or
// it fails to load.
function Thumb({ image, icon }: { image?: string; icon: string }) {
  const [failed, setFailed] = useState(false)

  return (
    <span
      className={`relative size-16 shrink-0 overflow-hidden rounded-lg ${CARD_ART_BACKDROP_CLASS}`}
    >
      {image && !failed ? (
        <img
          src={image}
          alt=""
          loading="lazy"
          onError={() => setFailed(true)}
          className="absolute inset-0 size-full object-cover"
        />
      ) : (
        <span
          className={`mdi ${icon} absolute inset-0 flex items-center justify-center text-2xl leading-none text-primary/60`}
          aria-hidden="true"
        />
      )}
    </span>
  )
}

/**
 * "What's new" panel shown beside the blog home hero: one row per section,
 * each linking to the newest entry there, so the first screen carries real
 * content and not only the hero artwork.
 */
export function HomeLatest({ items }: { items: LatestItem[] }) {
  return (
    <section aria-labelledby="home-latest-heading" className="min-w-0">
      <p className={`${CARD_META_CLASS} mt-0!`}>{LABELS.kicker}</p>
      <h2
        id="home-latest-heading"
        className="mt-2 font-[Poppins,Inter,system-ui,sans-serif] text-[clamp(1.25rem,1.8vw,1.5rem)] leading-[1.2] font-light text-ink"
      >
        {LABELS.title}
      </h2>

      <ul className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-1">
        {items.map((item) => (
          <li key={item.key}>
            <Link
              to={item.to}
              viewTransition
              className="group flex items-center gap-3.5 rounded-xl border border-border bg-surface p-2.5 pr-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-0.5 hover:border-[rgba(25,128,230,0.2)] hover:shadow-[0_12px_28px_-10px_rgba(14,20,27,0.14)]"
            >
              <Thumb image={item.image} icon={item.icon} />
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1 text-[0.625rem] leading-normal font-semibold tracking-[0.12em] text-faint uppercase">
                  <span className={`mdi ${item.icon} text-xs leading-none text-primary`} aria-hidden="true" />
                  {item.kicker}
                </span>
                <span className="mt-0.5 line-clamp-1 text-sm leading-snug font-semibold text-ink group-hover:text-primary">
                  {item.title}
                </span>
                {item.meta && (
                  <span className="mt-0.5 line-clamp-1 text-xs leading-normal font-normal text-muted">
                    {item.meta}
                  </span>
                )}
              </span>
              <span
                className="mdi mdi-arrow-right shrink-0 text-base leading-none text-faint transition-[color,transform] duration-200 group-hover:translate-x-0.5 group-hover:text-primary"
                aria-hidden="true"
              />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
