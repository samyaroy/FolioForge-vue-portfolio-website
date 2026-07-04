import { SectionPage } from '../../components/SectionPage'
import { GALLERY_SECTION } from '../../content/sections'

export function GalleryPage() {
  return (
    <SectionPage
      title={GALLERY_SECTION.title}
      pageKey="gallery"
      tag={GALLERY_SECTION.tag}
    />
  )
}
