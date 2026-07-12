import type { TripPhotoCredit } from '../../../../content/travel/trips'

const GALLERY_MIN_TILES = 7
const GALLERY_SECONDS_PER_TILE = 40

type TripImageBeltProps = {
  gallery?: string[]
  clickedBy?: TripPhotoCredit[]
}

export function TripImageBelt({
  gallery = [],
  clickedBy = [],
}: TripImageBeltProps) {
  const images = gallery.filter(Boolean)
  const tiles = images.length
    ? Array.from(
        { length: Math.max(GALLERY_MIN_TILES, images.length) },
        (_, index) => images[index % images.length],
      )
    : []

  if (!tiles.length) return null

  return (
    <section className="mt-6 overflow-hidden" aria-label="Trip gallery">
      <div
        className="flex w-max gap-4 animate-[gallery-marquee_linear_infinite] hover:[animation-play-state:paused] motion-reduce:animate-none"
        style={{
          animationDuration: `${tiles.length * GALLERY_SECONDS_PER_TILE}s`,
        }}
      >
        {[...tiles, ...tiles].map((src, index) => (
          <div
            key={`${src}-${index}`}
            aria-hidden={index >= tiles.length || undefined}
            className="group relative aspect-square w-40 shrink-0 overflow-hidden rounded-lg border border-border bg-surface-soft sm:w-52"
          >
            <img
              src={src}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        ))}
      </div>

      {clickedBy.length > 0 && (
        <p className="mt-[0.6rem] text-right text-[0.7rem] tracking-[0.04em] text-faint">
          ✶ clicked by{' '}
          {clickedBy.map((credit, index) => (
            <span key={`${credit.name}-${credit.url ?? index}`}>
              {index > 0 && (index === clickedBy.length - 1 ? ' and ' : ', ')}
              {credit.url ? (
                <a
                  className="transition-colors duration-200 hover:text-ink"
                  href={credit.url}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  {credit.name}
                </a>
              ) : (
                credit.name
              )}
            </span>
          ))}
        </p>
      )}
    </section>
  )
}
