import { useEffect, useRef, useState } from 'react'
import { BLOGS_SECTION } from '../../../content/sections'

type PostTagFilterProps = {
  /** Tags to offer, already normalized (lowercase). */
  options: string[]
  selected: string[]
  onChange: (selected: string[]) => void
  /** 'right': the popover hangs from the button's right edge. 'left': the
      root isn't positioned, so the popover lines up with the left edge of the
      nearest positioned ancestor (the heading row), which keeps it on screen
      when the button sits partway across a narrow row. */
  align?: 'left' | 'right'
}

/**
 * Round filter button with a popover of tag checkboxes. A port of the
 * portfolio's Career Unlocks filter (src/views/Gallery/components/
 * GalleryFilter.vue) so both sites filter the same way: a badge counts the
 * picked tags, "Clear" empties them, and the popover closes on an outside
 * click or Escape.
 */
export function PostTagFilter({
  options,
  selected,
  onChange,
  align = 'right',
}: PostTagFilterProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const toggle = (tag: string) =>
    onChange(
      selected.includes(tag)
        ? selected.filter((t) => t !== tag)
        : [...selected, tag],
    )

  return (
    <div
      ref={rootRef}
      className={`flex flex-col ${align === 'left' ? 'items-start' : 'relative items-end'}`}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={BLOGS_SECTION.tagFilterOpen}
        onClick={() => setOpen((o) => !o)}
        className="relative inline-flex h-10 w-8 items-center justify-center rounded-full border border-white/60 bg-white/50 text-slate-600 shadow-lg backdrop-blur-md transition-all duration-200 hover:border-primary/60 hover:bg-white/70 hover:text-primary focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:outline-none"
      >
        <span
          className={`mdi ${selected.length > 0 ? 'mdi-filter-check-outline' : 'mdi-filter-variant'} text-base leading-none`}
          aria-hidden="true"
        />
        {selected.length > 0 && (
          <span className="absolute -top-1 -right-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-white">
            {selected.length}
          </span>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label={BLOGS_SECTION.tagFilterTitle}
          className={`absolute top-full z-40 mt-2 w-[min(19rem,calc(100vw-2rem))] rounded-[12px] border border-white/70 bg-white/85 p-4 shadow-xl backdrop-blur-md ${align === 'left' ? 'left-0' : 'right-0'}`}
        >
          <div className="flex items-start justify-between gap-2">
            <p className="text-xs font-bold tracking-[0.22em] text-slate-400 uppercase">
              {BLOGS_SECTION.tagFilterTitle}
            </p>
            <button
              type="button"
              onClick={() => onChange([])}
              className={`-mt-1 min-w-14 text-right text-xs font-semibold tracking-[0.18em] text-primary uppercase transition-colors duration-200 hover:text-primary-700 ${selected.length > 0 ? 'visible' : 'pointer-events-none invisible'}`}
            >
              {BLOGS_SECTION.tagFilterClear}
            </button>
          </div>

          <div className="mt-4 flex max-h-72 flex-col gap-2 overflow-y-auto pr-1">
            {options.map((tag) => {
              const checked = selected.includes(tag)
              return (
                <label
                  key={tag}
                  className={`flex cursor-pointer items-center gap-3 rounded-[12px] border px-4 py-3 transition-all duration-200 ${checked ? 'border-primary bg-sky-50 text-primary' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'}`}
                >
                  <input
                    type="checkbox"
                    className="size-4 accent-primary"
                    checked={checked}
                    onChange={() => toggle(tag)}
                  />
                  <span className="text-sm leading-5 font-medium capitalize">
                    {tag}
                  </span>
                </label>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
