import { SectionPage } from '../../components/SectionPage'
import { HOBBIES_SECTION } from '../../content/sections'

export function HobbiesPage() {
  return (
    <SectionPage
      title={HOBBIES_SECTION.title}
      description={HOBBIES_SECTION.description}
      pageKey="hobbies"
      tag={HOBBIES_SECTION.tag}
    />
  )
}
