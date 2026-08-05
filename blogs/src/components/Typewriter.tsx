import { useEffect, useState } from 'react'

const TYPE_INTERVAL_MS = 55

type TypewriterProps = {
  text: string
}

/**
 * Types `text` out character by character with a blinking caret. The full
 * text is rendered invisibly underneath so the layout never shifts while
 * typing, and once for screen readers so they aren't fed one letter at a
 * time. Honours prefers-reduced-motion by showing the text immediately.
 */
export function Typewriter({ text }: TypewriterProps) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setCount(text.length)
      return
    }
    setCount(0)
    let typed = 0
    const timer = window.setInterval(() => {
      typed += 1
      setCount(typed)
      if (typed >= text.length) window.clearInterval(timer)
    }, TYPE_INTERVAL_MS)
    return () => window.clearInterval(timer)
  }, [text])

  return (
    <>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true" className="relative inline-block">
        {/* Invisible full text reserves the final size. */}
        <span className="invisible">{text}</span>
        <span className="absolute inset-0">
          {text.slice(0, count)}
          {/* Zero-width anchor: the visible bar hangs off it absolutely, so
              the caret takes no space in the line and can never wrap. */}
          <span className="relative inline-block h-[0.9em] w-0">
            <span className="absolute inset-y-0 left-0.75 w-0.5 animate-[caret-blink_1s_step-end_infinite] bg-current" />
          </span>
        </span>
      </span>
    </>
  )
}
