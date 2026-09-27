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

/**
 * Commit several files as one revision, using the Git data API rather than the
 * per-file contents endpoint. A generated file and the source it came from have
 * to land together, and the ref update is non-forced, so a branch that moved
 * underneath the edit fails rather than losing the other commit.
 */
export async function commitFiles(
  config: GithubConfig,
  files: { path: string; text: string }[],
  message: string,
  allowed: (path: string) => boolean,
): Promise<{ commit: string }> {
  for (const file of files) {
    if (!allowed(file.path)) throw new HttpError(403, 'path_not_allowed', file.path)
  }
  const { owner, repo, branch, ref } = repositoryPolicy
  const base = `/repos/${owner}/${repo}`

  const head = await githubRequest(config, `${base}/git/ref/heads/${branch}`)
  const headSha = (head as { object?: { sha?: unknown } })?.object?.sha
  const answeredRef = (head as { ref?: unknown })?.ref
  if (answeredRef !== ref) throw new HttpError(502, 'github_ref_mismatch', 'unexpected_ref')
  if (typeof headSha !== 'string') throw new HttpError(502, 'github_unavailable', 'unreadable_head')

  const commitBody = await githubRequest(config, `${base}/git/commits/${headSha}`)
  const baseTree = (commitBody as { tree?: { sha?: unknown } })?.tree?.sha
  if (typeof baseTree !== 'string') throw new HttpError(502, 'github_unavailable', 'unreadable_tree')

  const treeBody = await githubRequest(config, `${base}/git/trees`, {
    method: 'POST',
    body: JSON.stringify({
      base_tree: baseTree,
      tree: files.map(file => ({ path: file.path, mode: '100644', type: 'blob', content: file.text })),
    }),
  })
  const treeSha = (treeBody as { sha?: unknown })?.sha
  if (typeof treeSha !== 'string') throw new HttpError(502, 'github_unavailable', 'no_tree_sha')

  const newCommit = await githubRequest(config, `${base}/git/commits`, {
    method: 'POST',
    body: JSON.stringify({ message, tree: treeSha, parents: [headSha] }),
  })
  const commit = (newCommit as { sha?: unknown })?.sha
  if (typeof commit !== 'string') throw new HttpError(502, 'github_unavailable', 'no_commit_sha')

  await githubRequest(config, `${base}/git/refs/heads/${branch}`, {
    method: 'PATCH',
    body: JSON.stringify({ sha: commit, force: false }),
  }, { 422: new HttpError(409, 'content_conflict', 'branch_moved') })

  return { commit }
}
