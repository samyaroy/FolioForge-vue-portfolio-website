import assert from 'node:assert/strict'
import { test } from 'node:test'
import { emphasisTags, hasEmphasis, splitEmphasis, stripEmphasis } from '../../../src/utils/inlineMarkup.ts'

/** The rendered shape of a string: its runs, each with the tags it needs. */
const render = text => splitEmphasis(text).map(run => [run.text, emphasisTags(run).join('>')])

test('each marker produces its own element', () => {
  assert.deepEqual(render('**bold**'), [['bold', 'strong']])
  assert.deepEqual(render('*italic*'), [['italic', 'em']])
  assert.deepEqual(render('__underline__'), [['underline', 'u']])
})

test('marked runs keep the plain text around them', () => {
  assert.deepEqual(render('the **Summer 2026** cohort'), [
    ['the ', ''],
    ['Summer 2026', 'strong'],
    [' cohort', ''],
  ])
})

// These are the spellings the editor's buttons produce when two of them are
// pressed over the same words.
test('marks combine by nesting, outermost tag first', () => {
  assert.deepEqual(render('**__both__**'), [['both', 'strong>u']])
  assert.deepEqual(render('__**both**__'), [['both', 'strong>u']])
  assert.deepEqual(render('***bold italic***'), [['bold italic', 'strong>em']])
  assert.deepEqual(render('__*both*__'), [['both', 'em>u']])
  assert.deepEqual(render('__***all three***__'), [['all three', 'strong>em>u']])
})

// The reason underline is __ and not _: content is full of snake_case, and
// single-underscore italic would eat it.
test('snake_case survives, because underline needs a doubled delimiter', () => {
  assert.deepEqual(render('research_projects and cred_link'), [['research_projects and cred_link', '']])
})

test('an unpaired delimiter is left as typed', () => {
  assert.deepEqual(render('2 * 3 is not italic'), [['2 * 3 is not italic', '']])
  assert.deepEqual(render('a __lonely start'), [['a __lonely start', '']])
})

test('a doubled delimiter is never read as two single ones', () => {
  assert.deepEqual(render('**bold**'), [['bold', 'strong']])
  assert.deepEqual(render('**a** and *b*'), [
    ['a', 'strong'],
    [' and ', ''],
    ['b', 'em'],
  ])
})

test('stripEmphasis gives back what a reader sees', () => {
  assert.equal(stripEmphasis('**a** *b* __c__'), 'a b c')
  assert.equal(stripEmphasis(''), '')
  assert.equal(stripEmphasis(null), '')
  assert.equal(stripEmphasis(undefined), '')
})

// A global regexp carries lastIndex between calls, so `test` on a shared one
// answers differently every other time. hasEmphasis must not do that.
test('hasEmphasis answers the same way however often it is asked', () => {
  assert.equal(hasEmphasis('**x**'), true)
  assert.equal(hasEmphasis('**x**'), true)
  assert.equal(hasEmphasis('plain'), false)
  assert.equal(hasEmphasis('plain'), false)
  assert.equal(hasEmphasis(''), false)
})

test('empty runs are dropped rather than rendered as empty elements', () => {
  assert.deepEqual(render(''), [])
})

// The bold button types this pair and leaves the caret between them, so it is
// on screen for as long as it takes to type the words it will cover.
test('the empty marker pair the editor types stays literal', () => {
  assert.deepEqual(render('****'), [['****', '']])
  assert.deepEqual(render('____'), [['____', '']])
  assert.deepEqual(render('**'), [['**', '']])
})

test('the site bullet this was built for renders as authored', () => {
  assert.deepEqual(
    render("over the **Summer 2026** and **Spring 2026** cohorts of the institute's *Internship Program on Data Science*"),
    [
      ['over the ', ''],
      ['Summer 2026', 'strong'],
      [' and ', ''],
      ['Spring 2026', 'strong'],
      [" cohorts of the institute's ", ''],
      ['Internship Program on Data Science', 'em'],
    ],
  )
})
