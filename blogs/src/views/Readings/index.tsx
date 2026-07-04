import { READINGS_SECTION } from '../../content/sections'
import { READINGS } from '../../content/readings/data'
import { PAGE_DESCRIPTIONS } from '../../content/descriptions'
import { isPageDescriptionEnabled } from '../../config/featureFlags'
import {
  EMPTY_TEXT_CLASS,
  INTRO_SECTION_CLASS,
  INTRO_TEXT_CLASS,
  INTRO_TITLE_CLASS,
} from '../../lib/ui'
import { ReadingCard } from './components/ReadingCard'

export function ReadingsPage() {
  const showPageDescription = isPageDescriptionEnabled('readings')

  return (
    <>
      <section className={INTRO_SECTION_CLASS}>
        <h1 className={INTRO_TITLE_CLASS}>{READINGS_SECTION.title}</h1>
        {showPageDescription && (
          <p className={INTRO_TEXT_CLASS}>{PAGE_DESCRIPTIONS.readings}</p>
        )}
      </section>

      {READINGS.length === 0 ? (
        <p className={EMPTY_TEXT_CLASS}>{READINGS_SECTION.emptyLabel}</p>
      ) : (
        <div className="ml-[50%] grid w-full max-w-none -translate-x-1/2 grid-cols-1 gap-6 md:w-[min(calc(100vw-2rem),78rem)]">
          {READINGS.map((reading, index) => (
            <ReadingCard
              key={reading.id}
              reading={reading}
              illustrationSide={index % 2 === 0 ? 'left' : 'right'}
            />
          ))}
        </div>
      )}
    </>
  )
}
