import assert from 'node:assert/strict'
import { test } from 'node:test'
import { readFileSync } from 'node:fs'
import { parseContent } from '../content/entries.ts'
import { assertTripExists, setTripCover } from '../content/tripCovers.ts'

const TRIPS = readFileSync(new URL('../../../blogs/src/content/travel/trips.yml', import.meta.url), 'utf8')
const COVER = 'https://media.samyabrata.codeium.xyz/blog-travel/vizag-01-2025-01.webp'

const changedLines = (before, after) => {
  const a = before.split('\n')
  const b = after.split('\n')
  return a.flatMap((line, index) => line === b[index] ? [] : [index])
}

test('a new cover changes that one line of the real trips file and nothing else', () => {
  const text = setTripCover(TRIPS, 'vizag-01-2025', COVER)
  const changed = changedLines(TRIPS, text)
  assert.equal(changed.length, 1)
  assert.equal(text.split('\n')[changed[0]].trim(), `coverImage: ${COVER}`)
  const trips = parseContent(text).toJS().trips
  assert.equal(trips.find(trip => trip.id === 'vizag-01-2025').coverImage, COVER)
})

test('a quoted cover is replaced with the plain URL', () => {
  const text = setTripCover("trips:\n  - id: a\n    coverImage: 'https://example.com/a.jpeg' # old\n", 'a', COVER)
  assert.equal(text, `trips:\n  - id: a\n    coverImage: ${COVER} # old\n`)
})

test('a trip with no cover yet gets one', () => {
  const text = setTripCover('trips:\n  - id: a\n    title: A\n  - id: b\n', 'b', COVER)
  assert.deepEqual(parseContent(text).toJS().trips, [{ id: 'a', title: 'A' }, { id: 'b', coverImage: COVER }])
  // An empty value cannot be spliced into without breaking the line.
  const empty = setTripCover('trips:\n  - id: a\n    coverImage:\n', 'a', COVER)
  assert.equal(parseContent(empty).toJS().trips[0].coverImage, COVER)
})

test('only a WebP in blog-travel/ may become a cover', () => {
  for (const bad of [
    'https://media.samyabrata.codeium.xyz/blog-travel/a.jpeg',
    'https://media.samyabrata.codeium.xyz/other/a.webp',
    'https://example.com/blog-travel/a.webp',
    'https://media.samyabrata.codeium.xyz/blog-travel/a.webp # injected',
    'https://media.samyabrata.codeium.xyz/blog-travel/a.webp\n  - id: x',
  ]) {
    assert.throws(() => setTripCover(TRIPS, 'vizag-01-2025', bad), error => error.code === 'invalid_cover_url', JSON.stringify(bad))
  }
})

test('a trip that is not in the file is refused', () => {
  assert.throws(() => assertTripExists(TRIPS, 'not-a-trip'), error => error.code === 'entry_not_found')
  assert.throws(() => setTripCover(TRIPS, 'not-a-trip', COVER), error => error.code === 'entry_not_found')
  assert.doesNotThrow(() => assertTripExists(TRIPS, 'vizag-01-2025'))
})
