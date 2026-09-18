import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createLocalJWKSet, exportJWK, generateKeyPair, SignJWT } from 'jose'
import { createAdminWorker } from '../index.ts'
import { securityConfig } from '../config.ts'

const { publicKey, privateKey } = await generateKeyPair('RS256')
const publicJwk = { ...await exportJWK(publicKey), kid: 'test-key', alg: 'RS256' }
const worker = createAdminWorker(createLocalJWKSet({ keys: [publicJwk] }))
const origin = 'https://admin.samyabrata.codeium.xyz'
const issuer = 'https://test-team.cloudflareaccess.com'
const env = {
  ADMIN_ORIGIN: origin,
  ACCESS_ISSUER: issuer,
  ACCESS_AUDIENCE: 'a'.repeat(64),
  ACCESS_OWNER_EMAIL: 'owner@example.com',
  CSRF_SECRET: 'test-only-secret-with-at-least-32-characters',
  ASSETS: { fetch: async () => new Response('protected asset') },
}

// Denials are logged, so collect them here instead of over the test output, and
// let the log-contract test read what the Worker actually wrote.
const denials = []
console.warn = entry => denials.push(JSON.parse(entry))

async function accessToken(overrides = {}, key = privateKey) {
  const now = Math.floor(Date.now() / 1000)
  return new SignJWT({ sub: 'owner-subject', email: env.ACCESS_OWNER_EMAIL, iss: issuer, aud: env.ACCESS_AUDIENCE, iat: now, exp: now + 3600, ...overrides }).setProtectedHeader({ alg: 'RS256', kid: 'test-key' }).sign(key)
}

function request(path = '/', token, options = {}) {
  const headers = new Headers(options.headers)
  if (token) headers.set('Cf-Access-Jwt-Assertion', token)
  return new Request(`${origin}${path}`, { ...options, headers })
}

// A fresh deployment has no secrets installed at all, so absent must fail the
// same way blank does, and neither may reach an asset.
for (const [name, broken] of [
  ['blank audience', { ACCESS_AUDIENCE: '' }],
  ['absent audience', { ACCESS_AUDIENCE: undefined }],
  ['absent issuer', { ACCESS_ISSUER: undefined }],
  ['absent owner', { ACCESS_OWNER_EMAIL: undefined }],
  ['absent CSRF secret', { CSRF_SECRET: undefined }],
  ['short CSRF secret', { CSRF_SECRET: 'too-short' }],
]) {
  test(`${name} fails closed before touching assets`, async () => {
    let calls = 0
    const response = await worker.fetch(request('/'), { ...env, ...broken, ASSETS: { fetch: async () => { calls++; return new Response('unsafe') } } })
    assert.equal(response.status, 503)
    assert.equal(calls, 0)
  })
}

for (const path of ['/', '/assets/app.js', '/assets/app.css', '/profile-icon.png', '/portfolio/pages/home/education', '/api/session', '/api/media/logos', '/api/repository/head']) {
  test(`unauthenticated ${path} is denied`, async () => {
    const response = await worker.fetch(request(path), env)
    assert.equal(response.status, 401)
    assert.equal(response.headers.get('cache-control'), 'no-store')
    assert.equal(response.headers.has('access-control-allow-origin'), false)
  })
}

for (const [name, overrides] of [
  ['expired', { exp: 1 }],
  ['wrong audience', { aud: 'wrong-app' }],
  ['wrong issuer', { iss: 'https://wrong.cloudflareaccess.com' }],
  ['future nbf', { nbf: Math.floor(Date.now() / 1000) + 3600 }],
  ['invalid nbf', { nbf: 'tomorrow' }],
  ['missing expiry', { exp: undefined }],
  ['missing identity', { email: undefined }],
]) {
  test(`${name} token is denied`, async () => {
    assert.equal((await worker.fetch(request('/', await accessToken(overrides)), env)).status, 401)
  })
}

test('unexpected identity cannot use the owner email header to gain access', async () => {
  const token = await accessToken({ email: 'attacker@example.com' })
  const response = await worker.fetch(request('/', token, { headers: { 'Cf-Access-Authenticated-User-Email': env.ACCESS_OWNER_EMAIL } }), env)
  assert.equal(response.status, 403)
})

test('modified signature is rejected', async () => {
  const other = await generateKeyPair('RS256')
  assert.equal((await worker.fetch(request('/', await accessToken({}, other.privateKey)), env)).status, 401)
})

test('valid owner token can read protected assets', async () => {
  const response = await worker.fetch(request('/assets/app.js', await accessToken()), env)
  assert.equal(response.status, 200)
  assert.equal(await response.text(), 'protected asset')
  assert.match(response.headers.get('content-security-policy'), /frame-ancestors 'none'/)
})

test('alternate Worker hostname is denied even with a valid token', async () => {
  const response = await worker.fetch(new Request('https://folioforge-admin-beta.example.workers.dev/', { headers: { 'Cf-Access-Jwt-Assertion': await accessToken() } }), env)
  assert.equal(response.status, 403)
})

test('session response contains a token bound to the verified session', async () => {
  const token = await accessToken()
  const session = await (await worker.fetch(request('/api/session', token), env)).json()
  assert.equal(session.email, env.ACCESS_OWNER_EMAIL)
  assert.match(session.csrfToken, /^[a-f0-9]{64}$/)
  assert.equal('token' in session, false)
})

test('mutations require exact Origin and session-bound CSRF', async () => {
  const token = await accessToken()
  const { csrfToken } = await (await worker.fetch(request('/api/session', token), env)).json()
  for (const method of ['POST', 'PUT', 'PATCH', 'DELETE']) {
    assert.equal((await worker.fetch(request('/api/drafts/example', token, { method }), env)).status, 403)
    assert.equal((await worker.fetch(request('/api/drafts/example', token, { method, headers: { Origin: origin } }), env)).status, 403)
    assert.equal((await worker.fetch(request('/api/drafts/example', token, { method, headers: { Origin: `${origin}.attacker.com`, 'X-CSRF-Token': csrfToken } }), env)).status, 403)
    assert.equal((await worker.fetch(request('/api/drafts/example', token, { method, headers: { Origin: origin, 'X-CSRF-Token': '0'.repeat(64) } }), env)).status, 403)
    assert.equal((await worker.fetch(request('/api/drafts/example', token, { method, headers: { Origin: origin, 'X-CSRF-Token': csrfToken } }), env)).status, 404)
  }
})

test('CSRF from another authenticated session cannot be replayed', async () => {
  const token = await accessToken({ nonce: 'first-session' })
  const { csrfToken } = await (await worker.fetch(request('/api/session', token), env)).json()
  const other = await accessToken({ nonce: 'second-session' })
  assert.equal((await worker.fetch(request('/api/drafts/example', other, { method: 'POST', headers: { Origin: origin, 'X-CSRF-Token': csrfToken } }), env)).status, 403)
})

test('status is fixed to V1 and integrations remain disabled', async () => {
  const response = await worker.fetch(request('/api/status?branch=main', await accessToken()), env)
  const status = await response.json()
  assert.equal(status.publishingTarget.ref, 'refs/heads/V1')
  assert.deepEqual(status.integrations, { github: false, r2: false, uploads: false, publishing: false })
})

test('unimplemented storage and generic file APIs do not expose data', async () => {
  const token = await accessToken()
  assert.equal((await worker.fetch(request('/api/media/logos', token), env)).status, 503)
  assert.equal((await worker.fetch(request('/api/file?path=.env', token), env)).status, 404)
})

test('an upload cannot be stored while no drafts bucket is bound', async () => {
  const token = await accessToken()
  const { csrfToken } = await (await worker.fetch(request('/api/session', token), env)).json()
  const response = await worker.fetch(request('/api/media/uploads', token, {
    method: 'POST',
    headers: { Origin: origin, 'X-CSRF-Token': csrfToken, 'Content-Type': 'image/png' },
    body: new Uint8Array([0x89, 0x50, 0x4e, 0x47]),
  }), env)
  assert.equal(response.status, 503)
  assert.deepEqual(await response.json(), { error: 'uploads_not_connected' })
})

test('an upload without Origin and CSRF is refused before any body is read', async () => {
  const token = await accessToken()
  const response = await worker.fetch(request('/api/media/uploads', token, { method: 'POST', body: new Uint8Array([1, 2, 3]) }), env)
  assert.equal(response.status, 403)
})

test('an unconnected GitHub reports itself and reaches no provider', async () => {
  const token = await accessToken()
  const status = await (await worker.fetch(request('/api/status', token), env)).json()
  assert.equal(status.integrations.github, false)
  const head = await worker.fetch(request('/api/repository/head', token), env)
  assert.equal(head.status, 503)
  assert.deepEqual(await head.json(), { error: 'github_not_connected' })
})

test('the browser cannot name a repository, branch or revision to read', async () => {
  const token = await accessToken()
  // With credentials installed these would be the levers worth pulling; without
  // them the route still refuses, and no query string is ever read.
  for (const query of ['?repo=attacker/evil', '?ref=refs/heads/main', '?branch=main', '?owner=attacker']) {
    const response = await worker.fetch(request(`/api/repository/head${query}`, token), env)
    assert.equal(response.status, 503)
  }
})

test('security configuration rejects unsafe issuers and origins', () => {
  for (const ACCESS_ISSUER of ['http://test-team.cloudflareaccess.com', 'https://test-team.cloudflareaccess.com.attacker.com', 'https://test-team.cloudflareaccess.com/path']) assert.throws(() => securityConfig({ ...env, ACCESS_ISSUER }))
  assert.throws(() => securityConfig({ ...env, ADMIN_ORIGIN: `${origin}/path` }))
})

test('a protected page may load nothing from a third party', async () => {
  const response = await worker.fetch(request('/', await accessToken()), env)
  const policy = response.headers.get('content-security-policy')
  // `img-src https:` is a scheme, not a host; no directive may name an origin.
  assert.equal(/https?:\/\//.test(policy), false, `external host in ${policy}`)
  for (const directive of ["script-src 'self'", "font-src 'self'", "style-src 'self' 'unsafe-inline'", "connect-src 'self'", "frame-ancestors 'none'"]) {
    assert.ok(policy.includes(directive), `missing ${directive}`)
  }
})

test('audience must be an Access AUD tag, not an account ID or a label', () => {
  // The account ID is 32 hex characters and is the value most easily pasted by
  // mistake; it must not be mistaken for an application audience.
  for (const ACCESS_AUDIENCE of ['686674671d835060178a08196eb2f59e', 'test-audience', `${'a'.repeat(63)}z`, 'A'.repeat(64), ` ${'a'.repeat(64)}`]) {
    assert.throws(() => securityConfig({ ...env, ACCESS_AUDIENCE }), `expected ${ACCESS_AUDIENCE} to be rejected`)
  }
  assert.equal(securityConfig(env).audience, env.ACCESS_AUDIENCE)
})

test('the session response hands out no long-lived secret', async () => {
  const body = await (await worker.fetch(request('/api/session', await accessToken()), env)).text()
  assert.equal(body.includes(env.CSRF_SECRET), false)
  assert.equal(body.includes('cloudflareaccess.com'), false)
})

test('a denial is logged without the token that was presented', async () => {
  const token = await accessToken({ exp: 1 })
  denials.length = 0
  await worker.fetch(request('/api/session?cursor=secret-value', token), env)
  const [entry] = denials
  assert.equal(entry.event, 'admin_request_denied')
  assert.equal(entry.status, 401)
  assert.equal(entry.code, 'invalid_access_token')
  assert.equal(entry.reason, 'JWTExpired')
  assert.equal(entry.path, '/api/session')
  const written = JSON.stringify(entry)
  for (const secret of [token, env.CSRF_SECRET, env.ACCESS_OWNER_EMAIL, 'secret-value']) assert.equal(written.includes(secret), false)
})

test('Wrangler protects assets and disables public alternative entry points', async () => {
  const { readFile } = await import('node:fs/promises')
  const config = JSON.parse(await readFile(new URL('../../wrangler.jsonc', import.meta.url), 'utf8'))
  assert.equal(config.assets.run_worker_first, true)
  assert.equal(config.workers_dev, false)
  assert.equal(config.preview_urls, false)
  assert.equal(config.routes[0].pattern, 'admin.samyabrata.codeium.xyz')
  assert.equal(config.observability.enabled, true)
  // This repository is public. The owner's identity and the Access application's
  // audience are Worker secrets, so nothing here may name them.
  assert.deepEqual(Object.keys(config.vars), ['ADMIN_ORIGIN'])
  assert.equal(JSON.stringify(config).includes('@'), false)
})
