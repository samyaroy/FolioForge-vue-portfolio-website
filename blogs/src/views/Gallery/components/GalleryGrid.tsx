import type { GalleryItem } from '../../../content/gallery/data'
import { galleryAnchorId } from '../../../lib/share'
import { GalleryCard } from './GalleryCard'

type GalleryGridProps = {
  items: GalleryItem[]
  hasEntries: boolean
  canLoadMore: boolean
  /** Card a shared link pointed at; ringed until the visitor interacts. */
  highlightedId?: string
  onLoadMore: () => void
}

export function GalleryGrid({
  items,
  hasEntries,
  canLoadMore,
  highlightedId = '',
  onLoadMore,
}: GalleryGridProps) {
  if (!items.length) {
    return (
      <div className="rounded-[24px] border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
        <h2 className="text-2xl font-bold text-base_black">
          {hasEntries ? 'No gallery items match this filter.' : 'Coming soon…'}
        </h2>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          {hasEntries
            ? 'Try another tag or add new entries'
            : 'The first clicks are being curated — check back soon.'}
        </p>
      </div>
    )
  }

  return (
    <section className="flex flex-col gap-10">
      <div
        className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,16rem),1fr))] items-stretch gap-4"
        aria-live="polite"
      >
        {/* The id is what a shared card link lands on; see galleryAnchorId. */}
        {items.map((item) => (
          <div
            key={item.id}
            id={galleryAnchorId(item.id)}
            className={`rounded-[6px] transition-shadow duration-500 ${
              item.id === highlightedId
                ? 'ring-2 ring-primary ring-offset-4 ring-offset-slate-50'
                : ''
            }`}
          >
            <GalleryCard item={item} />
          </div>
        ))}
      </div>

      {canLoadMore && (
        <div className="flex justify-center">
          <button
            type="button"
            className="bg-transparent px-6 py-2 text-sm font-medium text-primary"
            onClick={onLoadMore}
          >
            see more
          </button>
        </div>
      )}
    </section>
  )
}
