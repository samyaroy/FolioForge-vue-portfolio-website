import assert from 'node:assert/strict'
import { test } from 'node:test'
import { hasCrossReference, splitCrossReference, stripCrossReference, writeCrossReference } from '../../../src/utils/crossReference.ts'

test('a trailing @see is split from the sentence', () => {
  assert.deepEqual(splitCrossReference('Mentored 13 interns @see[See the projects](/teachings)'), {
    text: 'Mentored 13 interns',
    reference: { label: 'See the projects', target: '/teachings', internal: true },
  })
})

test('a target may carry a query, so a link can land on one card', () => {
  const { reference } = splitCrossReference('Mentored @see[Summer](/teachings?tab=projects&semester=summer-2026)')
  assert.equal(reference.target, '/teachings?tab=projects&semester=summer-2026')
  assert.equal(reference.internal, true)
})

// Anything not starting with / is somewhere else entirely and must not be
// handed to the router, which would treat it as a path.
test('an off-site target is not treated as a route', () => {
  const { reference } = splitCrossReference('Published @see[Read it](https://example.com/paper)')
  assert.equal(reference.internal, false)
  assert.equal(reference.target, 'https://example.com/paper')
})

test('a line without a reference is returned unchanged', () => {
  assert.deepEqual(splitCrossReference('Just a sentence'), { text: 'Just a sentence', reference: null })
  assert.equal(hasCrossReference('Just a sentence'), false)
})

// The marker is only honoured at the end, because that is the only place it is
// drawn; recognising it mid-sentence would promise a position that never happens.
test('a marker that is not trailing stays literal', () => {
  assert.deepEqual(splitCrossReference('Before @see[Label](/path) after'), {
    text: 'Before @see[Label](/path) after',
    reference: null,
  })
})

test('an email address or a stray @see does not parse as one', () => {
  assert.equal(hasCrossReference('Reach me at someone@see.example'), false)
  assert.equal(hasCrossReference('@see'), false)
  assert.equal(hasCrossReference('@see[Label]'), false)
})

test('writing then stripping leaves the sentence as it was', () => {
  const sentence = 'Mentored 13 interns'
  const line = `${sentence} ${writeCrossReference('See the projects', '/teachings')}`
  assert.equal(hasCrossReference(line), true)
  assert.equal(stripCrossReference(line), sentence)
})

test('the marker never reaches the rendered text', () => {
  const { text } = splitCrossReference('Mentored **13 interns** @see[See](/teachings)')
  assert.equal(text.includes('@see'), false)
  assert.equal(text, 'Mentored **13 interns**')
})
