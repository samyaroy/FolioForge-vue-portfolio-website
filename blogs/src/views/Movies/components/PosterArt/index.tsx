type PosterArtProps = {
  /** Width utilities; the height follows from the fixed poster aspect ratio. */
  className?: string
}

// Pure-CSS clapperboard, used as the card illustration and as the modal
// fallback when a movie has no poster image (the counterpart of BookArt).
export function PosterArt({ className = '' }: PosterArtProps) {
  return (
    <span
      className={`relative block aspect-[0.68] overflow-hidden rounded-[6px] [background:linear-gradient(135deg,#1980e6_0%,#1e3a8a_100%)] shadow-[-0.45rem_0.45rem_0_rgba(15,23,42,0.08),0_1rem_1.8rem_rgba(15,23,42,0.18)] before:absolute before:inset-[0_0_auto_0] before:h-[22%] before:[background:repeating-linear-gradient(115deg,rgba(255,255,255,0.82)_0_0.5rem,rgba(15,23,42,0.82)_0.5rem_1rem)] before:content-[''] after:absolute after:top-[60%] after:left-1/2 after:h-0 after:w-0 after:-translate-x-1/2 after:-translate-y-1/2 after:[border-bottom:0.5rem_solid_transparent] after:[border-left:0.85rem_solid_rgba(255,255,255,0.82)] after:[border-top:0.5rem_solid_transparent] after:content-[''] ${className}`}
    />
  )
}
