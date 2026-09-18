import type { AccessIdentity, WorkerEnv } from '../types.ts'
import { issueCsrfToken } from '../auth/csrf.ts'
import { publishingPolicy, type SecurityConfig } from '../config.ts'
import { githubConfig, repositoryPolicy, requireGithub, resolveHead } from '../github.ts'
import { json } from '../http.ts'
import { listLogos } from '../media.ts'

export async function apiResponse(request: Request, env: WorkerEnv, config: SecurityConfig, identity: AccessIdentity) {
  const path = new URL(request.url).pathname
  if (path === '/api/session' && request.method === 'GET') {
    return json({ email: identity.email, expiresAt: identity.expiresAt, csrfToken: await issueCsrfToken(identity, config.origin, config.csrfSecret) })
  }
  if (path === '/api/status' && request.method === 'GET') {
    return json({
      authenticated: true,
      publishingTarget: publishingPolicy,
      mode: 'read-only',
      integrations: { github: Boolean(githubConfig(env)), r2: Boolean(env.MEDIA), publishing: false },
    })
  }
  if (path === '/api/repository/head' && request.method === 'GET') {
    // Reads only, and only the ref the policy names. Nothing in the request
    // selects the repository, the branch or the revision.
    const head = await resolveHead(requireGithub(env))
    return json({ ...head, capability: 'read-only', scope: `${repositoryPolicy.owner}/${repositoryPolicy.repo}` })
  }
  if (path === '/api/media/logos' && request.method === 'GET') {
    if (!env.MEDIA) return json({ error: 'r2_not_connected' }, 503)
    // The cursor is the only thing the browser contributes, and it is checked
    // before it reaches storage.
    return json(await listLogos(env.MEDIA, new URL(request.url).searchParams.get('cursor') ?? undefined))
  }
  return json({ error: 'not_found' }, 404)
}
