import { posts } from '../../lib/posts'
import { HOME_HERO, SOCIAL_LINKS } from '../../content/site'
import { BLOGS_SECTION } from '../../content/sections'
import { PostCard } from './components/PostCard'

export function BlogsPage() {
  return (
    <>
      <section className="blog-hero" aria-label="Featured">
        {BLOGS_SECTION.heroHeading && (
          <h1 className="blog-hero__heading">{BLOGS_SECTION.heroHeading}</h1>
        )}

        <div className="blog-hero__media">
          <img
            className="blog-hero__image"
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
            <nav className="blog-social" aria-label="Social links">
              {SOCIAL_LINKS.map((link) => (
                <a
                  key={link.href}
                  className="blog-social__link"
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
          <p className="blog-hero__caption">{HOME_HERO.caption}</p>
        )}
      </section>

      <div className="hero-divider" aria-hidden="true">
        <span className="hero-divider__star">✳</span>
      </div>

      {posts.length === 0 ? (
        <p className="empty">No posts yet — check back soon.</p>
      ) : (
        <div className="post-list">
          {posts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      )}
    </>
  )
}
