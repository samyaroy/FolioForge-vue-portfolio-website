import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import type { ReadingItem } from '../../../../content/readings/data'
import { READINGS_SECTION } from '../../../../content/sections'
import { formatDate } from '../../../../lib/format'
import { CARD_ART_BACKDROP_CLASS, CARD_META_CLASS } from '../../../../lib/ui'
import { BookArt } from '../BookArt'

type ReadingModalProps = {
  reading: ReadingItem
  onClose: () => void
}

const STARS = [1, 2, 3, 4, 5]

export function ReadingModal({ reading, onClose }: ReadingModalProps) {
  const [coverFailed, setCoverFailed] = useState(false)
  const titleId = `reading-review-title-${reading.id}`
  const rating = reading.rating
  const coverImage = coverFailed ? undefined : reading.image
  const noteParagraphs = (reading.note || reading.description || '')
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)

  useEffect(() => {
    if (typeof document === 'undefined') return

    const previousOverflow = document.body.style.overflow

    function handleKeydown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleKeydown)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeydown)
      document.body.style.overflow = previousOverflow
    }
  }, [onClose])

  if (typeof document === 'undefined') return null

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-6 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-lg bg-surface shadow-2xl">
        <header className="flex items-start justify-between gap-4 border-b border-[rgba(15,23,42,0.07)] px-6 py-4">
          <div className="min-w-0">
            <h2
              id={titleId}
              className="text-xl leading-[1.35] font-bold tracking-[-0.02em] text-ink"
            >
              {reading.title}
            </h2>
            <p className="mt-0.5 text-sm text-muted">by {reading.author}</p>
          </div>
          <button
            type="button"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[6px] bg-slate-900/5 p-0 text-slate-600 transition-colors hover:bg-slate-900/10 hover:text-ink focus:ring-2 focus:ring-primary focus:outline-none"
            aria-label="Close review"
            onClick={onClose}
          >
            <span
              className="mdi mdi-close text-[22px] leading-none"
              aria-hidden="true"
            />
          </button>
        </header>

        <div className="grid min-h-0 flex-1 grid-cols-1 overflow-y-auto md:grid-cols-[14rem_minmax(0,1fr)]">
          <div
            className={`grid place-items-center border-b border-[rgba(15,23,42,0.07)] p-6 md:border-r md:border-b-0 ${CARD_ART_BACKDROP_CLASS}`}
          >
            {coverImage ? (
              <img
                src={coverImage}
                alt={`Cover of ${reading.title}`}
                className="max-h-72 w-auto max-w-full rounded-[6px] shadow-[-0.45rem_0.45rem_0_rgba(15,23,42,0.08),0_1rem_1.8rem_rgba(15,23,42,0.18)]"
                loading="lazy"
                onError={() => setCoverFailed(true)}
              />
            ) : (
              <BookArt className="w-24" />
            )}
          </div>

          <div className="flex min-w-0 flex-col px-6 py-6">
            <div className={`${CARD_META_CLASS} mt-0`}>
              <span>{reading.genre}</span>
              <span className="tracking-normal text-primary" aria-hidden="true">
                •
              </span>
              {reading.date && (
                <time dateTime={reading.date}>{formatDate(reading.date)}</time>
              )}
            </div>

            {typeof rating === 'number' && (
              <div
                className="mt-3 flex items-center gap-1"
                role="img"
                aria-label={`Rated ${rating} out of 5`}
              >
                {STARS.map((star) => (
                  <span
                    key={star}
                    className={`mdi text-base leading-none ${
                      star <= rating
                        ? 'mdi-star text-yellow-500'
                        : 'mdi-star-outline text-slate-300'
                    }`}
                    aria-hidden="true"
                  />
                ))}
              </div>
            )}

            <h3 className="mt-5 text-xs leading-normal font-bold tracking-[0.16em] text-faint uppercase">
              {READINGS_SECTION.noteLabel}
            </h3>
            {noteParagraphs.map((paragraph, index) => (
              <p
                key={index}
                className="mt-3 text-justify text-sm leading-[1.75] text-muted"
              >
                {paragraph}
              </p>
            ))}

            {reading.link && (
              <a
                href={reading.link}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-auto inline-flex items-center gap-1 self-end pt-5 text-sm leading-[1.3] font-normal text-primary transition-colors hover:text-primary/80"
              >
                {READINGS_SECTION.linkLabel}
                <span
                  className="mdi mdi-open-in-new text-sm leading-none"
                  aria-hidden="true"
                />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
