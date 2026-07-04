import { isPageDescriptionEnabled } from '../../../config/featureFlags'
import { PAGE_DESCRIPTIONS } from '../../../content/descriptions'

export function GalleryHero() {
  const showPageDescription = isPageDescriptionEnabled('gallery')

  return (
    <section className="flex flex-row items-end gap-4 pb-1">
      <div className="flex min-w-0 w-full flex-col gap-4">
        <h1 className="text-lg leading-tight font-extrabold tracking-tight text-base_black md:text-4xl">
          Click Click...
        </h1>

        {showPageDescription && (
          <p className="text-base leading-8 text-slate-500 md:text-lg">
            {PAGE_DESCRIPTIONS.gallery}
          </p>
        )}
      </div>
    </section>
  )
}
