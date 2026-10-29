import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { test } from 'node:test'
import { DriveError, accessToken, driveClient, planTargets, publishTarget } from '../cv/drive.ts'

const FOLDER_MIME = 'application/vnd.google-apps.folder'
const md5 = bytes => createHash('md5').update(bytes).digest('hex')
const pdf = text => {
  const bytes = new TextEncoder().encode(`%PDF-${text}`)
  return { bytes, md5: md5(bytes) }
}

/**
 * Drive in memory: folders, files with their versions, and every request in
 * order. It answers only the requests drive.ts makes, from the query text
 * Drive itself would parse.
 */
function fakeDrive() {
  const files = new Map()
  const calls = []
  let next = 0
  const add = (name, parent, { folder = false, content } = {}) => {
    const id = `id${next++}`
    files.set(id, { id, name, parent, folder, versions: content ? [{ id: `${id}-v0`, content, modifiedTime: '2026-10-03T05:17:00Z' }] : [] })
    return id
  }
  const reply = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
  const unquote = value => value.replace(/\\(.)/g, '$1')

  async function fetcher(input, init = {}) {
    const url = new URL(input)
    const method = init.method ?? 'GET'
    calls.push(`${method} ${url.pathname}`)
    if (url.pathname === '/drive/v3/files' && method === 'GET') {
      const q = url.searchParams.get('q')
      const parent = unquote(/^'((?:\\.|[^'])*)' in parents/.exec(q)[1])
      const name = /name = '((?:\\.|[^'])*)'/.exec(q)
      const found = [...files.values()].filter(file => file.parent === parent
        && (q.includes(`mimeType = '${FOLDER_MIME}'`) ? file.folder : !file.folder)
        && (!name || file.name === unquote(name[1])))
      return reply({ files: found.map(({ id, name }) => ({ id, name })) })
    }
    if (url.pathname === '/upload/drive/v3/files' && method === 'POST') {
      const body = Buffer.from(await init.body.arrayBuffer())
      const boundary = /boundary=(\S+)/.exec(init.headers['Content-Type'])[1]
      const [, meta, content] = body.toString('latin1').split(`--${boundary}`)
      const metadata = JSON.parse(meta.split('\r\n\r\n')[1])
      const bytes = Buffer.from(content.split('\r\n\r\n').slice(1).join('\r\n\r\n').replace(/\r\n$/, ''), 'latin1')
      return reply({ id: add(metadata.name, metadata.parents[0], { content: bytes }) })
    }
    const upload = /^\/upload\/drive\/v3\/files\/([^/]+)$/.exec(url.pathname)
    if (upload && method === 'PATCH') {
      const file = files.get(upload[1])
      file.versions.push({ id: `${file.id}-v${file.versions.length}`, content: Buffer.from(init.body), modifiedTime: '2026-10-30T00:00:00Z' })
      return reply({ id: file.id })
    }
    const revisions = /^\/drive\/v3\/files\/([^/]+)\/revisions(?:\/([^/]+))?$/.exec(url.pathname)
    if (revisions && method === 'GET') {
      return reply({ revisions: files.get(revisions[1]).versions.map(({ id, modifiedTime, keepForever }) => ({ id, modifiedTime, keepForever })) })
    }
    if (revisions && method === 'PATCH') {
      const version = files.get(revisions[1]).versions.find(entry => entry.id === revisions[2])
      Object.assign(version, JSON.parse(init.body))
      return reply({ id: version.id })
    }
    const single = /^\/drive\/v3\/files\/([^/]+)$/.exec(url.pathname)
    if (single && method === 'GET') {
      const file = files.get(single[1])
      return reply({ md5Checksum: md5(file.versions.at(-1).content), webViewLink: `https://drive.example/${file.id}` })
    }
    return reply({ error: { message: `unexpected ${method} ${url.pathname}` } }, 500)
  }

  const root = add('CVs', null, { folder: true })
  const consolidated = add('4_Consolidated', root, { folder: true })
  const academic = add('1_Academic', root, { folder: true })
  add('SamyabrataRoy_Resume_Consolidated.pdf', consolidated, { content: Buffer.from('%PDF-old') })
  add('SamyabrataRoy - 22F2001443 -  IITM BS.pdf', consolidated, { content: Buffer.from('%PDF-old') })
  return { fetcher, files, calls, root, consolidated, academic, add }
}

const targets = [
  { preset: 'consolidated', folder: '4_Consolidated', name: 'SamyabrataRoy_Resume_Consolidated' },
  { preset: 'consolidated', folder: '4_Consolidated', name: 'SamyabrataRoy - 22F2001443 -  IITM BS' },
  { preset: 'academic-phd', folder: '1_Academic', name: 'SamyabrataRoy_Resume_Academic_PhD' },
]

test('an existing file is updated in place and a missing one is created', async () => {
  const fake = fakeDrive()
  const drive = driveClient('token', fake.fetcher)
  const plans = await planTargets(drive, fake.root, targets)
  assert.deepEqual(plans.map(plan => Boolean(plan.fileId)), [true, true, false])

  const file = pdf('new')
  const results = []
  for (const plan of plans) results.push(await publishTarget(drive, plan, file))
  assert.deepEqual(results.map(result => result.action), ['updated', 'updated', 'created'])
  assert.equal(results[0].fileId, plans[0].fileId, 'an update keeps the file, and so its link')
  const created = fake.files.get(results[2].fileId)
  assert.equal(created.name, 'SamyabrataRoy_Resume_Academic_PhD.pdf')
  assert.equal(created.parent, fake.academic)
  assert.equal(md5(created.versions.at(-1).content), file.md5)
  assert.ok(results.every(result => !result.kept), 'nothing is kept unless asked')
})

test('keep-previous marks the version being replaced before uploading over it', async () => {
  const fake = fakeDrive()
  const drive = driveClient('token', fake.fetcher)
  const [plan] = await planTargets(drive, fake.root, targets.slice(0, 1))
  fake.calls.length = 0
  const result = await publishTarget(drive, plan, pdf('new'), { keepPrevious: true })

  const file = fake.files.get(plan.fileId)
  assert.deepEqual(result.kept, { id: `${plan.fileId}-v0`, modifiedTime: '2026-10-03T05:17:00Z' })
  assert.equal(file.versions[0].keepForever, true)
  assert.equal(file.versions[1].keepForever, undefined, 'the new version is not kept for good')
  assert.ok(fake.calls.indexOf(`PATCH /drive/v3/files/${plan.fileId}/revisions/${plan.fileId}-v0`) < fake.calls.indexOf(`PATCH /upload/drive/v3/files/${plan.fileId}`))

  const [created] = await planTargets(drive, fake.root, targets.slice(2))
  const fresh = await publishTarget(drive, created, pdf('new'), { keepPrevious: true })
  assert.equal(fresh.kept, undefined, 'a new file has no previous version to keep')
})

test('nothing is planned when a folder is missing, doubled, or a name has two files', async () => {
  const fake = fakeDrive()
  const drive = driveClient('token', fake.fetcher)
  await assert.rejects(planTargets(drive, fake.root, [...targets, { preset: 'x', folder: '9_Missing', name: 'X' }]), { code: 'unknown_folder' })
  assert.ok(!fake.calls.some(call => !call.startsWith('GET')), 'planning only reads')

  fake.add('1_Academic', fake.root, { folder: true })
  await assert.rejects(planTargets(drive, fake.root, targets.slice(2)), { code: 'unknown_folder', message: /2 folders named "1_Academic"/ })

  fake.add('SamyabrataRoy_Resume_Consolidated.pdf', fake.consolidated, { content: Buffer.from('%PDF-copy') })
  await assert.rejects(planTargets(drive, fake.root, targets.slice(0, 1)), { code: 'ambiguous_file' })
})

test('a retry after a partial publish updates what the first attempt created', async () => {
  const fake = fakeDrive()
  const drive = driveClient('token', fake.fetcher)
  const [first] = await planTargets(drive, fake.root, targets.slice(2))
  const created = await publishTarget(drive, first, pdf('new'))
  const [again] = await planTargets(drive, fake.root, targets.slice(2))
  assert.equal(again.fileId, created.fileId)
  assert.equal((await publishTarget(drive, again, pdf('new'))).action, 'updated')
  assert.equal([...fake.files.values()].filter(file => file.name === 'SamyabrataRoy_Resume_Academic_PhD.pdf').length, 1)
})

test('names are quoted in Drive queries', async () => {
  const fake = fakeDrive()
  const drive = driveClient('token', fake.fetcher)
  fake.add("Roy's CV \\ draft.pdf", fake.consolidated, { content: Buffer.from('%PDF-x') })
  const [plan] = await planTargets(drive, fake.root, [{ preset: 'odd', folder: '4_Consolidated', name: "Roy's CV \\ draft" }])
  assert.ok(plan.fileId, 'the quote and backslash survive the query')
})

test('a checksum Drive does not match is an error, not a publication', async () => {
  const fake = fakeDrive()
  const drive = driveClient('token', fake.fetcher)
  const [plan] = await planTargets(drive, fake.root, targets.slice(0, 1))
  await assert.rejects(publishTarget(drive, plan, { bytes: pdf('new').bytes, md5: 'not-the-sum' }), { code: 'checksum_mismatch' })
})

test('a refused refresh token says how to reconnect', async () => {
  const refused = async () => new Response(JSON.stringify({ error: 'invalid_grant' }), { status: 400 })
  await assert.rejects(accessToken({ clientId: 'c', clientSecret: 's', refreshToken: 'r' }, refused), error => {
    assert.ok(error instanceof DriveError)
    assert.equal(error.code, 'drive_not_connected')
    assert.match(error.message, /cv:drive-auth/)
    return true
  })
  const granted = async (_url, init) => {
    assert.equal(new URLSearchParams(init.body).get('grant_type'), 'refresh_token')
    return new Response(JSON.stringify({ access_token: 'access' }))
  }
  assert.equal(await accessToken({ clientId: 'c', clientSecret: 's', refreshToken: 'r' }, granted), 'access')
})
