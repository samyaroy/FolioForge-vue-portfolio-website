import { importPKCS8, SignJWT } from 'jose'
import { HttpError } from './http.ts'
import { publishingPolicy } from './config.ts'
import type { WorkerEnv } from './types.ts'

/**
 * The one repository and the one ref this admin may read. They are written here
 * rather than taken from a request: the browser names no owner, repository,
 * branch or path, so nothing it sends can aim the Worker somewhere else.
 */
export const repositoryPolicy = {
  owner: 'samyaroy',
  repo: 'FolioForge-vue-portfolio-website',
  branch: publishingPolicy.branch,
  ref: publishingPolicy.ref,
} as const

const GITHUB_API = 'https://api.github.com'
const REQUEST_TIMEOUT_MS = 10_000
// GitHub refuses an app JWT that claims more than ten minutes.
const APP_JWT_LIFETIME_S = 540

export type GithubConfig = { appId: string; installationId: string; privateKey: string }

/**
 * Absent or misshapen settings mean "not connected", not an error: the admin
 * ran without GitHub before this existed and must keep running without it.
 */
export function githubConfig(env: WorkerEnv): GithubConfig | undefined {
  const appId = env.GITHUB_APP_ID ?? ''
  const installationId = env.GITHUB_INSTALLATION_ID ?? ''
  // A secret pasted through a form often arrives with escaped newlines; a PEM
  // is worthless without real ones.
  const privateKey = (env.GITHUB_PRIVATE_KEY ?? '').replace(/\\n/g, '\n').trim()
  if (!/^\d{1,20}$/.test(appId) || !/^\d{1,20}$/.test(installationId) || !privateKey) return undefined
  return { appId, installationId, privateKey }
}

export function requireGithub(env: WorkerEnv): GithubConfig {
  const config = githubConfig(env)
  if (!config) throw new HttpError(503, 'github_not_connected')
  return config
}

async function appJwt(config: GithubConfig) {
  // GitHub hands out PKCS#1 ("BEGIN RSA PRIVATE KEY") by default, which WebCrypto
  // cannot import. Say so plainly instead of failing as a signature error.
  if (config.privateKey.includes('BEGIN RSA PRIVATE KEY')) throw new HttpError(503, 'github_not_connected', 'private_key_is_pkcs1')
  if (!config.privateKey.includes('BEGIN PRIVATE KEY')) throw new HttpError(503, 'github_not_connected', 'private_key_not_pem')
  const key = await importPKCS8(config.privateKey, 'RS256')
  const now = Math.floor(Date.now() / 1000)
  return new SignJWT({})
    .setProtectedHeader({ alg: 'RS256' })
    .setIssuer(config.appId)
    .setIssuedAt(now - 30)
    .setExpirationTime(now + APP_JWT_LIFETIME_S)
    .sign(key)
}

/**
 * One authenticated call to the GitHub API. `expected` maps particular statuses
 * to errors worth naming — a 409 on a write means someone else moved the file,
 * which is a conflict to resolve rather than an outage.
 */
export async function githubRequest(config: GithubConfig, path: string, init: RequestInit = {}, expected: Record<number, HttpError> = {}, fetchImpl: typeof fetch = fetch): Promise<unknown> {
  const token = await installationToken(config, fetchImpl)
  const response = await fetchImpl(`${GITHUB_API}${path}`, {
    ...init,
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    headers: {
      accept: 'application/vnd.github+json',
      authorization: `Bearer ${token}`,
      'content-type': 'application/json',
      'user-agent': 'folioforge-admin-beta',
      'x-github-api-version': '2022-11-28',
    },
  }).catch(() => { throw new HttpError(502, 'github_unavailable', 'request_failed') })
  if (expected[response.status]) throw expected[response.status]
  if (response.status === 403 || response.status === 404) {
    // A write with only Contents:read reads as 403 or 404 depending on the
    // route, and both mean the same thing to whoever has to fix it.
    throw new HttpError(403, 'github_permission_denied', `status_${response.status}`)
  }
  if (!response.ok) throw new HttpError(502, 'github_unavailable', `status_${response.status}`)
  if (response.status === 204) return null
  return response.json()
}

export type InstallationAccess = { contents: string; canWrite: boolean }

/** What the installation is actually allowed to do, as GitHub reports it. */
export async function installationAccess(config: GithubConfig, fetchImpl: typeof fetch = fetch): Promise<InstallationAccess> {
  await installationToken(config, fetchImpl)
  const contents = cachedPermissions?.contents === 'write' ? 'write' : cachedPermissions?.contents === 'read' ? 'read' : 'none'
  return { contents, canWrite: contents === 'write' }
}

async function githubFetch(url: string, token: string, fetchImpl: typeof fetch, init: RequestInit = {}) {
  let response: Response
  try {
    response = await fetchImpl(url, {
      ...init,
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      headers: {
        accept: 'application/vnd.github+json',
        authorization: `Bearer ${token}`,
        'user-agent': 'folioforge-admin-beta',
        'x-github-api-version': '2022-11-28',
      },
    })
  } catch {
    throw new HttpError(502, 'github_unavailable', 'request_failed')
  }
  // The status is worth logging; the body may quote the request and is not.
  if (!response.ok) throw new HttpError(502, 'github_unavailable', `status_${response.status}`)
  return response
}

// One installation token serves every request in this isolate until it nears
// expiry. It is a credential: it is never logged, never returned to the browser.
let cachedToken: { value: string; expiresAt: number; installationId: string } | undefined
// GitHub reports what the installation may do when it issues the token, so the
// admin can say "read-only" rather than discovering it at the moment of a write.
let cachedPermissions: Record<string, string> | undefined

export async function installationToken(config: GithubConfig, fetchImpl: typeof fetch = fetch) {
  const fresh = cachedToken && cachedToken.installationId === config.installationId && cachedToken.expiresAt - 60_000 > Date.now()
  if (fresh && cachedToken) return cachedToken.value
  const response = await githubFetch(`${GITHUB_API}/app/installations/${config.installationId}/access_tokens`, await appJwt(config), fetchImpl, { method: 'POST' })
  const body: unknown = await response.json()
  const token = body && typeof body === 'object' && 'token' in body ? (body as { token: unknown }).token : undefined
  const expiresAt = body && typeof body === 'object' && 'expires_at' in body ? (body as { expires_at: unknown }).expires_at : undefined
  if (typeof token !== 'string' || !token) throw new HttpError(502, 'github_unavailable', 'no_installation_token')
  const parsedExpiry = typeof expiresAt === 'string' ? Date.parse(expiresAt) : Number.NaN
  const permissions = body && typeof body === 'object' ? (body as { permissions?: unknown }).permissions : undefined
  cachedPermissions = permissions && typeof permissions === 'object' ? permissions as Record<string, string> : undefined
  cachedToken = { value: token, expiresAt: Number.isNaN(parsedExpiry) ? Date.now() + 300_000 : parsedExpiry, installationId: config.installationId }
  return token
}

/** Forget the cached credential. Used by tests; harmless in production. */
export function resetInstallationToken() {
  cachedToken = undefined
  cachedPermissions = undefined
}

export type RepositoryHead = { owner: string; repo: string; branch: string; ref: string; sha: string }

/**
 * Resolve the branch this admin is allowed to publish to, and refuse anything
 * that answers for a different ref. The comparison matters: it is the check the
 * plan requires before a candidate is ever built on top of this revision.
 */
export async function resolveHead(config: GithubConfig, fetchImpl: typeof fetch = fetch): Promise<RepositoryHead> {
  const { owner, repo, branch, ref } = repositoryPolicy
  const token = await installationToken(config, fetchImpl)
  const response = await githubFetch(`${GITHUB_API}/repos/${owner}/${repo}/git/ref/heads/${branch}`, token, fetchImpl)
  const body: unknown = await response.json()
  if (!body || typeof body !== 'object') throw new HttpError(502, 'github_unavailable', 'unreadable_ref')
  const answeredRef = (body as { ref?: unknown }).ref
  const sha = ((body as { object?: { sha?: unknown } }).object ?? {}).sha
  if (answeredRef !== ref) throw new HttpError(502, 'github_ref_mismatch', 'unexpected_ref')
  if (typeof sha !== 'string' || !/^[a-f0-9]{40}$/.test(sha)) throw new HttpError(502, 'github_unavailable', 'unreadable_sha')
  return { owner, repo, branch, ref, sha }
}
