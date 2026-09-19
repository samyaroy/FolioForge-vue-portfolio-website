import { HttpError } from '../http.ts'
import { githubRequest, repositoryPolicy, type GithubConfig } from '../github.ts'
import { isWritablePath } from './registry.ts'

export type RepositoryFile = { path: string; text: string; sha: string }

function decodeBase64(value: string): string {
  const binary = atob(value.replace(/\n/g, ''))
  return new TextDecoder().decode(Uint8Array.from(binary, character => character.charCodeAt(0)))
}

function encodeBase64(value: string): string {
  const bytes = new TextEncoder().encode(value)
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary)
}

/** Read one allowlisted file at the tip of the publishing branch. */
export async function readFile(config: GithubConfig, path: string): Promise<RepositoryFile> {
  if (!isWritablePath(path)) throw new HttpError(403, 'path_not_allowed')
  const { owner, repo, branch } = repositoryPolicy
  const body = await githubRequest(config, `/repos/${owner}/${repo}/contents/${path}?ref=${branch}`)
  if (!body || typeof body !== 'object') throw new HttpError(502, 'github_unavailable', 'unreadable_file')
  const { content, encoding, sha, type } = body as Record<string, unknown>
  if (type !== 'file' || encoding !== 'base64' || typeof content !== 'string' || typeof sha !== 'string') {
    throw new HttpError(502, 'github_unavailable', 'unexpected_file_shape')
  }
  return { path, text: decodeBase64(content), sha }
}

/**
 * Replace one allowlisted file. `sha` is the revision the edit was made against:
 * GitHub refuses the write if the file has moved on since, which is what turns a
 * concurrent edit into a conflict instead of a silent overwrite.
 */
export async function writeFile(config: GithubConfig, file: RepositoryFile, message: string): Promise<{ commit: string }> {
  if (!isWritablePath(file.path)) throw new HttpError(403, 'path_not_allowed')
  const { owner, repo, branch } = repositoryPolicy
  const body = await githubRequest(config, `/repos/${owner}/${repo}/contents/${file.path}`, {
    method: 'PUT',
    body: JSON.stringify({
      message,
      content: encodeBase64(file.text),
      sha: file.sha,
      branch,
    }),
  }, { 409: new HttpError(409, 'content_conflict', 'file_changed'), 422: new HttpError(409, 'content_conflict', 'sha_rejected') })
  const commit = body && typeof body === 'object' ? (body as { commit?: { sha?: unknown } }).commit?.sha : undefined
  if (typeof commit !== 'string') throw new HttpError(502, 'github_unavailable', 'no_commit_sha')
  return { commit }
}
