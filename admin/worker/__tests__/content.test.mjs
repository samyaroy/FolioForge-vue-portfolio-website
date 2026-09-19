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
    assert.match(path, /^(src\/content\/profile_info|src\/metadata|blogs\/src\/content)\/.+\.yml$/, `${path} is not a content file`)
  }
  for (const path of [
    '.github/workflows/deploy.yml', 'admin/wrangler.jsonc', 'package.json', 'src/router/routes.ts',
    'src/metadata/../../secrets.yml', 'src/metadata/galleryTags.yml',
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
    // Indentation may be normalised, so compare the content of the line.
    for (const line of original.split('\n')) {
      if (line.length > 120 && !line.trimStart().startsWith('#')) {
        assert.ok(rendered.includes(line.trim()), `${id}: a long value was broken across lines`)
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
  const source = contentSources['projects-publications/research']
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

/* ------------------------- deleting, on real files ------------------------ */

test('deleting takes exactly one entry out of every real collection', () => {
  for (const [id, source] of Object.entries(contentSources)) {
    const document = parseContent(readFileSync(REPO + source.path, 'utf8'))
    const total = countEntries(document, source)
    if (!total) continue
    const text = removeEntry(document, locateEntry(document, source, 0))
    assert.equal(countEntries(parseContent(text), source), total - 1, `${id}: delete changed the count by more than one`)
  }
})

test('deleting an entry does not take the comments around it', () => {
  for (const [id, source] of Object.entries(contentSources)) {
    const original = readFileSync(REPO + source.path, 'utf8')
    const document = parseContent(original)
    if (!countEntries(document, source)) continue
    const text = removeEntry(document, locateEntry(document, source, 0))
    const before = (original.match(/#/g) ?? []).length
    const after = (text.match(/#/g) ?? []).length
    // The deleted entry may legitimately carry its own comments; the rest of
    // the file must not lose any.
    assert.ok(after >= before - 6, `${id}: ${before} comments became ${after}`)
  }
})

test('deleting the last entry leaves an empty collection, not a broken file', () => {
  const document = parseContent('items:\n  - one\n')
  const source = { path: 'x', arrayKeys: ['items'] }
  const text = removeEntry(document, locateEntry(document, source, 0))
  const reopened = parseContent(text)
  assert.equal(countEntries(reopened, source), 0)
  assert.ok(hasSequenceKey(reopened, 'items'), 'the key must remain so the next entry can be added')
})

/* ---------------------- nested and named group paths ---------------------- */

test('a collection grouped by an outer list is reached as one flat list', () => {
  // teaching.yml groups mentored projects by semester; the editor shows one list.
  const source = contentSources['teaching/projects']
  const document = parseContent(readFileSync(REPO + source.path, 'utf8'))
  const total = countEntries(document, source)
  assert.ok(total > 1, 'the fixture should span more than one semester')
  const paths = new Set()
  for (let index = 0; index < total; index++) {
    const location = locateEntry(document, source, index)
    assert.notEqual(readEntry(document, location), undefined, `entry ${index} must resolve`)
    paths.add(location.path.join('.'))
  }
  assert.ok(paths.size > 1, 'entries should come from more than one group')
})

test('a named group is addressed by its name, not its position', () => {
  const source = contentSources['cocurricular/leadership']
  const original = readFileSync(REPO + source.path, 'utf8')
  const document = parseContent(original)
  const location = locateEntry(document, source, 0)
  // The selector resolved to the leadership group, whichever index it sits at.
  const groupTitle = document.getIn([...location.path.slice(0, 2), 'title'])
  assert.equal(String(groupTitle), 'leadership_roles')

  // Volunteering must resolve somewhere else entirely.
  const other = contentSources['cocurricular/volunteering']
  const otherLocation = locateEntry(parseContent(original), other, 0)
  assert.notDeepEqual(otherLocation.path, location.path, 'the two groups must not share a path')
})

test('deleting from one named group leaves the other untouched', () => {
  const leadership = contentSources['cocurricular/leadership']
  const volunteering = contentSources['cocurricular/volunteering']
  const original = readFileSync(REPO + leadership.path, 'utf8')
  const document = parseContent(original)
  const volunteersBefore = countEntries(document, volunteering)

  const text = removeEntry(document, locateEntry(document, leadership, 0))
  const after = parseContent(text)
  assert.equal(countEntries(after, leadership), countEntries(parseContent(original), leadership) - 1)
  assert.equal(countEntries(after, volunteering), volunteersBefore, 'the other group must be untouched')
})

/* --------------------------- waiting to publish --------------------------- */

import { discardPending, listPending, readPending, writePending } from '../content/pending.ts'

function pendingBucket() {
  const store = new Map()
  return {
    store,
    binding: {
      get: async key => store.has(key) ? { body: new Response(store.get(key).bytes).body, customMetadata: store.get(key).meta } : null,
      put: async (key, value, options) => { store.set(key, { bytes: new Uint8Array(value), meta: options?.customMetadata }) },
      delete: async key => { store.delete(key) },
      list: async ({ prefix }) => ({ objects: [...store.keys()].filter(k => k.startsWith(prefix)).map(key => ({ key })), truncated: false }),
    },
  }
}

test('an edit waits in the store instead of reaching the branch', async () => {
  const bucket = pendingBucket()
  await writePending(bucket.binding, { path: 'src/content/profile_info/education.yml', text: 'education:\n  - degree: MSc\n', baseSha: 'a'.repeat(40), summaries: ['update an entry'] })
  const file = await readPending(bucket.binding, 'src/content/profile_info/education.yml')
  assert.equal(file.text, 'education:\n  - degree: MSc\n')
  assert.equal(file.baseSha, 'a'.repeat(40))
  assert.deepEqual(file.summaries, ['update an entry'])
})

test('a path with slashes round-trips as one key', async () => {
  const bucket = pendingBucket()
  const path = 'blogs/src/content/travel/data.yml'
  await writePending(bucket.binding, { path, text: 'states: []\n', baseSha: 'b'.repeat(40), summaries: [] })
  const [listed] = await listPending(bucket.binding)
  assert.equal(listed.path, path, 'the path must survive being used as a key')
  assert.equal(bucket.store.size, 1)
})

test('several edits to one file collapse into one pending change', async () => {
  const bucket = pendingBucket()
  const path = 'src/content/profile_info/education.yml'
  for (const summary of ['first', 'second', 'third']) {
    const existing = await readPending(bucket.binding, path)
    await writePending(bucket.binding, { path, text: `# ${summary}\n`, baseSha: 'c'.repeat(40), summaries: [...(existing?.summaries ?? []), summary] })
  }
  const files = await listPending(bucket.binding)
  // One file waiting, carrying the history of what was done to it.
  assert.equal(files.length, 1)
  assert.deepEqual(files[0].summaries, ['first', 'second', 'third'])
  assert.equal(files[0].text, '# third\n')
})

test('discarding clears what was waiting', async () => {
  const bucket = pendingBucket()
  await writePending(bucket.binding, { path: 'a.yml', text: 'x', baseSha: 'd'.repeat(40), summaries: [] })
  await writePending(bucket.binding, { path: 'b.yml', text: 'y', baseSha: 'd'.repeat(40), summaries: [] })
  assert.equal(await discardPending(bucket.binding, 'a.yml'), 1)
  assert.equal((await listPending(bucket.binding)).length, 1)
  assert.equal(await discardPending(bucket.binding), 1)
  assert.equal((await listPending(bucket.binding)).length, 0)
})
