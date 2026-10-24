import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { RecommendedCard } from '../../../components/RecommendedCard'
import { FEATURED_RECOMMENDED } from '../../../content/recommended/data'
import { RECOMMENDED_SECTION } from '../../../content/sections'

const ARROW_CLASS =
  'inline-flex size-9 items-center justify-center rounded-full border border-border bg-surface text-muted shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-colors duration-200 hover:border-primary hover:text-primary focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-40'

// How far the edge fade reaches into the track; matches its side padding so
// a card at rest is never faded, only one that is partly scrolled off.
const FADE = '1rem'

type TrackState = {
  atStart: boolean
  atEnd: boolean
  /** Visible share of the track and how far along it is, both 0-1, for the
      progress bar. */
  visible: number
  offset: number
}

/**
 * The blog home page's window onto /recommended: the first entries from
 * content/recommended/data.yml in a swipeable row of cards, plus the link
 * through to the whole, shelved list. A native scroll-snap track, so touch,
 * trackpad and keyboard scrolling all work without script; the arrows and
 * progress bar are layered on top.
 */
export function RecommendedTeaser() {
  const trackRef = useRef<HTMLUListElement>(null)
  const [track, setTrack] = useState<TrackState>({
    atStart: true,
    atEnd: false,
    visible: 1,
    offset: 0,
  })

  useEffect(() => {
    const element = trackRef.current
    if (!element) return

    let frame = 0
    const measure = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const { scrollLeft, scrollWidth, clientWidth } = element
        setTrack({
          atStart: scrollLeft <= 1,
          atEnd: scrollLeft + clientWidth >= scrollWidth - 1,
          visible: scrollWidth > 0 ? clientWidth / scrollWidth : 1,
          offset: scrollWidth > 0 ? scrollLeft / scrollWidth : 0,
        })
      })
    }

    measure()
    element.addEventListener('scroll', measure, { passive: true })
    const observer = new ResizeObserver(measure)
    observer.observe(element)
    return () => {
      cancelAnimationFrame(frame)
      element.removeEventListener('scroll', measure)
      observer.disconnect()
    }
  }, [])

  if (FEATURED_RECOMMENDED.length === 0) return null

  // A page at a time; snapping then settles on the nearest card edge.
  const page = (direction: -1 | 1) => {
    const element = trackRef.current
    if (!element) return
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    element.scrollBy({
      left: direction * element.clientWidth,
      behavior: reduceMotion ? 'auto' : 'smooth',
    })
  }

  const scrollable = !(track.atStart && track.atEnd)
  const mask = `linear-gradient(to right, ${
    track.atStart ? '#000' : 'transparent'
  }, #000 ${FADE}, #000 calc(100% - ${FADE}), ${track.atEnd ? '#000' : 'transparent'})`

  return (
    <section
      className="mx-auto max-w-6xl"
      aria-roledescription="carousel"
      aria-labelledby="recommended-teaser-heading"
    >
      <div className="flex items-end justify-between gap-4">
        <h2
          id="recommended-teaser-heading"
          className="font-[Poppins,Inter,system-ui,sans-serif] text-[clamp(1.5rem,2.2vw,1.75rem)] leading-[1.2] font-light text-ink"
        >
          {RECOMMENDED_SECTION.homeTitle}
        </h2>

        <div className="flex shrink-0 items-center gap-4">
          <Link
            className="inline-flex items-center gap-1.5 text-sm leading-[1.3] text-primary transition-colors duration-200 hover:text-primary-hover"
            to="/recommended"
          >
            {RECOMMENDED_SECTION.allLabel}
            <span
              className="mdi mdi-arrow-right arrow-jiggle shrink-0 leading-none"
              aria-hidden="true"
            />
          </Link>

          {scrollable && (
            <div className="hidden items-center gap-2 sm:flex">
              <button
                type="button"
                className={ARROW_CLASS}
                aria-label={RECOMMENDED_SECTION.carouselPrevious}
                disabled={track.atStart}
                onClick={() => page(-1)}
              >
                <span className="mdi mdi-chevron-left text-xl leading-none" aria-hidden="true" />
              </button>
              <button
                type="button"
                className={ARROW_CLASS}
                aria-label={RECOMMENDED_SECTION.carouselNext}
                disabled={track.atEnd}
                onClick={() => page(1)}
              >
                <span className="mdi mdi-chevron-right text-xl leading-none" aria-hidden="true" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bleeds 1rem past the column on each side (into the layout's own
          gutter) so card shadows and the hover lift are not clipped at the
          edges; the padding puts the cards back on the column line. */}
      <ul
        ref={trackRef}
        tabIndex={0}
        aria-label={RECOMMENDED_SECTION.homeTitle}
        className="-mx-4 mt-5 flex snap-x snap-mandatory scroll-px-4 gap-6 overflow-x-auto overscroll-x-contain px-4 pt-2 pb-10 [scrollbar-width:none] focus-visible:outline-none [&::-webkit-scrollbar]:hidden"
        style={{ maskImage: mask, WebkitMaskImage: mask }}
      >
        {FEATURED_RECOMMENDED.map((item, index) => (
          <li
            key={item.id}
            className="w-[85%] shrink-0 snap-start sm:w-[calc((100%-1.5rem)/2)] lg:w-[calc((100%-3rem)/3)]"
            aria-roledescription="slide"
            aria-label={`${index + 1} / ${FEATURED_RECOMMENDED.length}`}
          >
            <RecommendedCard item={item} compact />
          </li>
        ))}
      </ul>

      {scrollable && (
        <div
          className="relative -mt-4 h-1 overflow-hidden rounded-full bg-border"
          aria-hidden="true"
        >
          <span
            className="absolute inset-y-0 rounded-full bg-primary transition-[left,width] duration-150 ease-out"
            style={{
              left: `${track.offset * 100}%`,
              width: `${track.visible * 100}%`,
            }}
          />
        </div>
      )}
    </section>
  )
}
