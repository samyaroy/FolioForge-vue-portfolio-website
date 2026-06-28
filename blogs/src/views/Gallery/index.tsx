import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { GalleryFilter } from './components/GalleryFilter'
import { GalleryGrid } from './components/GalleryGrid'
import { GalleryHero } from './components/GalleryHero'
import { GALLERY_FILTER_OPTIONS, GALLERY_ITEMS } from '../../content/gallery/data'
import { GALLERY_SECTION } from '../../content/sections'
import { GALLERY_ITEM_PARAM, galleryAnchorId } from '../../lib/share'
import { usePageTitle } from '../../lib/usePageTitle'
import { getTimestamp } from './utils'

const INITIAL_VISIBLE_COUNT = 15
const LOAD_MORE_INCREMENT = 10
const HIGHLIGHT_DURATION_MS = 4000

export function GalleryPage() {
  usePageTitle(GALLERY_SECTION.title)
  const [activeFilters, setActiveFilters] = useState<string[]>([])
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT)
  const [searchParams] = useSearchParams()
  // Card a shared link pointed at. The ring is a temporary "here it is" marker,
  // not a selection, so it fades on its own.
  const [highlightedId, setHighlightedId] = useState('')
  const sharedItemId = searchParams.get(GALLERY_ITEM_PARAM) ?? ''
  const preparedShareIdRef = useRef('')
  const focusedShareIdRef = useRef('')

  const sortedItems = useMemo(
    () =>
      [...GALLERY_ITEMS].sort((firstItem, secondItem) => {
        const firstTimestamp = getTimestamp(firstItem.date, firstItem.originalIndex)
        const secondTimestamp = getTimestamp(
          secondItem.date,
          secondItem.originalIndex,
        )

        return secondTimestamp - firstTimestamp
      }),
    [],
  )
  const filteredItems = useMemo(() => {
    if (!activeFilters.length) return sortedItems

    return sortedItems.filter(
      (item) =>
        Array.isArray(item.filterTags) &&
        activeFilters.some((filter) => item.filterTags.includes(filter)),
    )
  }, [activeFilters, sortedItems])
  const visibleItems = filteredItems.slice(0, visibleCount)
  const canLoadMore = filteredItems.length > visibleCount
  const totalItemCount = sortedItems.length

  // Opening the card named by `?item=`, the link every card's share menu hands
  // out, takes two passes: this one clears whatever stands between the card and
  // the DOM. The ref makes it run once per shared id, so it can never fight the
  // filter the visitor picks afterwards.
  useEffect(() => {
    if (!sharedItemId || preparedShareIdRef.current === sharedItemId) return

    const itemIndex = sortedItems.findIndex((item) => item.id === sharedItemId)
    if (itemIndex === -1) return

    preparedShareIdRef.current = sharedItemId
    setActiveFilters([])
    setVisibleCount((count) => Math.max(count, itemIndex + 1))
  }, [sharedItemId, sortedItems])

  // Second pass: the card is in the grid now, so it can be scrolled to. Re-runs
  // as paging and filters settle, and stops for good once it has fired.
  useEffect(() => {
    if (!sharedItemId || focusedShareIdRef.current === sharedItemId) return

    const cardElement = document.getElementById(galleryAnchorId(sharedItemId))
    if (!cardElement) return

    focusedShareIdRef.current = sharedItemId
    cardElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
    setHighlightedId(sharedItemId)
  }, [sharedItemId, visibleCount, activeFilters])

  useEffect(() => {
    if (!highlightedId) return

    const timer = window.setTimeout(() => setHighlightedId(''), HIGHLIGHT_DURATION_MS)

    return () => window.clearTimeout(timer)
  }, [highlightedId])

  function updateActiveFilters(nextFilters: string[]) {
    setActiveFilters(nextFilters)
    setVisibleCount(INITIAL_VISIBLE_COUNT)
    setHighlightedId('')
  }

  return (
    <section className="ml-[50%] -mt-8 -mb-8 min-h-screen w-screen -translate-x-1/2 bg-slate-50 lg:-mt-10">
      <div className="mx-auto flex w-[85%] flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
        <GalleryHero />

        <div className="relative z-30 -my-4 ml-auto flex w-full items-center">
          <div className="flex-1">
            <hr className="border-slate-300" />
          </div>
          <div className="flex shrink-0 items-center justify-end gap-3 pl-4">
            <span className="whitespace-nowrap text-xs font-semibold tracking-[0.16em] text-slate-400 uppercase">
              {totalItemCount} {totalItemCount === 1 ? 'entry' : 'entries'}
            </span>
            {totalItemCount > 0 && GALLERY_FILTER_OPTIONS.length > 1 && (
              <GalleryFilter
                options={GALLERY_FILTER_OPTIONS.slice(1)}
                selectedFilters={activeFilters}
                onSelectedFiltersChange={updateActiveFilters}
              />
            )}
          </div>
        </div>

        <GalleryGrid
          items={visibleItems}
          hasEntries={totalItemCount > 0}
          canLoadMore={canLoadMore}
          highlightedId={highlightedId}
          onLoadMore={() => setVisibleCount((count) => count + LOAD_MORE_INCREMENT)}
        />
      </div>
    </section>
  )
}
