import { useEffect, useState } from 'react'

// How long the note stays open after the page loads before it folds into its
// icon. Hovering or tapping the icon opens it again.
const OPEN_ON_LOAD_MS = 5000

export function GalleryLoadNotice() {
  const [isOpen, setIsOpen] = useState(true)

  useEffect(() => {
    const timer = window.setTimeout(() => setIsOpen(false), OPEN_ON_LOAD_MS)

    return () => window.clearTimeout(timer)
  }, [])

  return (
    // Below lg the note drops under the icon, placed against the hero's heading
    // row; from lg it opens to the icon's left. Either way it floats, so
    // folding it away never shifts the page.
    <div
      className="flex shrink-0 items-center lg:relative"
      onPointerEnter={(event) => {
        if (event.pointerType === 'mouse') setIsOpen(true)
      }}
      onPointerLeave={(event) => {
        if (event.pointerType === 'mouse') setIsOpen(false)
      }}
    >
      <button
        type="button"
        className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-amber-200 bg-amber-50 p-0 text-amber-700 transition-colors hover:bg-amber-100 focus:ring-2 focus:ring-amber-400 focus:outline-none"
        aria-label="Why photos may load slowly"
        aria-expanded={isOpen}
        aria-controls="gallery-load-notice"
        onClick={() => setIsOpen((open) => !open)}
      >
        <span
          className="mdi mdi-information-outline text-base leading-none"
          aria-hidden="true"
        />
      </button>
      <p
        id="gallery-load-notice"
        className={`absolute top-full right-0 z-40 mt-2 w-max max-w-full origin-top-right rounded-[6px] border border-amber-200 bg-amber-50 px-2 py-1 text-[11px] leading-4 font-normal tracking-normal text-amber-800 shadow-sm transition duration-300 motion-reduce:transition-none md:text-xs lg:top-1/2 lg:right-full lg:mt-0 lg:mr-2 lg:max-w-md lg:origin-right lg:-translate-y-1/2 xl:max-w-xl ${
          isOpen ? 'scale-100 opacity-100' : 'pointer-events-none scale-90 opacity-0'
        }`}
      >
        These photos are uploaded in very high resolution, so they may take a moment
        to load.
      </p>
    </div>
  )
}
