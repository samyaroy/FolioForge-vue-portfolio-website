import type { AccessIdentity, WorkerEnv } from '../types.ts'
import { issueCsrfToken } from '../auth/csrf.ts'
import { publishingPolicy, type SecurityConfig } from '../config.ts'
import { githubConfig, repositoryPolicy, requireGithub, resolveHead } from '../github.ts'
import { json } from '../http.ts'
import { archiveLogo, listLogos, storeLogo } from '../media.ts'
import { listDrafts, readDraft, storeDraft } from '../drafts.ts'
import { imagePolicy } from '../images.ts'

const DRAFT_ROUTE = '/api/media/drafts/'
const LOGO_ROUTE = '/api/media/logos/'

export async function apiResponse(request: Request, env: WorkerEnv, config: SecurityConfig, identity: AccessIdentity) {
  const path = new URL(request.url).pathname
  if (path === '/api/session' && request.method === 'GET') {
    return json({ email: identity.email, expiresAt: identity.expiresAt, csrfToken: await issueCsrfToken(identity, config.origin, config.csrfSecret) })
  }
  if (path === '/api/status' && request.method === 'GET') {
    return json({
      authenticated: true,
      publishingTarget: publishingPolicy,
      mode: env.DRAFTS ? 'staging' : 'read-only',
      integrations: { github: Boolean(githubConfig(env)), r2: Boolean(env.MEDIA), uploads: Boolean(env.DRAFTS), publishing: false },
      limits: { maxBytes: imagePolicy.maxBytes, maxPixels: imagePolicy.maxPixels, accepts: ['image/jpeg', 'image/png', 'image/webp'] },
    })
  }
  if (path === '/api/repository/head' && request.method === 'GET') {
    // Reads only, and only the ref the policy names. Nothing in the request
    // selects the repository, the branch or the revision.
    const head = await resolveHead(requireGithub(env))
    return json({ ...head, capability: 'read-only', scope: `${repositoryPolicy.owner}/${repositoryPolicy.repo}` })
  }
  // Origin and a session-bound CSRF token were already required for this method
  // before the request reached here.
  if (path === '/api/media/uploads' && request.method === 'POST') {
    if (!env.DRAFTS) return json({ error: 'uploads_not_connected' }, 503)
    if (Number(request.headers.get('content-length') ?? 0) > imagePolicy.maxBytes) return json({ error: 'image_too_large' }, 413)
    return json(await storeDraft(env.DRAFTS, await request.arrayBuffer(), request.headers.get('content-type')), 201)
  }
  if (path === '/api/media/drafts' && request.method === 'GET') {
    if (!env.DRAFTS) return json({ error: 'uploads_not_connected' }, 503)
    return json(await listDrafts(env.DRAFTS, new URL(request.url).searchParams.get('cursor') ?? undefined))
  }
  if (path.startsWith(DRAFT_ROUTE) && request.method === 'GET') {
    if (!env.DRAFTS) return json({ error: 'uploads_not_connected' }, 503)
    // Staged bytes are private: they are streamed to an authenticated caller
    // here and exist at no public URL anywhere.
    const object = await readDraft(env.DRAFTS, path.slice(DRAFT_ROUTE.length))
    return new Response(object.body, { headers: { 'content-type': object.httpMetadata?.contentType ?? 'application/octet-stream' } })
  }
  if (path === '/api/media/logos' && request.method === 'POST') {
    if (!env.MEDIA) return json({ error: 'r2_not_connected' }, 503)
    if (Number(request.headers.get('content-length') ?? 0) > imagePolicy.maxBytes) return json({ error: 'image_too_large' }, 413)
    const params = new URL(request.url).searchParams
    // The name is checked against the shape a YAML value may take before it can
    // become any part of a key.
    const stored = await storeLogo(env.MEDIA, params.get('name') ?? '', await request.arrayBuffer(), request.headers.get('content-type'), params.get('replace') === 'true')
    return json(stored, 201)
  }
  if (path.startsWith(LOGO_ROUTE) && path.endsWith('/archive') && request.method === 'POST') {
    if (!env.MEDIA) return json({ error: 'r2_not_connected' }, 503)
    const name = decodeURIComponent(path.slice(LOGO_ROUTE.length, -'/archive'.length))
    return json(await archiveLogo(env.MEDIA, name))
  }
  if (path === '/api/media/logos' && request.method === 'GET') {
    if (!env.MEDIA) return json({ error: 'r2_not_connected' }, 503)
    // The cursor is the only thing the browser contributes, and it is checked
    // before it reaches storage.
    return json(await listLogos(env.MEDIA, new URL(request.url).searchParams.get('cursor') ?? undefined))
  }
  return json({ error: 'not_found' }, 404)
}
