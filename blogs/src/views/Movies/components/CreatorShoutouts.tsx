import { SectionDivider } from '../../../components/SectionDivider'
import { MOVIE_CREATORS, MOVIE_CREATORS_SECTION } from '../../../content/movies/creators'
import {
  CARD_META_CLASS,
  CARD_SHELL_CLASS,
} from '../../../lib/ui'

function creatorLinkIcon(url: string): string {
  try {
    const host = new URL(url.trim()).hostname.toLowerCase()
    if (host === 'instagram.com' || host.endsWith('.instagram.com')) {
      return 'mdi-instagram text-[#e1306c]'
    }
    if (host === 'youtu.be' || host === 'youtube.com' || host.endsWith('.youtube.com')) {
      return 'mdi-youtube text-[#ff0000]'
    }
  } catch {
    // Incomplete or unrecognised links keep the generic external-link icon.
  }
  return 'mdi-open-in-new'
}

export function CreatorShoutouts() {
  return (
    <>
      <SectionDivider className="mt-16 mb-12" />
      <section aria-labelledby="movie-creators-title">
        <h2 id="movie-creators-title" className="text-center text-base leading-[1.75] font-normal text-muted">
          {MOVIE_CREATORS_SECTION.title}
        </h2>
        {MOVIE_CREATORS.length > 0 && (
          <div className="mx-auto mt-5 grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2">
            {MOVIE_CREATORS.map((creator) => (
              <article key={creator.id} className={`flex min-w-0 flex-col rounded-lg px-4 py-3 ${CARD_SHELL_CLASS}`}>
                {creator.platform && (
                  <p className={`${CARD_META_CLASS} mt-0! mb-2 text-primary`}>{creator.platform}</p>
                )}
                <h3 className="flex items-center gap-2 text-sm leading-snug font-semibold text-ink">
                  <span>{creator.name}</span>
                  {creator.url?.trim() && (
                    <a
                      href={creator.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Visit ${creator.name}'s profile`}
                      className="inline-flex shrink-0 items-center justify-center rounded p-1 transition-opacity hover:opacity-75 focus-visible:outline-2 focus-visible:outline-primary"
                    >
                      <span className={`mdi text-base leading-none ${creatorLinkIcon(creator.url)}`} aria-hidden="true" />
                    </a>
                  )}
                </h3>
                {creator.note && (
                  <p className="mt-2 whitespace-pre-line text-xs leading-relaxed wrap-break-word text-muted">{creator.note}</p>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </>
  )
}
