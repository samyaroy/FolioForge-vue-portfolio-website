import { Link } from 'react-router-dom'
import {
  GALLERY_SECTION,
  HOBBIES_SECTION,
  MOVIES_SECTION,
  PRIVACY_SECTION,
  READINGS_SECTION,
  RECOMMENDED_SECTION,
  SITEMAP_SECTION,
  TRAVEL_SECTION,
} from '../../content/sections'
import { PAGE_DESCRIPTIONS } from '../../content/descriptions'
import { FOOTER_CONTENT } from '../../content/site'
import { MOVIES } from '../../content/movies/data'
import { READINGS } from '../../content/readings/data'
import { TRIPS } from '../../content/travel/trips'
import { isFeatureEnabled, isPageDescriptionEnabled } from '../../config/featureFlags'
import { posts } from '../../lib/posts'
import { formatDate } from '../../lib/format'
import {
  INTRO_SECTION_CLASS,
  INTRO_TEXT_CLASS,
  INTRO_TITLE_CLASS,
} from '../../lib/ui'
import { usePageTitle } from '../../lib/usePageTitle'

type SitemapEntry = {
  label: string
  path: string
  date?: string
  /** A static file (feed, XML sitemap) rather than an app route, so it is
      fetched by the browser instead of the router. */
  file?: boolean
}

type SitemapGroup = {
  title: string
  icon: string
  entries: SitemapEntry[]
}

// The same flags gate these as gate the routes in App.tsx, so every link here
// resolves; vite.config.ts lists the same set in sitemap.xml.
const PAGE_ENTRIES: SitemapEntry[] = [
  { flag: 'showBlogHome', label: SITEMAP_SECTION.homeLabel, path: '/' },
  { flag: 'showRecommended', label: RECOMMENDED_SECTION.title, path: '/recommended' },
  { flag: 'showReadings', label: READINGS_SECTION.title, path: '/readings' },
  { flag: 'showMovies', label: MOVIES_SECTION.title, path: '/movies' },
  { flag: 'showTravel', label: TRAVEL_SECTION.title, path: '/travel' },
  { flag: 'showHobbies', label: HOBBIES_SECTION.title, path: '/hobbies' },
  { flag: 'showGallery', label: GALLERY_SECTION.title, path: '/gallery' },
]
  .filter(({ flag }) => isFeatureEnabled(flag))
  .map(({ label, path }) => ({ label, path }))

const reviewPath = (section: 'movies' | 'readings', id: string) =>
  `/${section}/${encodeURIComponent(id)}`

const SITEMAP_GROUPS: SitemapGroup[] = [
  {
    title: SITEMAP_SECTION.pagesTitle,
    icon: 'mdi-file-document-multiple-outline',
    entries: [
      ...PAGE_ENTRIES,
      { label: PRIVACY_SECTION.title, path: FOOTER_CONTENT.privacyPath },
    ],
  },
  {
    title: SITEMAP_SECTION.postsTitle,
    icon: 'mdi-fountain-pen-tip',
    entries: posts.map((post) => ({
      label: post.title,
      path: `/posts/${post.slug}`,
      date: post.date,
    })),
  },
  {
    title: SITEMAP_SECTION.tripsTitle,
    icon: 'mdi-compass-outline',
    entries: isFeatureEnabled('showTravel')
      ? TRIPS.map((trip) => ({
          label: trip.title,
          path: `/travel/${trip.id}`,
          date: trip.date,
        }))
      : [],
  },
  {
    title: SITEMAP_SECTION.movieReviewsTitle,
    icon: 'mdi-popcorn',
    entries: isFeatureEnabled('showMovies')
      ? MOVIES.map((movie) => ({
          label: movie.title,
          path: reviewPath('movies', movie.id),
          date: movie.date,
        }))
      : [],
  },
  {
    title: SITEMAP_SECTION.readingReviewsTitle,
    icon: 'mdi-book-open-page-variant-outline',
    entries: isFeatureEnabled('showReadings')
      ? READINGS.map((reading) => ({
          label: reading.title,
          path: reviewPath('readings', reading.id),
          date: reading.date,
        }))
      : [],
  },
  {
    title: SITEMAP_SECTION.feedsTitle,
    icon: 'mdi-rss',
    entries: [
      { label: SITEMAP_SECTION.rssLabel, path: '/rss.xml', file: true },
      { label: SITEMAP_SECTION.xmlSitemapLabel, path: '/sitemap.xml', file: true },
    ],
  },
].filter((group) => group.entries.length > 0)

const ENTRY_LINK_CLASS =
  'text-sm leading-snug font-medium text-ink transition-colors duration-200 hover:text-primary'

export function SitemapPage() {
  usePageTitle(SITEMAP_SECTION.title)

  return (
    <article className="mx-auto w-full max-w-6xl pb-8">
      <section className={INTRO_SECTION_CLASS}>
        <h1 className={INTRO_TITLE_CLASS}>
          <span className="mdi mdi-sitemap-outline mr-2.5 align-[-0.04em] leading-none" aria-hidden="true" />
          {SITEMAP_SECTION.title}
        </h1>
        {isPageDescriptionEnabled('sitemap') && (
          <p className={INTRO_TEXT_CLASS}>{PAGE_DESCRIPTIONS.sitemap}</p>
        )}
      </section>

      {/* Columns rather than a grid: the groups run from two links to a dozen,
          and a grid row would stretch every short group to the tallest one. */}
      <div className="gap-10 md:columns-2 lg:columns-3">
        {SITEMAP_GROUPS.map((group) => (
          <section
            key={group.title}
            className="mb-8 break-inside-avoid border-t border-border pt-4"
          >
            <h2 className="flex items-baseline gap-2 text-lg leading-7 font-bold text-ink">
              <span className={`mdi ${group.icon} leading-none text-muted`} aria-hidden="true" />
              {group.title}
              <span className="text-sm font-medium text-faint">
                {group.entries.length}
              </span>
            </h2>
            <ul className="mt-3 list-disc space-y-3 pl-4 marker:text-muted">
              {group.entries.map((entry) => (
                <li key={entry.path}>
                  {entry.file ? (
                    <a className={ENTRY_LINK_CLASS} href={entry.path}>
                      {entry.label}
                    </a>
                  ) : (
                    <Link className={ENTRY_LINK_CLASS} to={entry.path}>
                      {entry.label}
                    </Link>
                  )}
                  <p className="mt-0.5 text-xs leading-4 text-faint">
                    <span className="font-mono break-all">{entry.path}</span>
                    {entry.date && <> · {formatDate(entry.date)}</>}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </article>
  )
}
