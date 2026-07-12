// Typed accessors over sections.yml (per-page titles and labels).
// Page subtitle/description lines live in descriptions.yml / descriptions.ts.
import raw from './sections.yml'

interface SectionsContent {
  blogs: {
    title: string
    heroHeading: string
    allPostsTitle: string
  }
  readings: {
    title: string
    tag: string
    cardLabel: string
    emptyLabel: string
    reviewLabel: string
    noteLabel: string
    linkLabel: string
  }
  hobbies: {
    title: string
    tag: string
  }
  gallery: {
    title: string
    tag: string
  }
  travel: {
    title: string
    tag: string
    mapTitle: string
    mapAttribution: string
    detailsLabel: string
    backToTravel: string
    routeMapTitle: string
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
