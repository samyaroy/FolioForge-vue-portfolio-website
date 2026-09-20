// SUB-BULLET FEATURE (unused). These cover src/utils/bulletLines.ts, which no
// content exercises today; they go when the feature goes.
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { descriptionBlocks, isSubBullet, subBulletOrdinal, toggleSubBullet } from '../../../src/utils/bulletLines.ts'

test('a leading dash and a space marks a sub-bullet', () => {
  assert.equal(isSubBullet('- Summer 2026'), true)
  assert.equal(isSubBullet('  - indented in the YAML'), true)
  assert.equal(isSubBullet('Mentored 13 interns'), false)
})

// Content legitimately opens with a hyphen or a dash, and neither is a bullet.
test('a dash that is part of the words is left alone', () => {
  assert.equal(isSubBullet('-5% error against the baseline'), false)
  assert.equal(isSubBullet('— an em dash opening'), false)
  assert.equal(isSubBullet('-'), false)
})

test('an em dash inside the line is not mistaken for the marker', () => {
  assert.deepEqual(descriptionBlocks(['- **Summer 2026** — 9 interns across 3 projects']), [
    { kind: 'list', items: ['**Summer 2026** — 9 interns across 3 projects'] },
  ])
})

test('consecutive sub-bullets become one numbered list', () => {
  assert.deepEqual(descriptionBlocks(['A point', '- first', '- second', 'Another point']), [
    { kind: 'point', text: 'A point' },
    { kind: 'list', items: ['first', 'second'] },
    { kind: 'point', text: 'Another point' },
  ])
})

// Two points each with their own breakdown must not share a numbering run.
test('a point between two runs starts the numbering again', () => {
  assert.deepEqual(descriptionBlocks(['One', '- a', 'Two', '- b']), [
    { kind: 'point', text: 'One' },
    { kind: 'list', items: ['a'] },
    { kind: 'point', text: 'Two' },
    { kind: 'list', items: ['b'] },
  ])
  assert.equal(subBulletOrdinal(['One', '- a', 'Two', '- b'], 3), 1)
})

test('the editor numbers a line the way the site will draw it', () => {
  const lines = ['Mentored 13 interns:', '- Summer 2026', '- Spring 2026']
  assert.equal(subBulletOrdinal(lines, 1), 1)
  assert.equal(subBulletOrdinal(lines, 2), 2)
  assert.equal(subBulletOrdinal(lines, 0), 0)
})

test('toggling adds the marker and takes it off again', () => {
  assert.equal(toggleSubBullet('Summer 2026'), '- Summer 2026')
  assert.equal(toggleSubBullet('- Summer 2026'), 'Summer 2026')
  assert.equal(toggleSubBullet(toggleSubBullet('Summer 2026')), 'Summer 2026')
})

test('an empty description renders nothing rather than failing', () => {
  assert.deepEqual(descriptionBlocks([]), [])
})
