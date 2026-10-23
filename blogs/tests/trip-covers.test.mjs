import assert from 'node:assert/strict'
import { test } from 'node:test'
import { cardCoverUrl } from '../src/lib/tripCovers.ts'

const BASE = 'https://media.samyabrata.codeium.xyz/blog-travel'

test('a cover in blog-travel/ maps to its card copy, always .jpeg', () => {
  assert.equal(cardCoverUrl(`${BASE}/vizag-01-2025.jpeg`), `${BASE}/card/vizag-01-2025.jpeg`)
  assert.equal(cardCoverUrl(`${BASE}/delhi-001-iitdelhi-04.jpg`), `${BASE}/card/delhi-001-iitdelhi-04.jpeg`)
  assert.equal(cardCoverUrl(`${BASE}/vizag-001-2025-02.JPG`), `${BASE}/card/vizag-001-2025-02.jpeg`)
})

test('covers elsewhere, or already in a subfolder, get no card copy', () => {
  assert.equal(cardCoverUrl('https://example.com/photo.jpeg'), undefined)
  assert.equal(cardCoverUrl(`${BASE}/card/vizag-01-2025.jpeg`), undefined)
  assert.equal(cardCoverUrl(`${BASE}/`), undefined)
})
