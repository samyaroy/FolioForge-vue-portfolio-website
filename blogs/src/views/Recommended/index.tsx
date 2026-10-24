import { useSearchParams } from 'react-router-dom'
import { RecommendedCard } from '../../components/RecommendedCard'
import { isFeatureEnabled, isPageDescriptionEnabled } from '../../config/featureFlags'
import { PAGE_DESCRIPTIONS } from '../../content/descriptions'
import {
  RECOMMENDED,
  RECOMMENDED_SHELVES,
  type RecommendedShelf,
} from '../../content/recommended/data'
import { RECOMMENDED_SECTION } from '../../content/sections'
import {
  CARD_ART_BACKDROP_CLASS,
  CARD_META_CLASS,
  EMPTY_TEXT_CLASS,
  INTRO_SECTION_CLASS,
  INTRO_TEXT_CLASS,
  INTRO_TITLE_CLASS,
} from '../../lib/ui'
import { usePageTitle } from '../../lib/usePageTitle'

// The chosen shelf lives in the URL (?category=mind) so a filtered view can
// be linked to and survives a reload.
const CATEGORY_PARAM = 'category'

const CHIP_CLASS =
  'inline-flex cursor-pointer items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm leading-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:outline-none'

const CHIP_ON_CLASS = 'border-primary bg-primary text-white'
const CHIP_OFF_CLASS =
  'border-border bg-surface text-muted hover:border-primary hover:text-primary'

function countLabel(count: number): string {
  return count === 1
    ? RECOMMENDED_SECTION.countOne
    : RECOMMENDED_SECTION.countMany.replace('{count}', String(count))
}

function Chip({
  label,
  count,
  icon,
  active,
  onClick,
}: {
  label: string
  count: number
  icon?: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`${CHIP_CLASS} ${active ? CHIP_ON_CLASS : CHIP_OFF_CLASS}`}
    >
      {icon && <span className={`mdi ${icon} text-base leading-none`} aria-hidden="true" />}
      {label}
      <span className={`text-xs tabular-nums ${active ? 'text-white/75' : 'text-faint'}`}>
        {count}
      </span>
    </button>
  )
}

function Shelf({ shelf }: { shelf: RecommendedShelf }) {
  const { category, items } = shelf
  const headingId = `shelf-${category.id}`

  return (
    <section aria-labelledby={headingId}>
      <header className="flex items-center gap-4 border-b border-border pb-5">
        {category.icon && (
          <span
            className={`grid size-11 shrink-0 place-items-center rounded-lg ${CARD_ART_BACKDROP_CLASS}`}
            aria-hidden="true"
          >
            <span className={`mdi ${category.icon} text-[1.375rem] leading-none text-primary`} />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h2
              id={headingId}
              className="text-2xl leading-tight font-bold tracking-[-0.02em] text-ink"
            >
              {category.label}
            </h2>
            <p className={`${CARD_META_CLASS} mt-0!`}>{countLabel(items.length)}</p>
          </div>
          {category.blurb && isFeatureEnabled('showRecommendedCategoryBlurbs') && (
            <p className="mt-1.5 text-sm leading-normal text-muted">{category.blurb}</p>
          )}
        </div>
      </header>

      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <RecommendedCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  )
}

export function RecommendedPage() {
  usePageTitle(RECOMMENDED_SECTION.title)
  const showPageDescription = isPageDescriptionEnabled('recommended')
  const [searchParams, setSearchParams] = useSearchParams()

  // An unknown or stale ?category= falls back to showing every shelf.
  const selected = RECOMMENDED_SHELVES.find(
    (shelf) => shelf.category.id === searchParams.get(CATEGORY_PARAM),
  )
  const shelves = selected ? [selected] : RECOMMENDED_SHELVES

  const select = (id?: string) =>
    setSearchParams(id ? { [CATEGORY_PARAM]: id } : {}, {
      replace: true,
      preventScrollReset: true,
    })

  return (
    <>
      <section className={INTRO_SECTION_CLASS}>
        <h1 className={INTRO_TITLE_CLASS}>{RECOMMENDED_SECTION.title}</h1>
        {showPageDescription && (
          <p className={INTRO_TEXT_CLASS}>{PAGE_DESCRIPTIONS.recommended}</p>
        )}
      </section>

      {RECOMMENDED.length === 0 ? (
        <p className={EMPTY_TEXT_CLASS}>{RECOMMENDED_SECTION.emptyLabel}</p>
      ) : (
        <div className="mx-auto max-w-6xl">
          {RECOMMENDED_SHELVES.length > 1 && (
            <div
              role="group"
              aria-label={RECOMMENDED_SECTION.filterLabel}
              className="mb-12 flex flex-wrap justify-center gap-2"
            >
              <Chip
                label={RECOMMENDED_SECTION.allCategoriesLabel}
                count={RECOMMENDED.length}
                active={!selected}
                onClick={() => select()}
              />
              {RECOMMENDED_SHELVES.map((shelf) => (
                <Chip
                  key={shelf.category.id}
                  label={shelf.category.label}
                  count={shelf.items.length}
                  icon={shelf.category.icon}
                  active={selected === shelf}
                  onClick={() => select(shelf.category.id)}
                />
              ))}
            </div>
          )}

          <div className="flex flex-col gap-16">
            {shelves.map((shelf) => (
              <Shelf key={shelf.category.id} shelf={shelf} />
            ))}
          </div>

          <p className={`${CARD_META_CLASS} mt-14! justify-center text-center`}>
            {RECOMMENDED_SECTION.disclaimer}
          </p>
        </div>
      )}
    </>
  )
}
