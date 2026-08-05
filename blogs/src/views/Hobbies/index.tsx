import { HOBBIES_SECTION } from '../../content/sections'
import { HOBBY_TILES } from '../../content/hobbies/data'
import { PAGE_DESCRIPTIONS } from '../../content/descriptions'
import { isPageDescriptionEnabled } from '../../config/featureFlags'
import { posts } from '../../lib/posts'
import { PostCard } from '../Blogs/components/PostCard'
import { HobbyTile } from './components/HobbyTile'
import {
  INTRO_SECTION_CLASS,
  INTRO_TEXT_CLASS,
  INTRO_TITLE_CLASS,
  POST_LIST_CLASS,
} from '../../lib/ui'
import { usePageTitle } from '../../lib/usePageTitle'

export function HobbiesPage() {
  usePageTitle(HOBBIES_SECTION.title)
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
          {HOBBY_TILES.map((tile, index) => (
            <HobbyTile key={tile.label} tile={tile} order={index} />
          ))}
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
