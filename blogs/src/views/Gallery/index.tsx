import { useMemo, useState } from 'react'
import { GalleryFilter } from './components/GalleryFilter'
import { GalleryGrid } from './components/GalleryGrid'
import { GalleryHero } from './components/GalleryHero'
import { GALLERY_FILTER_OPTIONS, GALLERY_ITEMS } from '../../content/gallery/data'
import { GALLERY_SECTION } from '../../content/sections'
import { usePageTitle } from '../../lib/usePageTitle'
import { getTimestamp } from './utils'

const INITIAL_VISIBLE_COUNT = 15
const LOAD_MORE_INCREMENT = 10

export function GalleryPage() {
  usePageTitle(GALLERY_SECTION.title)
  const [activeFilters, setActiveFilters] = useState<string[]>([])
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT)

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
    setVisibleCount(INITIAL_VISIBLE_COUNT)
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
          onLoadMore={() => setVisibleCount((count) => count + LOAD_MORE_INCREMENT)}
        />
      </div>
    </section>
  )
}
