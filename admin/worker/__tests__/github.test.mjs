import assert from 'node:assert/strict'
import { test } from 'node:test'
import { decodeJwt, decodeProtectedHeader, exportPKCS8, generateKeyPair } from 'jose'
import { githubConfig, installationToken, repositoryPolicy, requireGithub, resetInstallationToken, resolveHead } from '../github.ts'

const { privateKey } = await generateKeyPair('RS256', { extractable: true })
const pkcs8 = await exportPKCS8(privateKey)
const config = { appId: '123456', installationId: '78901234', privateKey: pkcs8 }
const HEAD_SHA = 'a'.repeat(40)
const INSTALLATION_TOKEN = 'ghs_installation_token_value'

// A stand-in for GitHub that records what it was asked, so a test can assert on
// the request the Worker actually made rather than on its own expectations.
function githubStub(overrides = {}) {
  const calls = []
  const fetchImpl = async (url, init = {}) => {
    calls.push({ url, init, authorization: new Headers(init.headers).get('authorization') })
    if (url.includes('/access_tokens')) {
      if (overrides.tokenStatus) return new Response('{}', { status: overrides.tokenStatus })
      return Response.json({ token: INSTALLATION_TOKEN, expires_at: new Date(Date.now() + 3600_000).toISOString() })
    }
    if (url.includes('/git/ref/')) {
      if (overrides.refStatus) return new Response('{}', { status: overrides.refStatus })
      return Response.json(overrides.refBody ?? { ref: 'refs/heads/V1', object: { sha: HEAD_SHA, type: 'commit' } })
    }
    throw new Error(`unexpected request to ${url}`)
  }
  return { fetchImpl, calls }
}

test('absent or misshapen credentials read as not connected, never as an error', () => {
  assert.equal(githubConfig({}), undefined)
  assert.equal(githubConfig({ GITHUB_APP_ID: '123', GITHUB_INSTALLATION_ID: '456' }), undefined)
  assert.equal(githubConfig({ GITHUB_APP_ID: 'not-a-number', GITHUB_INSTALLATION_ID: '456', GITHUB_PRIVATE_KEY: pkcs8 }), undefined)
  assert.throws(() => requireGithub({}), error => error.status === 503 && error.code === 'github_not_connected')
})

test('a private key pasted with escaped newlines is still usable', () => {
  const escaped = pkcs8.replace(/\n/g, '\\n')
  const resolved = githubConfig({ GITHUB_APP_ID: '1', GITHUB_INSTALLATION_ID: '2', GITHUB_PRIVATE_KEY: escaped })
  assert.equal(resolved.privateKey, pkcs8.trim())
})

test('the format GitHub hands out by default is named, not left as a signature failure', async () => {
  resetInstallationToken()
  const pkcs1 = { ...config, privateKey: '-----BEGIN RSA PRIVATE KEY-----\nabc\n-----END RSA PRIVATE KEY-----' }
  await assert.rejects(installationToken(pkcs1, githubStub().fetchImpl), error => error.reason === 'private_key_is_pkcs1')
})

test('the app authenticates with a short-lived RS256 assertion issued by the app id', async () => {
  resetInstallationToken()
  const { fetchImpl, calls } = githubStub()
  await installationToken(config, fetchImpl)
  const assertion = calls[0].authorization.replace('Bearer ', '')
  assert.equal(decodeProtectedHeader(assertion).alg, 'RS256')
  const claims = decodeJwt(assertion)
  assert.equal(claims.iss, config.appId)
  // GitHub rejects anything claiming more than ten minutes.
  assert.ok(claims.exp - claims.iat <= 600, `assertion lived ${claims.exp - claims.iat}s`)
})

test('the installation token is reused within its life rather than minted per request', async () => {
  resetInstallationToken()
  const { fetchImpl, calls } = githubStub()
  await resolveHead(config, fetchImpl)
  await resolveHead(config, fetchImpl)
  assert.equal(calls.filter(call => call.url.includes('/access_tokens')).length, 1)
  assert.equal(calls.filter(call => call.url.includes('/git/ref/')).length, 2)
})

test('the head is read from the policy repository and ref, with the installation token', async () => {
  resetInstallationToken()
  const { fetchImpl, calls } = githubStub()
  const head = await resolveHead(config, fetchImpl)
  assert.deepEqual(head, { owner: repositoryPolicy.owner, repo: repositoryPolicy.repo, branch: 'V1', ref: 'refs/heads/V1', sha: HEAD_SHA })
  const refCall = calls.find(call => call.url.includes('/git/ref/'))
  assert.equal(refCall.url, `https://api.github.com/repos/${repositoryPolicy.owner}/${repositoryPolicy.repo}/git/ref/heads/V1`)
  assert.equal(refCall.authorization, `Bearer ${INSTALLATION_TOKEN}`)
})

test('the policy names V1 and nothing else', () => {
  assert.equal(repositoryPolicy.ref, 'refs/heads/V1')
  assert.equal(repositoryPolicy.branch, 'V1')
})

// The check the plan requires before anything is built on this revision: a
// provider answering for another branch must not be taken at its word.
for (const [name, refBody] of [
  ['main', { ref: 'refs/heads/main', object: { sha: HEAD_SHA } }],
  ['a tag', { ref: 'refs/tags/V1', object: { sha: HEAD_SHA } }],
  ['a lookalike', { ref: 'refs/heads/V1-attacker', object: { sha: HEAD_SHA } }],
  ['nothing', {}],
]) {
  test(`a ref response naming ${name} is refused`, async () => {
    resetInstallationToken()
    await assert.rejects(resolveHead(config, githubStub({ refBody }).fetchImpl), error => error.code === 'github_ref_mismatch')
  })
}

test('an unusable revision is refused rather than passed along', async () => {
  resetInstallationToken()
  await assert.rejects(
    resolveHead(config, githubStub({ refBody: { ref: 'refs/heads/V1', object: { sha: 'not-a-sha' } } }).fetchImpl),
    error => error.reason === 'unreadable_sha',
  )
})

test('a provider failure surfaces as a status, never as its response body', async () => {
  resetInstallationToken()
  await assert.rejects(resolveHead(config, githubStub({ refStatus: 404 }).fetchImpl), error => error.status === 502 && error.reason === 'status_404')
  resetInstallationToken()
  await assert.rejects(installationToken(config, githubStub({ tokenStatus: 401 }).fetchImpl), error => error.status === 502 && error.reason === 'status_401')
})
