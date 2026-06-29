import { READINGS_SECTION } from '../../content/sections'
import { READINGS } from '../../content/readings/data'
import { isPageDescriptionEnabled } from '../../config/featureFlags'
import { ReadingCard } from './components/ReadingCard'

export function ReadingsPage() {
  const showPageDescription = isPageDescriptionEnabled('readings')

  return (
    <>
      <section className="intro">
        <h1>{READINGS_SECTION.title}</h1>
        {showPageDescription && <p>{READINGS_SECTION.description}</p>}
      </section>

      {READINGS.length === 0 ? (
        <p className="empty">{READINGS_SECTION.emptyLabel}</p>
      ) : (
        <div className="reading-list">
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
