import { useEffect, useRef, useState } from 'react'
import type { TagOption } from '../../../content/gallery/data'

type GalleryFilterProps = {
  options: TagOption[]
  selectedFilters: string[]
  onSelectedFiltersChange: (filters: string[]) => void
}

export function GalleryFilter({
  options,
  selectedFilters,
  onSelectedFiltersChange,
}: GalleryFilterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRootRef = useRef<HTMLDivElement | null>(null)
  const hasSelectedFilters = selectedFilters.length > 0

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!isOpen) return
      if (menuRootRef.current?.contains(event.target as Node)) return

      setIsOpen(false)
    }

    function handleKeydown(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsOpen(false)
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeydown)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeydown)
    }
  }, [isOpen])

  function toggleFilter(filterId: string) {
    const nextFilters = new Set(selectedFilters)

    if (nextFilters.has(filterId)) {
      nextFilters.delete(filterId)
    } else {
      nextFilters.add(filterId)
    }

    onSelectedFiltersChange(Array.from(nextFilters))
  }

  return (
    <section className="relative z-30">
      <div ref={menuRootRef} className="relative flex flex-col items-end">
        <button
          type="button"
          className="relative inline-flex h-10 w-8 items-center justify-center rounded-full border border-white/60 bg-white/50 text-slate-600 shadow-lg backdrop-blur-md transition-all duration-200 hover:border-primary/60 hover:bg-white/70 hover:text-primary focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:outline-none"
          aria-expanded={isOpen}
          aria-haspopup="dialog"
          aria-label="Open gallery filters"
          onClick={() => setIsOpen((open) => !open)}
        >
          <span
            className={`mdi ${
              hasSelectedFilters ? 'mdi-filter-check-outline' : 'mdi-filter-variant'
            } text-base leading-none`}
            aria-hidden="true"
          />

          {selectedFilters.length > 0 && (
            <span className="absolute -top-1 -right-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-white">
              {selectedFilters.length}
            </span>
          )}
        </button>

        {isOpen && (
          <div
            className="absolute right-0 top-full z-40 mt-2 w-[min(19rem,calc(100vw-2rem))] rounded-[12px] border border-white/70 bg-white/85 p-4 shadow-xl backdrop-blur-md"
            role="dialog"
            aria-label="Gallery filters"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-xs font-bold tracking-[0.22em] text-slate-400 uppercase">
                Filter gallery
              </p>

              <button
                type="button"
                className={`-mt-1 min-w-[3.5rem] text-right text-xs font-semibold tracking-[0.18em] text-primary uppercase transition-colors duration-200 hover:text-primary-700 ${
                  selectedFilters.length ? 'visible' : 'invisible pointer-events-none'
                }`}
                onClick={() => onSelectedFiltersChange([])}
              >
                Clear
              </button>
            </div>

            <div className="mt-4 flex max-h-72 flex-col gap-2 overflow-y-auto pr-1">
              {options.map((option) => {
                const isSelected = selectedFilters.includes(option.id)

                return (
                  <label
                    key={option.id}
                    className={`flex cursor-pointer items-center gap-3 rounded-[12px] border px-4 py-3 transition-all duration-200 ${
                      isSelected
                        ? 'border-primary bg-sky-50 text-primary'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-primary"
                      checked={isSelected}
                      onChange={() => toggleFilter(option.id)}
                    />
                    <span className="text-sm leading-5 font-medium">
                      {option.label}
                    </span>
                  </label>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
