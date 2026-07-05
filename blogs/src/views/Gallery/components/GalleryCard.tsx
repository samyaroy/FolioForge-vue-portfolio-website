import { createPortal } from 'react-dom'
import { useEffect, useState } from 'react'
import galleryFallbackSample from '../../../../../src/views/Gallery/assets/gallery-fallback-sample.svg'
import type { GalleryItem } from '../../../content/gallery/data'
import {
  formatDate,
  getPlatformBadgeClass,
  getPlatformIcon,
  getPlatformKey,
  getZoomTitleId,
  wrapImageIndex,
} from '../utils'

type GalleryCardProps = {
  item: GalleryItem
}

export function GalleryCard({ item }: GalleryCardProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [failedIndices, setFailedIndices] = useState<Set<number>>(new Set())
  const [isZoomOpen, setIsZoomOpen] = useState(false)
  const images = item.images.length ? item.images : item.image ? [item.image] : []
  const hasMultipleImages = images.length > 1
  const currentImage =
    !images[currentIndex] || failedIndices.has(currentIndex)
      ? galleryFallbackSample
      : images[currentIndex]
  const platformKey = getPlatformKey(item.type)
  const formattedDate = formatDate(item.date)
  const resolvedAlt = item.alt || item.id || 'Gallery item preview'
  const zoomTitleId = getZoomTitleId(item)
  const shouldShowPlatformBadge =
    platformKey === 'linkedin' || platformKey === 'instagram'

  useEffect(() => {
    setCurrentIndex(0)
    setFailedIndices(new Set())
    setIsZoomOpen(false)
  }, [item.id])

  useEffect(() => {
    if (typeof document === 'undefined') return
    if (!isZoomOpen) return

    const previousOverflow = document.body.style.overflow

    function handleZoomKeydown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsZoomOpen(false)
        return
      }

      if (!hasMultipleImages) return

      if (event.key === 'ArrowRight') {
        setCurrentIndex((index) => wrapImageIndex(index + 1, images.length))
      } else if (event.key === 'ArrowLeft') {
        setCurrentIndex((index) => wrapImageIndex(index - 1, images.length))
      }
    }

    document.addEventListener('keydown', handleZoomKeydown)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleZoomKeydown)
      document.body.style.overflow = previousOverflow
    }
  }, [hasMultipleImages, images.length, isZoomOpen])

  function showImageAt(index: number) {
    if (!images.length) return

    setCurrentIndex(wrapImageIndex(index, images.length))
  }

  function handleImageError() {
    setFailedIndices((indices) => {
      if (indices.has(currentIndex)) return indices

      const nextIndices = new Set(indices)
      nextIndices.add(currentIndex)
      return nextIndices
    })
  }

  return (
    <>
      <article
        className={`group relative overflow-hidden rounded-b-[6px] rounded-t-none bg-white shadow-[0_12px_32px_-4px_rgba(14,20,27,0.08)] ring-1 ring-slate-900/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_42px_-10px_rgba(14,20,27,0.14)] ${
          item.featured
            ? 'shadow-[0_18px_42px_-12px_rgba(24,128,230,0.2)] ring-primary/20'
            : ''
        }`}
      >
        <div className="relative h-[200px] overflow-hidden rounded-t-none bg-slate-100 sm:h-[220px]">
          {item.featured && (
            <span className="absolute top-3 right-3 z-10 inline-flex h-7 w-7 items-center justify-center rounded-[6px] bg-white/90 p-0 shadow-[0_12px_24px_-14px_rgba(14,20,27,0.65)] ring-1 ring-slate-900/10 backdrop-blur-sm">
              <span
                className="mdi mdi-star text-sm leading-none text-yellow-500"
                aria-hidden="true"
              />
            </span>
          )}
          <button
            type="button"
            className="absolute right-3 bottom-3 z-10 inline-flex h-8 w-8 items-center justify-center rounded-[6px] border border-white/70 bg-white/90 p-0 text-slate-700 shadow-[0_12px_24px_-14px_rgba(14,20,27,0.65)] backdrop-blur-sm transition-colors hover:border-white hover:bg-white hover:text-primary focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:outline-none"
            aria-label={`Zoom image: ${item.id || 'gallery item'}`}
            onClick={() => setIsZoomOpen(true)}
          >
            <span
              className="mdi mdi-magnify-plus-outline text-base leading-none"
              aria-hidden="true"
            />
          </button>
          <img
            src={currentImage}
            alt={resolvedAlt}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            loading="lazy"
            onError={handleImageError}
          />

          {hasMultipleImages && (
            <>
              <button
                type="button"
                className="absolute top-1/2 left-3 z-10 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-white/90 p-0 text-slate-700 shadow-[0_12px_24px_-14px_rgba(14,20,27,0.65)] backdrop-blur-sm transition-colors hover:border-white hover:bg-white hover:text-primary focus:ring-2 focus:ring-primary focus:outline-none"
                aria-label="Previous image"
                onClick={() => showImageAt(currentIndex - 1)}
              >
                <span
                  className="mdi mdi-chevron-left text-[22px] leading-none"
                  aria-hidden="true"
                />
              </button>
              <button
                type="button"
                className="absolute top-1/2 right-3 z-10 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-white/90 p-0 text-slate-700 shadow-[0_12px_24px_-14px_rgba(14,20,27,0.65)] backdrop-blur-sm transition-colors hover:border-white hover:bg-white hover:text-primary focus:ring-2 focus:ring-primary focus:outline-none"
                aria-label="Next image"
                onClick={() => showImageAt(currentIndex + 1)}
              >
                <span
                  className="mdi mdi-chevron-right text-[22px] leading-none"
                  aria-hidden="true"
                />
              </button>
              <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-slate-950/40 px-2 py-1 backdrop-blur-sm">
                {images.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    className={`h-1.5 rounded-full p-0 transition-all ${
                      index === currentIndex
                        ? 'w-4 bg-white'
                        : 'w-1.5 bg-white/60 hover:bg-white/80'
                    }`}
                    aria-label={`Show image ${index + 1} of ${images.length}`}
                    aria-current={index === currentIndex}
                    onClick={() => showImageAt(index)}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        <div className="border-t border-slate-100 px-3 py-2">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 flex-col gap-0.5">
              {formattedDate && (
                <span className="inline-flex max-w-full items-center rounded-[6px] text-[10px] font-medium leading-tight text-slate-600/80">
                  <span
                    className="mdi mdi-calendar-blank-outline mr-1 shrink-0 text-xs leading-none text-slate-500"
                    aria-hidden="true"
                  />
                  <span className="truncate">{formattedDate}</span>
                </span>
              )}
              {item.location && (
                <span className="inline-flex max-w-full items-center rounded-[6px] text-[10px] leading-tight text-slate-600/80">
                  <span
                    className="mdi mdi-map-marker mr-1 shrink-0 text-xs leading-none text-slate-500"
                    aria-hidden="true"
                  />
                  <span className="truncate">{item.location}</span>
                </span>
              )}
            </div>

            {shouldShowPlatformBadge && item.externalUrl ? (
              <a
                href={item.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-[6px] text-white shadow-[0_10px_24px_-16px_rgba(14,20,27,0.75)] transition-transform hover:scale-105 ${getPlatformBadgeClass(
                  platformKey,
                )}`}
                aria-label={`Open ${platformKey} post`}
              >
                <span
                  className={`mdi ${getPlatformIcon(platformKey)} text-lg leading-none`}
                  aria-hidden="true"
                />
              </a>
            ) : shouldShowPlatformBadge ? (
              <div
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-[6px] text-white shadow-[0_10px_24px_-16px_rgba(14,20,27,0.75)] ${getPlatformBadgeClass(
                  platformKey,
                )}`}
              >
                <span
                  className={`mdi ${getPlatformIcon(platformKey)} text-lg leading-none`}
                  aria-hidden="true"
                />
              </div>
            ) : null}
          </div>
        </div>
      </article>

      {isZoomOpen &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 py-6"
            role="dialog"
            aria-modal="true"
            aria-labelledby={zoomTitleId}
            onClick={(event) => {
              if (event.target === event.currentTarget) setIsZoomOpen(false)
            }}
          >
            <div className="flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-lg bg-slate-950 shadow-2xl">
              <header className="flex items-center justify-between gap-4 border-b border-white/10 px-4 py-3">
                <h2
                  id={zoomTitleId}
                  className="truncate text-base font-semibold text-white"
                >
                  {item.id || 'Gallery image'}
                </h2>

                <button
                  type="button"
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[6px] bg-white/10 p-0 text-white transition-colors hover:bg-white/20 focus:ring-2 focus:ring-white/70 focus:outline-none"
                  aria-label="Close image zoom"
                  onClick={() => setIsZoomOpen(false)}
                >
                  <span
                    className="mdi mdi-close text-[22px] leading-none"
                    aria-hidden="true"
                  />
                </button>
              </header>

              <div className="relative flex min-h-0 flex-1 items-center justify-center bg-black">
                <img
                  src={currentImage}
                  alt={resolvedAlt}
                  className="max-h-[82vh] w-full object-contain"
                />

                {hasMultipleImages && (
                  <>
                    <button
                      type="button"
                      className="absolute top-1/2 left-4 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 p-0 text-white transition-colors hover:bg-white/20 focus:ring-2 focus:ring-white/70 focus:outline-none"
                      aria-label="Previous image"
                      onClick={() => showImageAt(currentIndex - 1)}
                    >
                      <span
                        className="mdi mdi-chevron-left text-[26px] leading-none"
                        aria-hidden="true"
                      />
                    </button>
                    <button
                      type="button"
                      className="absolute top-1/2 right-4 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 p-0 text-white transition-colors hover:bg-white/20 focus:ring-2 focus:ring-white/70 focus:outline-none"
                      aria-label="Next image"
                      onClick={() => showImageAt(currentIndex + 1)}
                    >
                      <span
                        className="mdi mdi-chevron-right text-[26px] leading-none"
                        aria-hidden="true"
                      />
                    </button>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white">
                      {currentIndex + 1} / {images.length}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  )
}
