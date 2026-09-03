import type { RecommendedItem } from '../../content/recommended/data'
import { RECOMMENDED_SECTION } from '../../content/sections'
import { CARD_META_CLASS, CARD_SHELL_CLASS, CARD_TITLE_CLASS } from '../../lib/ui'

type RecommendedCardProps = {
  item: RecommendedItem
  /** Home-page teaser variant: tighter, no note, short link label. */
  compact?: boolean
}

/**
 * A post someone else wrote. Deliberately shaped unlike PostCard — no cover
 * panel, the source domain where a post card puts its date, the author always
 * on the byline, and an outbound link that names where it goes — so a reader
 * can never mistake one of these for writing on this site.
 */
export function RecommendedCard({ item, compact = false }: RecommendedCardProps) {
  return (
    <article
      className={`flex flex-col rounded-lg ${CARD_SHELL_CLASS} ${
        compact ? 'px-6 py-[1.375rem]' : 'px-[1.6rem] py-6'
      }`}
    >
      <div className={`${CARD_META_CLASS} mt-0!`}>
        <span className="text-primary">{item.source}</span>
        {item.year !== undefined && (
          <>
            <span className="tracking-normal text-primary" aria-hidden="true">
              •
            </span>
            <span>{item.year}</span>
          </>
        )}
      </div>

      <h3
        className={`mt-3 text-pretty text-ink ${
          compact
            ? 'text-[1.0625rem] leading-[1.35] font-bold tracking-[-0.02em]'
            : CARD_TITLE_CLASS
        }`}
      >
        {item.title}
      </h3>

      <p className="mt-1.5 text-sm leading-normal text-muted">{item.author}</p>

      {!compact && item.note && (
        <p className="mt-4 text-sm leading-[1.75] text-muted">
          <span className="font-semibold text-primary" aria-hidden="true">
            ✳
          </span>{' '}
          {item.note}
        </p>
      )}

      <a
        className="mt-auto inline-flex items-center gap-1.5 self-start pt-4 text-sm leading-[1.3] text-primary transition-colors duration-200 hover:text-primary-hover"
        href={item.url}
        target="_blank"
        rel="noreferrer noopener"
      >
        {compact
          ? RECOMMENDED_SECTION.readShortLabel
          : `${RECOMMENDED_SECTION.readLabel} ${item.source}`}
        <span
          className="mdi mdi-open-in-new text-sm leading-none"
          aria-hidden="true"
        />
      </a>
    </article>
  )
}
