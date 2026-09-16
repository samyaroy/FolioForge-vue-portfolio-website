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
  ACCESS_AUDIENCE: 'test-audience',
  ACCESS_OWNER_EMAIL: 'owner@example.com',
  CSRF_SECRET: 'test-only-secret-with-at-least-32-characters',
  ASSETS: { fetch: async () => new Response('protected asset') },
}

async function accessToken(overrides = {}, key = privateKey) {
  const now = Math.floor(Date.now() / 1000)
  return new SignJWT({ sub: 'owner-subject', email: env.ACCESS_OWNER_EMAIL, iss: issuer, aud: env.ACCESS_AUDIENCE, iat: now, exp: now + 3600, ...overrides }).setProtectedHeader({ alg: 'RS256', kid: 'test-key' }).sign(key)
}

function request(path = '/', token, options = {}) {
  const headers = new Headers(options.headers)
  if (token) headers.set('Cf-Access-Jwt-Assertion', token)
  return new Request(`${origin}${path}`, { ...options, headers })
}

test('missing configuration fails closed before touching assets', async () => {
  let calls = 0
  const response = await worker.fetch(request('/'), { ...env, ACCESS_AUDIENCE: '', ASSETS: { fetch: async () => { calls++; return new Response('unsafe') } } })
  assert.equal(response.status, 503)
  assert.equal(calls, 0)
})

for (const path of ['/', '/assets/app.js', '/assets/app.css', '/profile-icon.png', '/portfolio/pages/home/education', '/api/session', '/api/media/logos']) {
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
  assert.deepEqual(status.integrations, { github: false, r2: false, publishing: false })
})

test('unimplemented storage and generic file APIs do not expose data', async () => {
  const token = await accessToken()
  assert.equal((await worker.fetch(request('/api/media/logos', token), env)).status, 503)
  assert.equal((await worker.fetch(request('/api/file?path=.env', token), env)).status, 404)
})

test('security configuration rejects unsafe issuers and origins', () => {
  for (const ACCESS_ISSUER of ['http://test-team.cloudflareaccess.com', 'https://test-team.cloudflareaccess.com.attacker.com', 'https://test-team.cloudflareaccess.com/path']) assert.throws(() => securityConfig({ ...env, ACCESS_ISSUER }))
  assert.throws(() => securityConfig({ ...env, ADMIN_ORIGIN: `${origin}/path` }))
})

test('Wrangler protects assets and disables public alternative entry points', async () => {
  const { readFile } = await import('node:fs/promises')
  const config = JSON.parse(await readFile(new URL('../../wrangler.jsonc', import.meta.url), 'utf8'))
  assert.equal(config.assets.run_worker_first, true)
  assert.equal(config.workers_dev, false)
  assert.equal(config.preview_urls, false)
  assert.equal(config.routes[0].pattern, 'admin.samyabrata.codeium.xyz')
})
