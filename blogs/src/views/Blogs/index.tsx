import { posts } from '../../lib/posts'
import { HOME_HERO, SOCIAL_LINKS } from '../../content/site'
import { BLOGS_SECTION } from '../../content/sections'
import { EMPTY_TEXT_CLASS, POST_LIST_CLASS } from '../../lib/ui'
import { PostCard } from './components/PostCard'

export function BlogsPage() {
  return (
    <>
      <section className="relative mx-auto mb-14 max-w-[52rem]" aria-label="Featured">
        {BLOGS_SECTION.heroHeading && (
          <h1 className="mb-8 text-center font-[Poppins,Inter,system-ui,sans-serif] text-[clamp(1.25rem,2.75vw,2rem)] leading-[1.2] font-light whitespace-pre-line text-ink">
            {BLOGS_SECTION.heroHeading}
          </h1>
        )}

        <div className="relative">
          <img
            className="block aspect-video w-full [background:linear-gradient(135deg,#e2e8f0,#cbd5e1)] object-cover shadow-[0_28px_64px_-22px_rgba(14,20,27,0.4)] [clip-path:polygon(56px_0,100%_0,100%_calc(100%_-_56px),calc(100%_-_56px)_100%,0_100%,0_56px)]"
            src={HOME_HERO.imagePath}
            alt={HOME_HERO.alt}
            loading="eager"
            onError={(event) => {
              const img = event.currentTarget
              if (img.src !== HOME_HERO.fallbackImage) {
                img.src = HOME_HERO.fallbackImage
              }
            }}
          />

          {SOCIAL_LINKS.length > 0 && (
            <nav
              className="mx-auto mt-5 flex items-center gap-5 md:absolute md:top-1/2 md:right-0 md:mx-0 md:mt-0 md:flex-col md:gap-7 md:[transform:translate(calc(100%_+_1.5rem),-50%)] md:after:h-12 md:after:w-px md:after:bg-faint md:after:opacity-60 md:after:content-['']"
              aria-label="Social links"
            >
              {SOCIAL_LINKS.map((link) => (
                <a
                  key={link.href}
                  className="text-[0.65rem] font-semibold tracking-[0.18em] text-faint uppercase transition-colors duration-200 hover:text-ink md:rotate-180 md:[writing-mode:vertical-rl]"
                  href={link.href}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          )}
        </div>

        {HOME_HERO.caption && (
          <p className="mt-[0.6rem] text-right text-[0.65rem] tracking-[0.04em] text-faint">
            {HOME_HERO.caption}
          </p>
        )}
      </section>

      <div className="relative mx-auto mb-14 h-px w-full bg-border" aria-hidden="true">
        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-page px-[0.85rem] text-2xl leading-none text-muted">
          ✳
        </span>
      </div>

      {posts.length === 0 ? (
        <p className={EMPTY_TEXT_CLASS}>No posts yet — check back soon.</p>
      ) : (
        <div className={POST_LIST_CLASS}>
          {posts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      )}
    </>
  )
}
