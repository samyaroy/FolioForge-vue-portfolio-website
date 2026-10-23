import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { HOME_LATEST_LABELS as LABELS } from '../../../content/site'
import { formatDate } from '../../../lib/format'
import {
  CARD_ART_BACKDROP_CLASS,
  CARD_META_CLASS,
  CARD_SHELL_CLASS,
  CARD_TITLE_CLASS,
  POST_TAG_CLASS,
} from '../../../lib/ui'
import type { PostMeta } from '../../../types'
import type { LatestItem } from './latestItems'

// Border, shadow and hover lift for the reading and movie rows.
const TILE_LINK_CLASS =
  'group rounded-xl border border-border bg-surface shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-0.5 hover:border-[rgba(25,128,230,0.2)] hover:shadow-[0_12px_28px_-10px_rgba(14,20,27,0.14)]'

const KICKER_CLASS =
  'flex items-center gap-1 text-[0.625rem] leading-normal font-semibold tracking-[0.12em] text-faint uppercase'

// Square thumbnail; falls back to the section icon when there's no image or
// it fails to load.
function Thumb({ image, icon }: { image?: string; icon: string }) {
  const [failed, setFailed] = useState(false)

  return (
    <span
      className={`relative size-16 shrink-0 overflow-hidden rounded-lg ${CARD_ART_BACKDROP_CLASS}`}
    >
      {image && !failed ? (
        <img
          src={image}
          alt=""
          loading="lazy"
          onError={() => setFailed(true)}
          className="absolute inset-0 size-full object-cover"
        />
      ) : (
        <span
          className={`mdi ${icon} absolute inset-0 flex items-center justify-center text-2xl leading-none text-primary/60`}
          aria-hidden="true"
        />
      )}
    </span>
  )
}

// The newest post, featured at the top of the panel in the same shape as the
// post list's cards (artwork left, text right). The list below the hero then
// starts from the second post, so this one isn't shown twice.
function FeaturedPost({ post }: { post: PostMeta }) {
  const [coverFailed, setCoverFailed] = useState(false)

  return (
    <Link
      to={`/posts/${post.slug}`}
      viewTransition
      className={`group grid grid-cols-1 overflow-hidden rounded-xl ${CARD_SHELL_CLASS} sm:min-h-52 sm:grid-cols-[40%_minmax(0,1fr)]`}
    >
      <span
        className={`relative grid min-h-40 place-items-center overflow-hidden border-b border-[rgba(15,23,42,0.07)] ${CARD_ART_BACKDROP_CLASS} sm:min-h-0 sm:border-r sm:border-b-0`}
        aria-hidden="true"
      >
        {post.cover && !coverFailed ? (
          <img
            src={post.cover}
            alt=""
            loading="lazy"
            onError={() => setCoverFailed(true)}
            className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <span className="text-[2rem] text-primary opacity-55">✳</span>
        )}
      </span>

      <span className="flex min-w-0 flex-col px-5 py-4">
        <span className={KICKER_CLASS}>
          <span className="mdi mdi-fountain-pen-tip text-xs leading-none text-primary" aria-hidden="true" />
          {LABELS.post}
          {post.date && (
            <time dateTime={post.date} className="font-normal tracking-normal normal-case">
              · {formatDate(post.date)}
            </time>
          )}
        </span>
        <span className={`${CARD_TITLE_CLASS} mt-1.5 block text-ink group-hover:text-primary`}>
          {post.title}
        </span>
        {post.description && (
          <span className="mt-2 line-clamp-3 block text-sm leading-[1.55] font-normal text-muted">
            {post.description}
          </span>
        )}
        <span className="mt-auto flex flex-wrap items-center gap-[0.4rem] pt-3">
          {post.tags.map((tag) => (
            <span key={tag} className={POST_TAG_CLASS}>
              {tag}
            </span>
          ))}
          <span className="ml-auto inline-flex items-center gap-1 text-sm font-normal text-primary">
            {LABELS.readPost}
            <span
              className="mdi mdi-arrow-right leading-none transition-transform duration-200 group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </span>
        </span>
      </span>
    </Link>
  )
}

/**
 * Heading over the post list while the newest post is featured in the panel,
 * so a reader landing on the list knows it starts from the second post and
 * where the newest one went.
 */
export function OlderPostsHeading({
  featured,
  filter,
}: {
  featured: PostMeta
  /** The list's tag filter, shown beside the heading. */
  filter?: ReactNode
}) {
  const [before, after = ''] = LABELS.olderNote.split('{title}')

  return (
    <div className="relative z-30 mx-auto mb-5 flex w-[87%] flex-wrap items-center justify-between gap-x-4 gap-y-1">
      <div className="flex items-center gap-3">
        <h2 className={`${CARD_META_CLASS} mt-0!`}>{LABELS.olderTitle}</h2>
        {filter}
      </div>
      <p className="text-sm leading-normal text-muted">
        <span
          className="mdi mdi-arrow-up mr-1 leading-none text-primary"
          aria-hidden="true"
        />
        {before}
        <Link
          to={`/posts/${featured.slug}`}
          viewTransition
          className="font-semibold text-primary hover:text-primary-hover"
        >
          {featured.title}
        </Link>
        {after}
      </p>
    </div>
  )
}

type HomeLatestProps = {
  /** The newest post; omitted when there are no posts. */
  post?: PostMeta
  /** Rows for the newest reading and movie. */
  items: LatestItem[]
}

/**
 * "What's new" panel shown beside the blog home hero: the newest post as a
 * featured card, then a row each for the newest reading and movie, so the
 * first screen carries real content and not only the hero artwork.
 */
export function HomeLatest({ post, items }: HomeLatestProps) {
  return (
    <section aria-labelledby="home-latest-heading" className="min-w-0">
      <h2 id="home-latest-heading" className={`${CARD_META_CLASS} mt-0!`}>
        {LABELS.title}
      </h2>

      <div className="mt-3 flex flex-col gap-2.5">
        {post && <FeaturedPost post={post} />}

        {items.length > 0 && (
          <ul className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-1">
            {items.map((item) => (
              <li key={item.key}>
                <Link
                  to={item.to}
                  viewTransition
                  className={`${TILE_LINK_CLASS} flex items-center gap-3.5 p-2.5 pr-4`}
                >
                  <Thumb image={item.image} icon={item.icon} />
                  <span className="min-w-0 flex-1">
                    <span className={KICKER_CLASS}>
                      <span
                        className={`mdi ${item.icon} text-xs leading-none text-primary`}
                        aria-hidden="true"
                      />
                      {item.kicker}
                    </span>
                    <span className="mt-0.5 line-clamp-1 text-sm leading-snug font-semibold text-ink group-hover:text-primary">
                      {item.title}
                    </span>
                    {item.meta && (
                      <span className="mt-0.5 line-clamp-1 text-xs leading-normal font-normal text-muted">
                        {item.meta}
                      </span>
                    )}
                  </span>
                  <span
                    className="mdi mdi-arrow-right shrink-0 text-base leading-none text-faint transition-[color,transform] duration-200 group-hover:translate-x-0.5 group-hover:text-primary"
                    aria-hidden="true"
                  />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
