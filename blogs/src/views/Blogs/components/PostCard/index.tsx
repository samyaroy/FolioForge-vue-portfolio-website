import { Link } from 'react-router-dom'
import type { PostMeta } from '../../../../types'
import { formatDate } from '../../../../lib/format'
import {
  CARD_ART_BACKDROP_CLASS,
  CARD_EXCERPT_CLASS,
  CARD_META_CLASS,
  CARD_SHELL_STATIC_CLASS,
  CARD_TITLE_CLASS,
} from '../../../../lib/ui'

type PostCardProps = {
  post: PostMeta
}

export function PostCard({ post }: PostCardProps) {
  return (
    <article
      className={`grid grid-cols-1 items-stretch rounded-xl ${CARD_SHELL_STATIC_CLASS} md:min-h-52 md:grid-cols-[40%_minmax(0,1fr)]`}
    >
      <div
        className={`relative grid min-h-40 place-items-center overflow-hidden border-b border-[rgba(15,23,42,0.07)] ${CARD_ART_BACKDROP_CLASS} md:min-h-0 md:border-r md:border-b-0`}
        aria-hidden="true"
      >
        {post.cover ? (
          <img
            className="absolute inset-0 size-full object-cover"
            src={post.cover}
            alt=""
            loading="lazy"
          />
        ) : (
          <span className="text-[2rem] text-primary opacity-55">✳</span>
        )}
      </div>
      <div className="flex min-w-0 flex-col px-[1.6rem] py-6">
        <h2 className={CARD_TITLE_CLASS}>
          <Link
            className="text-ink transition-colors duration-200 hover:text-primary"
            to={`/posts/${post.slug}`}
          >
            {post.title}
          </Link>
        </h2>
        {post.date && (
          <div className={`${CARD_META_CLASS} mt-1.5!`}>
            <time
              dateTime={post.date}
              className="inline-flex items-center gap-1 text-sm font-normal tracking-normal normal-case"
            >
              <span
                className="mdi mdi-calendar-blank-outline leading-none"
                aria-hidden="true"
              />
              {formatDate(post.date)}
            </time>
          </div>
        )}
        {post.description && (
          <p className={`${CARD_EXCERPT_CLASS} mt-2! leading-[1.55]!`}>
            {post.description}
          </p>
        )}
        {post.tags.length > 0 && (
          <ul className="mt-auto flex flex-wrap gap-[0.4rem] pt-3">
            {post.tags.map((tag) => (
              <li
                key={tag}
                className="rounded-[5px] bg-[rgba(219,234,254,0.5)] px-[0.4rem] py-1 text-[0.625rem] leading-none font-semibold tracking-widest text-[#475569] uppercase"
              >
                {tag}
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
  )
}
