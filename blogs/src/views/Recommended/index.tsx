import { RecommendedCard } from '../../components/RecommendedCard'
import { isPageDescriptionEnabled } from '../../config/featureFlags'
import { PAGE_DESCRIPTIONS } from '../../content/descriptions'
import { RECOMMENDED } from '../../content/recommended/data'
import { RECOMMENDED_SECTION } from '../../content/sections'
import {
  CARD_META_CLASS,
  EMPTY_TEXT_CLASS,
  INTRO_SECTION_CLASS,
  INTRO_TEXT_CLASS,
  INTRO_TITLE_CLASS,
} from '../../lib/ui'
import { usePageTitle } from '../../lib/usePageTitle'

export function RecommendedPage() {
  usePageTitle(RECOMMENDED_SECTION.title)
  const showPageDescription = isPageDescriptionEnabled('recommended')

  return (
    <>
      <section className={INTRO_SECTION_CLASS}>
        <p className={`${CARD_META_CLASS} mt-0! justify-center`}>
          {RECOMMENDED_SECTION.kicker}
        </p>
        <h1 className={`mt-3 ${INTRO_TITLE_CLASS}`}>
          {RECOMMENDED_SECTION.title}
        </h1>
        {showPageDescription && (
          <p className={INTRO_TEXT_CLASS}>{PAGE_DESCRIPTIONS.recommended}</p>
        )}
      </section>

      {RECOMMENDED.length === 0 ? (
        <p className={EMPTY_TEXT_CLASS}>{RECOMMENDED_SECTION.emptyLabel}</p>
      ) : (
        <>
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-2">
            {RECOMMENDED.map((item) => (
              <RecommendedCard key={item.id} item={item} />
            ))}
          </div>

          <p
            className={`${CARD_META_CLASS} mt-12! justify-center text-center`}
          >
            {RECOMMENDED_SECTION.disclaimer}
          </p>
        </>
      )}
    </>
  )
}
