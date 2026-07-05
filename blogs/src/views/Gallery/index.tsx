import { useMemo, useState } from 'react'
import { GalleryFilter } from './components/GalleryFilter'
import { GalleryGrid } from './components/GalleryGrid'
import { GalleryHero } from './components/GalleryHero'
import { GALLERY_FILTER_OPTIONS, GALLERY_ITEMS } from '../../content/gallery/data'
import { getTimestamp } from './utils'

const VISIBLE_BATCH_SIZE = 16

export function GalleryPage() {
  const [activeFilters, setActiveFilters] = useState<string[]>([])
  const [visibleCount, setVisibleCount] = useState(VISIBLE_BATCH_SIZE)

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

  function updateActiveFilters(nextFilters: string[]) {
    setActiveFilters(nextFilters)
    setVisibleCount(VISIBLE_BATCH_SIZE)
  }

  return (
    <section className="relative left-1/2 -mt-8 -mb-16 min-h-screen w-screen -translate-x-1/2 bg-slate-50 lg:-mt-10 lg:-mb-20">
      <div className="mx-auto flex w-full max-w-[84rem] flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
        <GalleryHero />

        <div className="relative z-30 -my-4 ml-auto flex w-full items-center">
          <div className="flex-1">
            <hr className="border-slate-300" />
          </div>
          <div className="flex shrink-0 items-center justify-end gap-3 pl-4">
            <span className="whitespace-nowrap text-xs font-semibold tracking-[0.16em] text-slate-400 uppercase">
              {totalItemCount} {totalItemCount === 1 ? 'entry' : 'entries'}
            </span>
            {GALLERY_FILTER_OPTIONS.length > 1 && (
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
          canLoadMore={canLoadMore}
          onLoadMore={() => setVisibleCount((count) => count + VISIBLE_BATCH_SIZE)}
        />
      </div>
    </section>
  )
}
