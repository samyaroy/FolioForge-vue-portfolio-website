import type { ReadingItem } from '../../../../content/readings/data'
import { READINGS_SECTION } from '../../../../content/sections'
import { formatDate } from '../../../../lib/format'
import {
  CARD_ART_BACKDROP_CLASS,
  CARD_EXCERPT_CLASS,
  CARD_META_CLASS,
  CARD_SHELL_CLASS,
  CARD_TITLE_CLASS,
} from '../../../../lib/ui'

type ReadingCardProps = {
  reading: ReadingItem
  illustrationSide?: 'left' | 'right'
}

export function ReadingCard({
  reading,
  illustrationSide = 'left',
}: ReadingCardProps) {
  const artRight = illustrationSide === 'right'

  return (
    <article
      className={`grid grid-cols-1 items-stretch gap-6 rounded-lg ${CARD_SHELL_CLASS} md:min-h-52 ${
        artRight
          ? 'md:grid-cols-[minmax(0,1fr)_20%]'
          : 'md:grid-cols-[20%_minmax(0,1fr)]'
      }`}
    >
      <div
        className={`relative grid min-h-28 min-w-32 place-items-center overflow-hidden border-b border-[rgba(15,23,42,0.07)] ${CARD_ART_BACKDROP_CLASS} md:min-h-0 md:border-b-0 ${
          artRight ? 'md:order-2 md:border-l' : 'md:border-r'
        }`}
        aria-hidden="true"
      >
        <span className="relative block aspect-[0.72] w-[clamp(3.2rem,42%,5rem)] rounded-[6px_8px_8px_6px] [background:linear-gradient(135deg,#1980e6_0%,#1e3a8a_100%)] shadow-[-0.45rem_0.45rem_0_rgba(15,23,42,0.08),0_1rem_1.8rem_rgba(15,23,42,0.18)] before:absolute before:inset-[0.65rem_auto_0.65rem_0.55rem] before:w-[0.28rem] before:rounded-full before:bg-[rgba(255,255,255,0.72)] before:content-[''] after:absolute after:right-[0.65rem] after:bottom-3 after:left-[1.15rem] after:h-[0.28rem] after:rounded-full after:bg-[rgba(255,255,255,0.76)] after:shadow-[0_-0.65rem_0_rgba(255,255,255,0.54)] after:content-['']" />
      </div>

      <div className="flex min-w-0 flex-col px-[1.6rem] py-6">
        <div className="flex flex-col items-start justify-between gap-[0.45rem] md:flex-row md:gap-4">
          <h2 className={`min-w-0 ${CARD_TITLE_CLASS}`}>{reading.title}</h2>
          {reading.date && (
            <time
              className="inline-flex flex-none items-center gap-1 text-left text-xs leading-[1.35] font-normal tracking-[0.12em] text-faint uppercase md:text-right"
              dateTime={reading.date}
            >
              <span
                className="mdi mdi-calendar-blank-outline leading-none"
                aria-hidden="true"
              />
              {formatDate(reading.date)}
            </time>
          )}
        </div>
        <div className={CARD_META_CLASS}>
          <span>{reading.genre}</span>
          <span className="tracking-normal text-primary" aria-hidden="true">
            •
          </span>
          <span>{reading.author}</span>
        </div>
        {reading.description && (
          <p className={CARD_EXCERPT_CLASS}>{reading.description}</p>
        )}
        <span className="mt-auto self-end pt-4 text-[0.9rem] leading-[1.3] font-normal text-primary">
          {READINGS_SECTION.reviewLabel}
        </span>
      </div>
    </article>
  )
}
