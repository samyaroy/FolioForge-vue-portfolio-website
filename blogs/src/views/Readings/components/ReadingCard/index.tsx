import type { ReadingItem } from '../../../../content/readings/data'
import { READINGS_SECTION } from '../../../../content/sections'
import { formatDate } from '../../../../lib/format'

type ReadingCardProps = {
  reading: ReadingItem
  illustrationSide?: 'left' | 'right'
}

export function ReadingCard({
  reading,
  illustrationSide = 'left',
}: ReadingCardProps) {
  const classes = [
    'reading-card',
    illustrationSide === 'right' ? 'reading-card--art-right' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <article className={classes}>
      <div className="reading-card__book-art" aria-hidden="true">
        <span className="reading-card__book-cover" />
      </div>

      <div className="reading-card__content">
        <div className="reading-card__title-row">
          <h2 className="post-card__title">{reading.title}</h2>
          {reading.date && (
            <time className="reading-card__date" dateTime={reading.date}>
              {formatDate(reading.date)}
            </time>
          )}
        </div>
        <div className="reading-card__meta">
          <span>{reading.genre}</span>
          <span className="reading-card__meta-separator" aria-hidden="true">
            •
          </span>
          <span>{reading.author}</span>
        </div>
        {reading.description && (
          <p className="post-card__excerpt">{reading.description}</p>
        )}
        <span className="reading-card__review">{READINGS_SECTION.reviewLabel}</span>
      </div>
    </article>
  )
}
