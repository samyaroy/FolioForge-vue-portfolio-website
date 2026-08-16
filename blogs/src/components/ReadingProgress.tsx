import { useEffect, useRef } from 'react'

/**
 * Hairline bar across the top of the viewport tracking how far down the page
 * the reader is. The width is written straight to the DOM node instead of being
 * held in state: this updates on every frame of a scroll, and re-rendering the
 * post body that often would be wasted work. It sits above the sticky header
 * (z-50) but below the share menu's portal (z-60).
 */
export function ReadingProgress() {
  const barRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    let frame = 0

    function paint() {
      frame = 0
      const bar = barRef.current
      if (!bar) return

      const scrollable =
        document.documentElement.scrollHeight - window.innerHeight
      const progress =
        scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0

      // scaleX rather than width, so the browser can keep this off the layout
      // path while the page scrolls.
      bar.style.transform = `scaleX(${progress})`
    }

    function schedule() {
      if (frame) return
      frame = window.requestAnimationFrame(paint)
    }

    paint()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)

    return () => {
      if (frame) window.cancelAnimationFrame(frame)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
    }
  }, [])

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-[55] h-[3px] bg-[rgba(15,23,42,0.06)]"
      aria-hidden="true"
    >
      <div
        ref={barRef}
        className="h-full origin-left bg-primary"
        style={{ transform: 'scaleX(0)' }}
      />
    </div>
  )
}
