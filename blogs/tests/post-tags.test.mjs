import assert from 'node:assert/strict'
import { test } from 'node:test'
import { postsWithAnyTag, tagCounts } from '../src/views/Blogs/components/postTags.ts'

const post = (slug, tags) => ({ slug, title: slug, date: '2026-01-01', tags })

const POSTS = [
  post('a', ['React', 'meta']),
  post('b', ['react', 'markdown']),
  post('c', ['markdown', 'reference', 'Markdown']),
]

test('tags count once per post, case-insensitively, most used first', () => {
  assert.deepEqual(tagCounts(POSTS), [
    { tag: 'markdown', count: 2 },
    { tag: 'react', count: 2 },
    { tag: 'meta', count: 1 },
    { tag: 'reference', count: 1 },
  ])
})

test('filtering keeps posts with any picked tag, and no pick keeps every post', () => {
  assert.deepEqual(postsWithAnyTag(POSTS, ['react']).map((p) => p.slug), ['a', 'b'])
  assert.deepEqual(postsWithAnyTag(POSTS, ['meta', 'reference']).map((p) => p.slug), ['a', 'c'])
  assert.equal(postsWithAnyTag(POSTS, []), POSTS)
})

test('movie tags support missing tags, whitespace, and any selected genre', () => {
  const movies = [
    { id: 'silent-horror', tags: [' Horror ', 'silent cinema', 'HORROR', ' '] },
    { id: 'drama', tags: ['drama'] },
    { id: 'untagged' },
  ]

  assert.deepEqual(tagCounts(movies), [
    { tag: 'drama', count: 1 },
    { tag: 'horror', count: 1 },
    { tag: 'silent cinema', count: 1 },
  ])
  assert.deepEqual(
    postsWithAnyTag(movies, ['horror', 'drama']).map((movie) => movie.id),
    ['silent-horror', 'drama'],
  )
  assert.deepEqual(postsWithAnyTag(movies, ['comedy']), [])
  assert.equal(postsWithAnyTag(movies, []), movies)
})
