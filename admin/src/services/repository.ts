export type RepositoryHead = {
  owner: string
  repo: string
  branch: string
  ref: string
  sha: string
  /** What the GitHub App installation may do, as GitHub reports it. */
  contents: 'read' | 'write' | 'none'
  canWrite: boolean
}

// The ref the admin is allowed to publish to. The Worker owns this decision;
// checking it again here means a surprising answer shows as a failure rather
// than quietly becoming what the sidebar reports.
const EXPECTED_REF = 'refs/heads/V1'

export async function fetchRepositoryHead(signal: AbortSignal): Promise<RepositoryHead> {
  const response = await fetch('/api/repository/head', { signal, credentials: 'same-origin', headers: { Accept: 'application/json' } })
  if (!response.ok || !response.headers.get('content-type')?.includes('application/json')) throw new Error('GitHub is not connected.')
  const body: unknown = await response.json()
  if (!body || typeof body !== 'object') throw new Error('Invalid repository response.')
  const { owner, repo, branch, ref, sha } = body as Record<string, unknown>
  if ([owner, repo, branch].some(value => typeof value !== 'string' || !value)) throw new Error('Invalid repository response.')
  if (typeof sha !== 'string' || !/^[a-f0-9]{40}$/.test(sha)) throw new Error('Invalid repository revision.')
  if (ref !== EXPECTED_REF) throw new Error('Unexpected publishing ref.')
  const { contents, canWrite } = body as Record<string, unknown>
  const access = contents === 'write' || contents === 'read' ? contents : 'none'
  return { owner: owner as string, repo: repo as string, branch: branch as string, ref, sha, contents: access, canWrite: canWrite === true }
}
