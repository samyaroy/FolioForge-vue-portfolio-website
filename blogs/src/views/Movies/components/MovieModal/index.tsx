import type { MovieItem } from '../../../../content/movies/data'
import { MOVIES_SECTION } from '../../../../content/sections'
import { reviewShareUrl } from '../../../../lib/share'
import { ReviewModal } from '../../../../components/ReviewModal'
import { PosterArt } from '../PosterArt'
import { DirectorName } from '../DirectorName'

type MovieModalProps = {
  movie: MovieItem
  onClose: () => void
}

export function MovieModal({ movie, onClose }: MovieModalProps) {
  return (
    <ReviewModal
      shareUrl={reviewShareUrl('movies', movie.id)}
      title={`${movie.title}${movie.year ? ` (${movie.year})` : ''}`}
      genre={movie.genre}
      byline={<>directed by <DirectorName name={movie.director} imdbUrl={movie.directorImdbUrl} /></>}
      image={movie.image}
      imageAlt={`Poster of ${movie.title}`}
      fallbackArt={<PosterArt className="w-16 md:w-24" />}
      date={movie.date}
      dateLabel={MOVIES_SECTION.watchedLabel}
      rating={movie.rating}
      review={movie.review ?? movie.note}
      reviewLabel={MOVIES_SECTION.noteLabel}
      emptyLabel={MOVIES_SECTION.reviewEmptyLabel}
      link={movie.link}
      linkLabel={MOVIES_SECTION.linkLabel}
      onClose={onClose}
    />
  )
}
