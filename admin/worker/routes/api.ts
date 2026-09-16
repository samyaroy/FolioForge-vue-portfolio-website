import type { AccessIdentity, WorkerEnv } from '../types.ts'
import { issueCsrfToken } from '../auth/csrf.ts'
import { publishingPolicy } from '../config.ts'
import { json } from '../http.ts'

export async function apiResponse(request: Request, env: WorkerEnv, identity: AccessIdentity) {
  const path = new URL(request.url).pathname
  if (path === '/api/session' && request.method === 'GET') {
    return json({ email: identity.email, expiresAt: identity.expiresAt, csrfToken: await issueCsrfToken(identity, env.ADMIN_ORIGIN, env.CSRF_SECRET) })
  }
  if (path === '/api/status' && request.method === 'GET') {
    return json({ authenticated: true, publishingTarget: publishingPolicy, mode: 'read-only', integrations: { github: false, r2: false, publishing: false } })
  }
  if (path === '/api/media/logos' && request.method === 'GET') return json({ error: 'r2_not_connected' }, 503)
  return json({ error: 'not_found' }, 404)
}
