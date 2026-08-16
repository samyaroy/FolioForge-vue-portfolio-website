// Utility-class strings shared by more than one view, so repeated page
// primitives (intro block, card lists, card text) can't drift apart.
// Matches the root site's page header block (text-center mb-12; only the
// description is width-capped, via INTRO_TEXT_CLASS).
export const INTRO_SECTION_CLASS = 'mb-12 text-center'

export const INTRO_TITLE_CLASS =
  'mb-4 text-4xl leading-[1.1] font-black tracking-[-0.033em] text-ink'

export const INTRO_TEXT_CLASS =
  'mx-auto max-w-4xl text-justify text-lg leading-[1.75] text-[#4b5563] [text-align-last:center]'

export const EMPTY_TEXT_CLASS = 'text-center text-muted'

export const POST_LIST_CLASS = 'mx-auto grid max-w-6xl grid-cols-1 gap-6'

// The blog section's two-column shell — the "All posts" rail on the left, the
// page's own content on the right — shared by the post list and each post so
// the rail lands in the same place throughout. Breaks out of the layout's
// column to 90% of the viewport, like the travel pages do.
export const RAIL_GRID_CLASS =
  'ml-[50%] grid w-[90vw] -translate-x-1/2 grid-cols-1 gap-10 md:grid-cols-[18%_minmax(0,1fr)] md:items-stretch md:gap-0'

export const RAIL_CONTENT_CLASS = 'min-w-0 md:border-l md:border-border md:pl-6'

export const CARD_TITLE_CLASS =
  'text-xl leading-[1.35] font-bold tracking-[-0.02em]'

export const CARD_EXCERPT_CLASS =
  'mt-4 text-justify text-sm leading-[1.75] text-muted'

// Card shell without the hover lift (home page post cards), plus the
// pale gradient backdrop behind card artwork.
export const CARD_SHELL_STATIC_CLASS =
  'overflow-hidden border border-[rgba(15,23,42,0.05)] bg-surface shadow-[0_12px_32px_-4px_rgba(14,20,27,0.08)]'

// Shared by ReadingCard and TripCard: the static shell with hover lift.
export const CARD_SHELL_CLASS = `${CARD_SHELL_STATIC_CLASS} transition-[transform,box-shadow,border-color] duration-300 ease-[ease] hover:-translate-y-1 hover:border-[rgba(25,128,230,0.2)] hover:shadow-[0_18px_42px_-10px_rgba(14,20,27,0.14)]`

export const CARD_ART_BACKDROP_CLASS =
  'bg-surface-soft bg-[image:linear-gradient(135deg,rgba(219,234,254,0.92),rgba(240,253,250,0.94))]'

export const CARD_META_CLASS =
  'mt-3 flex flex-wrap items-center gap-2 text-xs leading-normal font-bold tracking-[0.16em] text-faint uppercase'
