import { useState } from 'react'
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
import { BookArt } from '../BookArt'
import { ReadingModal } from '../ReadingModal'

type ReadingCardProps = {
  reading: ReadingItem
  illustrationSide?: 'left' | 'right'
}

export function ReadingCard({
  reading,
  illustrationSide = 'left',
}: ReadingCardProps) {
  const [isReviewOpen, setIsReviewOpen] = useState(false)
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
        <BookArt className="w-[clamp(3.2rem,42%,5rem)]" />
      </div>

      <div className="flex min-w-0 flex-col px-[1.6rem] py-6">
        <div className="flex flex-col items-start justify-between gap-[0.45rem] md:flex-row md:gap-4">
          <h2 className={`min-w-0 ${CARD_TITLE_CLASS}`}>{reading.title}</h2>
          {reading.date && (
            <time
              className="inline-flex flex-none items-center gap-1 text-left text-xs leading-[1.35] font-normal tracking-normal normal-case text-faint md:text-right"
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
        <button
          type="button"
          className="mt-auto self-end p-0 pt-4 text-sm leading-[1.3] font-normal text-primary transition-colors hover:text-primary/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          onClick={() => setIsReviewOpen(true)}
        >
          {READINGS_SECTION.reviewLabel}
        </button>
      </div>

      {isReviewOpen && (
        <ReadingModal reading={reading} onClose={() => setIsReviewOpen(false)} />
      )}
    </article>
  )
}
