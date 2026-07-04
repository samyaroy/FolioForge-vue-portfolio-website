// Utility-class strings shared by more than one view, so repeated page
// primitives (intro block, card lists, card text) can't drift apart.
export const INTRO_SECTION_CLASS = 'mx-auto mb-12 max-w-4xl text-center'

export const INTRO_TITLE_CLASS =
  'mb-4 text-4xl leading-[1.1] font-black tracking-[-0.033em] text-ink'

export const INTRO_TEXT_CLASS =
  'mx-auto max-w-4xl text-justify text-lg leading-[1.75] text-[#4b5563] [text-align-last:center]'

export const EMPTY_TEXT_CLASS = 'text-center text-muted'

export const POST_LIST_CLASS = 'mx-auto grid max-w-6xl grid-cols-1 gap-6'

export const CARD_TITLE_CLASS =
  'text-xl leading-[1.35] font-bold tracking-[-0.02em]'

export const CARD_EXCERPT_CLASS =
  'mt-4 text-justify text-[0.95rem] leading-[1.75] text-muted'

// Shared by PostCard and ReadingCard: card shell with hover lift, and the
// pale gradient backdrop behind card artwork.
export const CARD_SHELL_CLASS =
  'overflow-hidden border border-[rgba(15,23,42,0.05)] bg-surface shadow-[0_12px_32px_-4px_rgba(14,20,27,0.08)] transition-[transform,box-shadow,border-color] duration-300 ease-[ease] hover:-translate-y-1 hover:border-[rgba(25,128,230,0.2)] hover:shadow-[0_18px_42px_-10px_rgba(14,20,27,0.14)]'

export const CARD_ART_BACKDROP_CLASS =
  'bg-surface-soft bg-[image:linear-gradient(135deg,rgba(219,234,254,0.92),rgba(240,253,250,0.94))]'

export const CARD_META_CLASS =
  'mt-3 flex flex-wrap items-center gap-2 text-xs leading-normal font-bold tracking-[0.16em] text-faint uppercase'
