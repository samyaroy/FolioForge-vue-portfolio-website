import assert from 'node:assert/strict'
import { test } from 'node:test'
import { readFileSync } from 'node:fs'
import { contentSource, contentSources, isWritablePath, writablePaths } from '../content/registry.ts'
import { appendLocation, countEntries, hasSequenceKey, insertEntry, locateEntry, parseContent, readEntry, removeEntry, renderUnchanged, replaceEntry, sequencePath } from '../content/entries.ts'

const REPO = new URL('../../../', import.meta.url).pathname

/* ------------------------------- allowlist ------------------------------- */

test('every collection points at a file that really exists', () => {
  for (const [id, source] of Object.entries(contentSources)) {
    assert.doesNotThrow(() => readFileSync(REPO + source.path, 'utf8'), `${id} -> ${source.path}`)
  }
})

test('only content files are writable, and nothing outside the allowlist is', () => {
  for (const path of writablePaths) {
    assert.match(path, /^(src\/content\/profile_info|blogs\/src\/content)\/.+\.yml$/, `${path} is not a content file`)
  }
  for (const path of [
    '.github/workflows/deploy.yml', 'admin/wrangler.jsonc', 'package.json', 'src/router/routes.ts',
    '../../../etc/passwd', 'src/content/profile_info/../../../secret.yml', 'src/content/profile_info/education.yml/../x',
  ]) {
    assert.equal(isWritablePath(path), false, `${path} must not be writable`)
  }
})

test('an unknown collection resolves to nothing', () => {
  for (const id of ['', 'nope', 'constructor', '__proto__', 'toString', 'home/education/extra']) {
    assert.equal(contentSource(id), undefined, `${id} should not resolve`)
  }
  assert.equal(contentSource('home/education')?.path, 'src/content/profile_info/education.yml')
})

/* ----------------------------- editing a file ---------------------------- */

const SAMPLE = `# Education history, newest first
education:
  # Masters, ongoing
  - degree: MSc            # in progress
    institution: University of Calcutta
    gpa: null
    unknown_legacy_field: kept
  - degree: BSc
    institution: SNU
`

test('editing one entry leaves the comments, the nulls and the unknown fields alone', () => {
  const document = parseContent(SAMPLE)
  const text = replaceEntry(document, { path: ['education'], index: 1 }, { degree: 'BSc (Hons)', institution: 'SNU' })
  assert.ok(text.includes('# Education history, newest first'), 'leading comment kept')
  assert.ok(text.includes('# Masters, ongoing'), 'entry comment kept')
  assert.ok(text.includes('# in progress'), 'inline comment kept')
  assert.ok(text.includes('gpa: null'), 'an explicit null is not the same as a missing key')
  assert.ok(text.includes('unknown_legacy_field: kept'), 'a field this code knows nothing about survives')
  assert.ok(text.includes('degree: BSc (Hons)'), 'the edit landed')
})

test('a flat index finds the right array when a collection spans two', () => {
  const document = parseContent('a:\n  - one\n  - two\nb:\n  - three\n')
  const source = { path: 'x', arrayKeys: ['a', 'b'] }
  assert.deepEqual(locateEntry(document, source, 0), { path: ['a'], index: 0 })
  assert.deepEqual(locateEntry(document, source, 1), { path: ['a'], index: 1 })
  // Entry 2 belongs to the second array; writing it to the first would move it.
  assert.deepEqual(locateEntry(document, source, 2), { path: ['b'], index: 0 })
  assert.equal(readEntry(document, locateEntry(document, source, 2)), 'three')
  assert.throws(() => locateEntry(document, source, 3), error => error.code === 'entry_not_found')
  for (const bad of [-1, 1.5, Number.NaN]) assert.throws(() => locateEntry(document, source, bad), error => error.code === 'invalid_index')
})

test('a new entry is appended to the collection, not scattered', () => {
  const document = parseContent('a:\n  - one\nb:\n  - two\n')
  const source = { path: 'x', arrayKeys: ['a', 'b'] }
  assert.deepEqual(appendLocation(document, source), { path: ['b'], index: 1 })
})

test('removing an entry takes only that entry', () => {
  const document = parseContent(SAMPLE)
  const text = removeEntry(document, { path: ['education'], index: 1 })
  assert.equal(text.includes('degree: BSc'), false)
  assert.ok(text.includes('degree: MSc'))
  assert.ok(text.includes('# Masters, ongoing'))
})

/* --------------------------- real files survive -------------------------- */

test('every real content file parses and round-trips without losing a comment', () => {
  for (const [id, source] of Object.entries(contentSources)) {
    const original = readFileSync(REPO + source.path, 'utf8')
    const document = parseContent(original)
    const rendered = renderUnchanged(document)
    const commentsBefore = (original.match(/#/g) ?? []).length
    const commentsAfter = (rendered.match(/#/g) ?? []).length
    assert.ok(commentsAfter >= commentsBefore, `${id}: ${commentsBefore} comments became ${commentsAfter}`)
    // Rendering must not re-wrap long values: that would rewrite most of a file.
    for (const line of original.split('\n')) {
      if (line.length > 120 && !line.trimStart().startsWith('#')) {
        assert.ok(rendered.includes(line.trimEnd()), `${id}: a long line was re-wrapped`)
        break
      }
    }
  }
})

test('a collection drawn from two arrays can reach every entry in the real file', () => {
  const source = contentSources['internships-certifications/certifications']
  const document = parseContent(readFileSync(REPO + source.path, 'utf8'))
  const total = countEntries(document, source)
  assert.ok(total > 0, 'the fixture should have certifications')
  for (let index = 0; index < total; index++) {
    assert.notEqual(readEntry(document, locateEntry(document, source, index)), undefined, `entry ${index} must resolve`)
  }
  assert.throws(() => locateEntry(document, source, total), error => error.code === 'entry_not_found')
})


/* --------------------- the registry against real files -------------------- */

// The bug this catches: a registry key that names a sequence which is not
// actually there, because the file nests it. projects.yml keeps all four of its
// arrays under one `projects:` key, and a top-level lookup finds nothing.
test('every collection names a key its file actually has', () => {
  for (const [id, source] of Object.entries(contentSources)) {
    const document = parseContent(readFileSync(REPO + source.path, 'utf8'))
    for (const arrayKey of source.arrayKeys) {
      // Present-but-null is an empty collection; absent is a registry mistake,
      // and the edit would land in a sequence the site never reads.
      assert.ok(hasSequenceKey(document, arrayKey), `${id}: ${source.path} has no key ${arrayKey}`)
      const node = document.getIn(sequencePath(arrayKey), true)
      // A key whose entries are all commented out parses as a null scalar.
      const empty = node === null || node === undefined || node.value === null || node.value === undefined
      assert.ok(Array.isArray(node?.items) || empty, `${id}: ${arrayKey} is neither a sequence nor empty`)
    }
  }
})

test('the first entry of an empty collection creates its sequence', () => {
  // affiliations.yml keeps its keys with every entry commented out.
  const source = contentSources['affiliations/affiliations']
  const document = parseContent(readFileSync(REPO + source.path, 'utf8'))
  assert.equal(countEntries(document, source), 0, 'fixture should start empty')
  const text = insertEntry(document, appendLocation(document, source), { organization: 'New Org', role: 'Member' })
  assert.ok(text.includes('organization: New Org'), 'the first entry landed')
  // The commented-out examples are what the owner kept as a template.
  assert.ok(text.includes('# - organization: Center for Data Science'), 'the commented template survived')
  assert.equal(countEntries(parseContent(text), source), 1)
})

test('every entry of every collection is reachable by its flat index', () => {
  for (const [id, source] of Object.entries(contentSources)) {
    const document = parseContent(readFileSync(REPO + source.path, 'utf8'))
    const total = countEntries(document, source)
    for (let index = 0; index < total; index++) {
      const location = locateEntry(document, source, index)
      assert.notEqual(readEntry(document, location), undefined, `${id}: entry ${index} did not resolve`)
    }
    assert.throws(() => locateEntry(document, source, total), error => error.code === 'entry_not_found', `${id}: index ${total} should be past the end`)
  }
})

test('a nested collection edits the nested array, not a new top-level one', () => {
  const source = contentSources['projects-publications/projects']
  const original = readFileSync(REPO + source.path, 'utf8')
  const document = parseContent(original)
  const location = locateEntry(document, source, 0)
  assert.deepEqual(location.path, ['projects', 'research_projects'])
  const before = readEntry(document, location)
  const text = replaceEntry(document, location, { ...JSON.parse(JSON.stringify(before)), title: 'Edited title' })
  assert.ok(text.includes('title: Edited title'))
  // A top-level `research_projects:` key would mean the edit went to a sequence
  // the site never reads.
  assert.equal(/^research_projects:/m.test(text), false, 'a stray top-level sequence was created')
  assert.ok(/^projects:/m.test(text))
})
