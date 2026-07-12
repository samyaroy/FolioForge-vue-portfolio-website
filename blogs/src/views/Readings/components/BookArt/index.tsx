type BookArtProps = {
  /** Width utilities; the height follows from the fixed cover aspect ratio. */
  className?: string
}

// Pure-CSS book cover, used as the card illustration and as the modal
// fallback when a reading has no cover image.
export function BookArt({ className = '' }: BookArtProps) {
  return (
    <span
      className={`relative block aspect-[0.72] rounded-[6px_8px_8px_6px] [background:linear-gradient(135deg,#1980e6_0%,#1e3a8a_100%)] shadow-[-0.45rem_0.45rem_0_rgba(15,23,42,0.08),0_1rem_1.8rem_rgba(15,23,42,0.18)] before:absolute before:inset-[0.65rem_auto_0.65rem_0.55rem] before:w-[0.28rem] before:rounded-full before:bg-[rgba(255,255,255,0.72)] before:content-[''] after:absolute after:right-[0.65rem] after:bottom-3 after:left-[1.15rem] after:h-[0.28rem] after:rounded-full after:bg-[rgba(255,255,255,0.76)] after:shadow-[0_-0.65rem_0_rgba(255,255,255,0.54)] after:content-[''] ${className}`}
    />
  )
}
