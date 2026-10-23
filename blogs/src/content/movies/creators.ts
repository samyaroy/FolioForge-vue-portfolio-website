import { withoutDisabledEntries } from '../../../../src/config/entryStatus'
import raw from './creators.yml'

export type MovieCreator = {
  id: string
  name: string
  platform?: string
  url?: string
  note?: string
}

type CreatorContent = {
  title: string
  items: MovieCreator[]
}

const content = raw as CreatorContent

export const MOVIE_CREATORS_SECTION = content
// Keep the authored order and honour the same entry visibility as movie cards.
export const MOVIE_CREATORS = withoutDisabledEntries(content.items)
