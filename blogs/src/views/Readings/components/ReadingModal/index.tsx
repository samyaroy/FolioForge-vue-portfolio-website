import type { ReadingItem } from '../../../../content/readings/data'
import { READINGS_SECTION } from '../../../../content/sections'
import { reviewShareUrl } from '../../../../lib/share'
import { ReviewModal } from '../../../../components/ReviewModal'
import { BookArt } from '../BookArt'

type ReadingModalProps = {
  reading: ReadingItem
  onClose: () => void
}

export function ReadingModal({ reading, onClose }: ReadingModalProps) {
  return (
    <ReviewModal
      shareUrl={reviewShareUrl('readings', reading.id)}
      title={reading.title}
      genre={reading.genre}
      byline={`by ${reading.author}`}
      image={reading.image}
      imageAlt={`Cover of ${reading.title}`}
      fallbackArt={<BookArt className="w-16 md:w-24" />}
      date={reading.date}
      rating={reading.rating}
      review={reading.review ?? reading.note}
      reviewLabel={READINGS_SECTION.noteLabel}
      emptyLabel={READINGS_SECTION.reviewEmptyLabel}
      link={reading.link}
      linkLabel={READINGS_SECTION.linkLabel}
      onClose={onClose}
    />
  )
}
