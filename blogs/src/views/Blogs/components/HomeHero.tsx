import type { ReactNode } from 'react'
import { HOME_HERO, SOCIAL_LINKS } from '../../../content/site'
import { BLOGS_SECTION } from '../../../content/sections'
import { Typewriter } from '../../../components/Typewriter'

type HomeHeroProps = {
  /** Optional panel beside the image on wide screens (below it on narrow
      ones). Without it the hero is the original centred column. */
  aside?: ReactNode
}

/**
 * Hero block at the top of the blog home page: the typewriter heading, the
 * clipped hero image with its caption, and the social links rail. Content
 * comes from content/site.ts (HOME_HERO, SOCIAL_LINKS) and sections.yml.
 */
export function HomeHero({ aside }: HomeHeroProps) {
  const heading = BLOGS_SECTION.heroHeading && (
    <h1 className="mb-6 text-center font-[Poppins,Inter,system-ui,sans-serif] text-[clamp(1.25rem,2.75vw,2rem)] leading-[1.2] font-light whitespace-pre-line text-ink">
      <Typewriter text={BLOGS_SECTION.heroHeading} />
    </h1>
  )

  const artwork = (
    <>
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
    </>
  )

  if (!aside) {
    return (
      <section
        className="relative mx-auto mb-9 max-w-[52rem]"
        aria-label="Featured"
      >
        {heading}
        {artwork}
      </section>
    )
  }

  // With a panel: artwork and panel side by side from lg. The gap leaves room
  // for the social rail, which sits just off the artwork's right edge.
  return (
    <section className="relative mx-auto mb-9 max-w-6xl" aria-label="Featured">
      {heading}
      <div className="grid grid-cols-1 gap-y-8 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:items-center lg:gap-x-18">
        <div className="mx-auto w-full max-w-[52rem]">{artwork}</div>
        {aside}
      </div>
    </section>
  )
}
