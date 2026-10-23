import { useEffect, useState, type RefObject } from 'react'

/**
 * The `top` for a `position: sticky` column so it stays fully reachable.
 * A column that fits the viewport pins at `topPx` as usual. A taller one
 * gets a negative offset instead: it scrolls with the page until its bottom
 * edge is `bottomGapPx` above the viewport's, then pins there, so its last
 * part is never stuck below the fold.
 */
export function useStickyTop(
  ref: RefObject<HTMLElement | null>,
  topPx: number,
  bottomGapPx = 16,
): number {
  const [top, setTop] = useState(topPx)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const update = () =>
      setTop(Math.min(topPx, window.innerHeight - el.offsetHeight - bottomGapPx))

    update()
    const observer = new ResizeObserver(update)
    observer.observe(el)
    window.addEventListener('resize', update)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', update)
    }
  }, [ref, topPx, bottomGapPx])

  return top
}
