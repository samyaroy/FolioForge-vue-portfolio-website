type SectionDividerProps = {
  /** Spacing utilities for the rule, e.g. "mb-10" or "mt-14 mb-12". */
  className?: string
}

/**
 * The hairline-and-✳ section break used between blocks on the blog home
 * page. Breaks out of the layout's column to 90% of the viewport so it reads
 * as a page-level divider rather than a card separator.
 */
export function SectionDivider({ className = '' }: SectionDividerProps) {
  return (
    <div
      className={`relative ml-[50%] h-px w-[90vw] -translate-x-1/2 bg-border ${className}`}
      aria-hidden="true"
    >
      <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-page px-[0.85rem] text-2xl leading-none text-muted">
        ✳
      </span>
    </div>
  )
}
