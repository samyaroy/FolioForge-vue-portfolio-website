import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { ReviewShare } from '../ReviewShare'
import { formatDate } from '../../lib/format'
import { CARD_ART_BACKDROP_CLASS, CARD_META_CLASS } from '../../lib/ui'

type ReviewModalProps = {
  title: string
  shareUrl: string
  genre: string
  byline: ReactNode
  image?: string
  imageAlt: string
  fallbackArt: ReactNode
  date?: string
  dateLabel?: string
  rating?: number
  review?: string
  reviewLabel: string
  emptyLabel: string
  link?: string
  linkLabel: string
  onClose: () => void
}

const STARS = [1, 2, 3, 4, 5]

export function ReviewModal({
  title, shareUrl, genre, byline, image, imageAlt, fallbackArt, date, dateLabel,
  rating, review, reviewLabel, emptyLabel, link, linkLabel, onClose,
}: ReviewModalProps) {
  const [failedImage, setFailedImage] = useState<string>()
  const titleId = useId()
  const dialogRef = useRef<HTMLDivElement>(null)
  const reviewParagraphs = (review ?? '')
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)

  useEffect(() => {
    if (typeof document === 'undefined') return

    const previousOverflow = document.body.style.overflow
    const previousFocus = document.activeElement instanceof HTMLElement
      ? document.activeElement : null
    const dialog = dialogRef.current
    dialog?.focus()

    function handleKeydown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
      if (event.key !== 'Tab' || !dialog) return

      const focusable = Array.from(dialog.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex="0"]',
      ))
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (!first || !last) {
        event.preventDefault()
        return
      }
      if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog)) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && (document.activeElement === last || document.activeElement === dialog)) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeydown)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeydown)
      document.body.style.overflow = previousOverflow
      previousFocus?.focus()
    }
  }, [onClose])

  if (typeof document === 'undefined') return null

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-2 backdrop-blur-sm sm:p-5"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="flex h-[94dvh] max-h-[60rem] w-full max-w-6xl flex-col overflow-hidden rounded-lg bg-surface shadow-2xl outline-none sm:h-[90dvh]"
      >
        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-[rgba(15,23,42,0.07)] px-6 py-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <h2
                id={titleId}
                className="text-xl leading-[1.35] font-bold tracking-[-0.02em] text-ink"
              >
                {title}
              </h2>
              <p className={`${CARD_META_CLASS} mt-0!`}>{genre}</p>
            </div>
            <p className="mt-0.5 text-sm text-muted">
              {byline}
            </p>
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

        <div className="grid min-h-0 flex-1 grid-cols-1 overflow-y-auto md:grid-cols-[12rem_minmax(0,1fr)] lg:grid-cols-[14rem_minmax(0,1fr)]">
          <div
            className={`grid content-start justify-items-center border-b border-[rgba(15,23,42,0.07)] p-6 md:border-r md:border-b-0 ${CARD_ART_BACKDROP_CLASS}`}
          >
            {image && image !== failedImage ? (
              <img
                src={image}
                alt={imageAlt}
                className="max-h-32 w-auto md:max-h-72 max-w-full rounded-[6px] shadow-[-0.45rem_0.45rem_0_rgba(15,23,42,0.08),0_1rem_1.8rem_rgba(15,23,42,0.18)]"
                loading="lazy"
                onError={() => setFailedImage(image)}
              />
            ) : (
              fallbackArt
            )}
          </div>

          <div className="mx-auto flex w-full min-w-0 max-w-3xl flex-col px-5 py-6 sm:px-8 sm:py-8 lg:px-10">
            {date && (
              <div className={`${CARD_META_CLASS} mt-0`}>
                <time dateTime={date}>
                  {dateLabel ? `${dateLabel} ` : ''}{formatDate(date)}
                </time>
              </div>
            )}

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
              {reviewLabel}
            </h3>
            {reviewParagraphs.map((paragraph, index) => (
              <p
                key={index}
                className="mt-3 text-justify text-base leading-[1.85] wrap-break-word text-muted"
              >
                {paragraph}
              </p>
            ))}

            {reviewParagraphs.length === 0 && (
              <p className="mt-3 text-sm leading-[1.75] text-muted">
                {emptyLabel}
              </p>
            )}

            {link && (
              <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-auto inline-flex items-center gap-1 self-end pt-5 text-sm leading-[1.3] font-normal text-primary transition-colors hover:text-primary/80"
              >
                {linkLabel}
                <span
                  className="mdi mdi-open-in-new text-sm leading-none"
                  aria-hidden="true"
                />
              </a>
            )}
          </div>
        </div>
        <ReviewShare title={title} review={review} url={shareUrl} />
      </div>
    </div>,
    document.body,
  )
}
