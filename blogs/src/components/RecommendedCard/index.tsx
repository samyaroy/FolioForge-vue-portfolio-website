import {
  categoryOf,
  publisherOf,
  yearOf,
  type RecommendedItem,
} from '../../content/recommended/data'
import { RECOMMENDED_SECTION } from '../../content/sections'
import { CARD_META_CLASS, CARD_SHELL_CLASS, CARD_TITLE_CLASS } from '../../lib/ui'

type RecommendedCardProps = {
  item: RecommendedItem
  /** Home-page carousel variant: tighter, clamped text, a short link label,
      and the category on top, since the carousel mixes every shelf. */
  compact?: boolean
}

// Every link on the card goes to the original, in a new tab.
const EXTERNAL_LINK = { target: '_blank', rel: 'noopener noreferrer' } as const

/**
 * A piece someone else wrote. Deliberately shaped unlike PostCard — no cover
 * panel, and the author always on the byline with the publication beside
 * them, marked as an outbound link — so a reader can never mistake one of
 * these for writing on this site. Nothing of the piece itself is reproduced
 * here: the title and the publication both link straight to the original.
 */
export function RecommendedCard({ item, compact = false }: RecommendedCardProps) {
  const category = categoryOf(item)
  const publisher = publisherOf(item)
  // A subtitle is the hook; the note is the fallback for entries without one.
  // `||`, not `??`: the admin saves an unused subtitle as an empty string.
  const blurb = item.subtitle || item.note
  const facts = [
    yearOf(item),
    item.readingMinutes && `${item.readingMinutes} ${RECOMMENDED_SECTION.readingTime}`,
    !compact && item.level,
  ].filter(Boolean)

  return (
    // `relative` holds the links' absolutely positioned sr-only text inside
    // the card; without it, a card scrolled off in the home carousel would
    // leak that text past the track and widen the whole page.
    <article
      className={`relative flex h-full flex-col rounded-lg ${CARD_SHELL_CLASS} ${
        compact ? 'px-6 py-[1.375rem]' : 'px-[1.6rem] py-6'
      }`}
    >
      {compact && (
        <p className={`${CARD_META_CLASS} mt-0! mb-3 gap-1.5!`}>
          {category.icon && (
            <span
              className={`mdi ${category.icon} text-sm leading-none tracking-normal`}
              aria-hidden="true"
            />
          )}
          {category.label}
        </p>
      )}

      <h3
        className={`text-pretty text-ink ${
          compact
            ? 'text-[1.0625rem] leading-[1.35] font-bold tracking-[-0.02em]'
            : CARD_TITLE_CLASS
        }`}
      >
        <a
          {...EXTERNAL_LINK}
          href={item.url}
          className="text-ink transition-colors duration-200 [font-weight:inherit] hover:text-primary"
        >
          {item.title}
          <span className="sr-only">{RECOMMENDED_SECTION.newTabLabel}</span>
        </a>
      </h3>

      <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm leading-normal text-muted">
        <span className="inline-flex items-center gap-1">
          <span
            className="mdi mdi-account-outline text-base leading-none text-faint"
            aria-hidden="true"
          />
          {item.author}
        </span>
        <span className="text-primary" aria-hidden="true">
          •
        </span>
        <a
          {...EXTERNAL_LINK}
          href={item.url}
          className="inline-flex items-center gap-1 text-primary transition-colors duration-200 hover:text-primary-hover"
        >
          {publisher}
          <span className="mdi mdi-open-in-new text-[0.8125rem] leading-none" aria-hidden="true" />
          <span className="sr-only">{RECOMMENDED_SECTION.newTabLabel}</span>
        </a>
      </p>

      {blurb && (
        <p
          className={`mt-4 text-sm leading-[1.75] text-muted ${
            compact ? 'line-clamp-3' : ''
          }`}
        >
          {!item.subtitle && (
            <>
              <span className="font-semibold text-primary" aria-hidden="true">
                ✳
              </span>{' '}
            </>
          )}
          {blurb}
        </p>
      )}

      {compact ? (
        // One closing row — the facts, then the outbound link — to keep the
        // carousel's cards short.
        <div className="mt-auto flex items-center justify-between gap-4 pt-4">
          <span className="text-xs leading-normal text-faint">{facts.join(' · ')}</span>
          <a
            {...EXTERNAL_LINK}
            href={item.url}
            className="inline-flex shrink-0 items-center gap-1.5 text-sm leading-[1.3] text-primary transition-colors duration-200 hover:text-primary-hover"
          >
            {RECOMMENDED_SECTION.readShortLabel}
            <span className="mdi mdi-open-in-new text-sm leading-none" aria-hidden="true" />
            <span className="sr-only">{RECOMMENDED_SECTION.newTabLabel}</span>
          </a>
        </div>
      ) : (
        facts.length > 0 && (
          <p className="mt-auto pt-4 text-xs leading-normal text-faint">
            {facts.join(' · ')}
          </p>
        )
      )}
    </article>
  )
}
