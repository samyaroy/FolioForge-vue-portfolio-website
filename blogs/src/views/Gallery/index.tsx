import { SectionPage } from '../../components/SectionPage'
import { GALLERY_SECTION } from '../../content/sections'

export function GalleryPage() {
  return (
    <SectionPage
      title={GALLERY_SECTION.title}
      description={GALLERY_SECTION.description}
      pageKey="gallery"
      tag={GALLERY_SECTION.tag}
    />
  )
}
