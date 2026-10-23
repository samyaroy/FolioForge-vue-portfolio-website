import assert from 'node:assert/strict'
import { test } from 'node:test'
import { originalCoverUrls, webpCoverUrl } from '../src/lib/tripCovers.ts'

const BASE = 'https://media.samyabrata.codeium.xyz/blog-travel'

test('a cover in blog-travel/ maps to the WebP beside it', () => {
  assert.equal(webpCoverUrl(`${BASE}/vizag-01-2025.jpeg`), `${BASE}/vizag-01-2025.webp`)
  assert.equal(webpCoverUrl(`${BASE}/delhi-001-iitdelhi-04.jpg`), `${BASE}/delhi-001-iitdelhi-04.webp`)
  assert.equal(webpCoverUrl(`${BASE}/vizag-001-2025-02.JPG`), `${BASE}/vizag-001-2025-02.webp`)
  assert.equal(webpCoverUrl(`${BASE}/vizag-01-2025.webp`), `${BASE}/vizag-01-2025.webp`)
})

test('covers elsewhere, or in a subfolder, are left as they are', () => {
  assert.equal(webpCoverUrl('https://example.com/photo.jpeg'), undefined)
  assert.equal(webpCoverUrl(`${BASE}/card/vizag-01-2025.jpeg`), undefined)
  assert.equal(webpCoverUrl(`${BASE}/`), undefined)
  assert.deepEqual(originalCoverUrls('https://example.com/photo.jpeg'), [])
})

test('the original of a WebP cover is looked for beside it', () => {
  assert.deepEqual(originalCoverUrls(`${BASE}/vizag-01-2025.jpeg`), [`${BASE}/vizag-01-2025.jpeg`])
  assert.deepEqual(originalCoverUrls(`${BASE}/vizag-01-2025.webp`), [
    `${BASE}/vizag-01-2025.jpeg`,
    `${BASE}/vizag-01-2025.jpg`,
    `${BASE}/vizag-01-2025.png`,
  ])
})
