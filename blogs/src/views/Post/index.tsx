import { Link, useParams } from 'react-router-dom'
import { getAdjacentPosts, getPost } from '../../lib/posts'
import { formatDate } from '../../lib/format'
import { readingTimeMinutes } from '../../lib/readingTime'
import { usePageTitle } from '../../lib/usePageTitle'
import { isFeatureEnabled } from '../../config/featureFlags'
import { POST_COPY } from '../../content/sections'
import { RAIL_CONTENT_CLASS, RAIL_GRID_CLASS } from '../../lib/ui'
import { AllPostsIndex } from '../../components/AllPostsIndex'
import { ReadingProgress } from '../../components/ReadingProgress'
import { ShareMenu } from '../../components/ShareMenu'
import { postShareUrl } from '../../lib/share'
import { NotFoundPage } from '../NotFound'
import { PostBody } from './components/PostBody'

const EYEBROW_CLASS = 'text-xs leading-normal font-bold tracking-[0.16em] uppercase'

// The byline rule under the title, and the footer rule under the body.
const RULE_TEXT_CLASS = 'text-sm leading-normal text-faint'

// The BlogPosting structured data for this page is stamped into the head at
// build time (vite.config.ts), where crawlers see it without running the app.
// Emitting it here as well would put two conflicting copies on the page.
export function PostPage() {
  const { slug } = useParams<{ slug: string }>()
  const post = slug ? getPost(slug) : undefined

  // undefined while the post is missing: the NotFoundPage owns the title then.
  usePageTitle(post?.title)

  if (!post) {
    return <NotFoundPage />
  }

  // One post reads on to the next one down the archive; the oldest post has
  // nothing below it, so it points back up instead.
  const { newer, older } = getAdjacentPosts(post.slug)
  const onwards = older ?? newer
  const onwardsLabel = older ? POST_COPY.nextLabel : POST_COPY.previousLabel

  const kicker = post.tags.length > 0 ? post.tags.join(' · ') : POST_COPY.kicker

  return (
    <>
      {isFeatureEnabled('showReadingProgress') && <ReadingProgress />}

      <div className={RAIL_GRID_CLASS}>
        {/* Below md the rail drops under the article: on a phone the post is
            what the reader came for, and the index reads as an archive to move
            on to once it ends. */}
        <AllPostsIndex activeSlug={post.slug} className="order-last md:order-0" />

        <div className={RAIL_CONTENT_CLASS}>
          {/* Fills the pane rather than sitting in a narrow column inside it.
              The cap only bites past ~1600px, where the pane would otherwise
              push a line of body text beyond ~110 characters; the type scales
              up with the measure so the longer lines stay readable. */}
          <article className="mx-auto w-full max-w-6xl pb-8">
            <header className="mb-12">
              <p
                className={`mb-6 flex items-center gap-2.5 text-primary ${EYEBROW_CLASS}`}
              >
                <span className="h-px w-5 shrink-0 bg-current" aria-hidden="true" />
                <span>{kicker}</span>
              </p>

              <h1 className="mb-5 text-4xl leading-[1.08] font-black tracking-[-0.033em] text-balance text-ink sm:text-5xl lg:text-6xl">
                {post.title}
              </h1>

              {/* The lede keeps its own measure: it is display type, and a
                  three-word-deep line across the full pane reads as a caption
                  rather than a standfirst. */}
              {post.description && (
                <p className="mb-8 max-w-4xl text-lg leading-[1.55] text-pretty text-[#4b5563] lg:text-xl">
                  {post.description}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-x-3 gap-y-3 border-y border-border py-3">
                {post.date && (
                  <time
                    className={`inline-flex items-center gap-1.5 ${RULE_TEXT_CLASS}`}
                    dateTime={post.date}
                  >
                    <span
                      className="mdi mdi-calendar-blank-outline leading-none"
                      aria-hidden="true"
                    />
                    {formatDate(post.date)}
                  </time>
                )}

                {isFeatureEnabled('showReadingTime') && (
                  <>
                    {post.date && (
                      <span className="text-[#cbd5e1]" aria-hidden="true">
                        /
                      </span>
                    )}
                    <span
                      className={`inline-flex items-center gap-1.5 ${RULE_TEXT_CLASS}`}
                    >
                      <span
                        className="mdi mdi-clock-outline leading-none"
                        aria-hidden="true"
                      />
                      {readingTimeMinutes(post.body)} {POST_COPY.readingTime}
                    </span>
                  </>
                )}

                {/* The preview a shared link produces comes from the <head>
                    stamped at build time (vite.config.ts), not from anything
                    rendered here. */}
                <ShareMenu
                  content={{
                    url: postShareUrl(post.slug),
                    title: post.title,
                    text: post.description,
                    hashtags: post.tags,
                  }}
                  triggerClass={`ml-auto inline-flex cursor-pointer items-center gap-2 rounded-[6px] border border-border bg-surface px-2.5 py-1.5 text-muted transition-colors hover:border-primary hover:text-primary focus:ring-2 focus:ring-primary focus:outline-none ${EYEBROW_CLASS}`}
                  triggerLabel={`Share: ${post.title}`}
                  triggerText={POST_COPY.share}
                  triggerIconClass="text-sm"
                  heading="Share this post"
                />
              </div>
            </header>

            <PostBody markdown={post.body} />

            <footer className="mt-16 flex flex-wrap items-start justify-between gap-6 border-t border-border pt-7">
              <Link
                className={`group inline-flex items-center gap-2 text-primary no-underline hover:text-primary-hover ${EYEBROW_CLASS}`}
                to="/"
              >
                <span
                  className="mdi mdi-arrow-left arrow-jiggle-back leading-none"
                  aria-hidden="true"
                />
                {POST_COPY.backToBlogs}
              </Link>

              {onwards && (
                <Link
                  className="group ml-auto flex max-w-full min-w-0 flex-col items-end gap-1 text-right no-underline"
                  to={`/posts/${onwards.slug}`}
                >
                  <span className={`text-faint ${EYEBROW_CLASS}`}>
                    {onwardsLabel}
                  </span>
                  <span className="inline-flex min-w-0 items-center gap-2 text-sm leading-normal font-bold tracking-[-0.01em] text-ink transition-colors duration-200 group-hover:text-primary">
                    <span className="truncate">{onwards.title}</span>
                    <span
                      className="mdi mdi-arrow-right arrow-jiggle shrink-0 leading-none"
                      aria-hidden="true"
                    />
                  </span>
                </Link>
              )}
            </footer>
          </article>
        </div>
      </div>
    </>
  )
}
