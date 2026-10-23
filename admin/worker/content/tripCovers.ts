import { isMap, isScalar, isSeq } from 'yaml'
import { HttpError } from '../http.ts'
import { parseContent } from './entries.ts'

// The only value a cover may be set to from here: a WebP the Worker published.
const COVER_URL = /^https:\/\/media\.samyabrata\.codeium\.xyz\/blog-travel\/[a-z0-9][a-z0-9-]*\.webp$/

/** A trip's map in trips.yml, by its id. */
function findTrip(document: ReturnType<typeof parseContent>, trip: string) {
  const trips = document.get('trips', true)
  if (!isSeq(trips)) throw new HttpError(404, 'collection_not_found')
  const index = trips.items.findIndex(item => isMap(item) && item.get('id') === trip)
  const node = trips.items[index]
  if (!isMap(node)) throw new HttpError(404, 'entry_not_found')
  return { index, node }
}

/** Whether trips.yml has this trip, checked before a cover is published for it. */
export function assertTripExists(text: string, trip: string): void {
  findTrip(parseContent(text), trip)
}

/**
 * Point one trip's coverImage at a new WebP. When the trip already names a
 * cover, only that value is replaced in the text, so the rest of the file stays
 * byte for byte as it was: a whole-document render would also respace flow
 * lists and move the comments in this file. A trip with no cover yet gets the
 * key added through the document, which is the one case a splice cannot serve.
 */
export function setTripCover(text: string, trip: string, url: string): string {
  if (!COVER_URL.test(url)) throw new HttpError(400, 'invalid_cover_url')
  const document = parseContent(text)
  const { index, node } = findTrip(document, trip)
  const value = node.get('coverImage', true)

  if (isScalar(value) && typeof value.value === 'string' && value.value && value.range) {
    const [start, end] = value.range
    const spliced = `${text.slice(0, start)}${url}${text.slice(end)}`
    // The splice is kept only if it changed exactly that one value.
    const expected = document.toJS() as { trips: Record<string, unknown>[] }
    expected.trips[index] = { ...expected.trips[index], coverImage: url }
    if (JSON.stringify(parseContent(spliced).toJS()) === JSON.stringify(expected)) return spliced
  }

  document.setIn(['trips', index, 'coverImage'], url)
  return document.toString({ lineWidth: 0 })
}
