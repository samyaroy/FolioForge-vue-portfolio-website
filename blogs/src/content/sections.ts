// Typed accessors over sections.yml (per-page titles, descriptions, labels).
import raw from './sections.yml'

interface SectionsContent {
  blogs: {
    title: string
    description: string
    heroHeading: string
  }
  readings: {
    title: string
    description: string
    tag: string
    cardLabel: string
    emptyLabel: string
    reviewLabel: string
  }
  hobbies: {
    title: string
    description: string
    tag: string
  }
  gallery: {
    title: string
    description: string
    tag: string
  }
  travel: {
    title: string
    description: string
    tag: string
    mapTitle: string
    mapAttribution: string
  }
  post: {
    backToBlogs: string
  }
}

const sections = raw as SectionsContent

export const BLOGS_SECTION = sections.blogs
export const READINGS_SECTION = sections.readings
export const HOBBIES_SECTION = sections.hobbies
export const GALLERY_SECTION = sections.gallery
export const TRAVEL_SECTION = sections.travel
export const POST_COPY = sections.post
