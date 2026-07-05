import { HOBBIES_SECTION } from '../../content/sections'
import { HOBBY_TILES } from '../../content/hobbies/data'
import { PAGE_DESCRIPTIONS } from '../../content/descriptions'
import { isPageDescriptionEnabled } from '../../config/featureFlags'
import { posts } from '../../lib/posts'
import { PostCard } from '../Blogs/components/PostCard'
import {
  INTRO_SECTION_CLASS,
  INTRO_TEXT_CLASS,
  INTRO_TITLE_CLASS,
  POST_LIST_CLASS,
} from '../../lib/ui'

const TILE_CLASS =
  'flex aspect-square w-[calc((100%-1.5rem)/3)] items-center justify-center rounded-2xl transition-transform duration-300 ease-[ease] hover:-translate-y-1 sm:w-[calc((100%-3rem)/4)] lg:w-[calc((100%-4rem)/5)]'

function getTileImageSrc(tile: (typeof HOBBY_TILES)[number]) {
  if (tile.imageId) {
    return `https://media.samyabrata.codeium.xyz/${encodeURIComponent(tile.imageId)}.jpeg`
  }

  return tile.image
}

export function HobbiesPage() {
  const showPageDescription = isPageDescriptionEnabled('hobbies')
  const tag = HOBBIES_SECTION.tag.toLowerCase()
  const hobbyPosts = posts.filter((post) =>
    post.tags.some((postTag) => postTag.toLowerCase() === tag),
  )

  return (
    <>
      <section className={INTRO_SECTION_CLASS}>
        <h1 className={INTRO_TITLE_CLASS}>{HOBBIES_SECTION.title}</h1>
        {showPageDescription && (
          <p className={INTRO_TEXT_CLASS}>{PAGE_DESCRIPTIONS.hobbies}</p>
        )}
      </section>

      <section
        className="ml-[50%] w-[min(calc(100vw-2rem),78rem)] -translate-x-1/2 rounded-2xl bg-ink p-4 sm:p-5"
        aria-label="Hobbies"
      >
        <ul className="flex flex-wrap justify-center gap-3 sm:gap-4">
          {HOBBY_TILES.map((tile) => {
            const imageSrc = getTileImageSrc(tile)

            return (
              <li
                key={tile.label}
                className={`${TILE_CLASS} ${tile.tint ? 'bg-[#dbeafe]' : 'bg-page'} ${
                  imageSrc ? 'overflow-hidden' : ''
                }`}
                title={tile.label}
              >
                {imageSrc ? (
                  <img
                    className="size-full rounded-2xl object-cover"
                    src={imageSrc}
                    alt=""
                    loading="lazy"
                  />
                ) : (
                  <span
                    className={`mdi ${tile.icon} text-4xl leading-none text-ink md:text-5xl`}
                    aria-hidden="true"
                  />
                )}
                <span className="sr-only">{tile.label}</span>
              </li>
            )
          })}
        </ul>
      </section>

      {hobbyPosts.length > 0 && (
        <div className={`mt-12 ${POST_LIST_CLASS}`}>
          {hobbyPosts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      )}
    </>
  )
}
