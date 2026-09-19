import type { AccessIdentity, WorkerEnv } from '../types.ts'
import { issueCsrfToken } from '../auth/csrf.ts'
import { publishingPolicy, type SecurityConfig } from '../config.ts'
import { githubConfig, installationAccess, repositoryPolicy, requireGithub, resolveHead } from '../github.ts'
import { applyEntryChange, readCollection } from '../content/index.ts'
import { contentSources } from '../content/registry.ts'
import { HttpError, json } from '../http.ts'
import { archiveLogo, archiveMedia, listLogos, publishDraft, storeLogo } from '../media.ts'
import { discardDraft, listDrafts, readDraft, storeDraft } from '../drafts.ts'
import { imagePolicy } from '../images.ts'

const DRAFT_ROUTE = '/api/media/drafts/'
const LOGO_ROUTE = '/api/media/logos/'
const COLLECTION_ROUTE = '/api/content/'
const MEDIA_ROUTE = '/api/media/files/'

async function jsonBody(request: Request): Promise<Record<string, unknown>> {
  if (Number(request.headers.get('content-length') ?? 0) > 512 * 1024) throw new HttpError(413, 'body_too_large')
  const body: unknown = await request.json().catch(() => undefined)
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new HttpError(400, 'invalid_body')
  return body as Record<string, unknown>
}

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
    // Reads only the ref the policy names. Nothing in the request selects the
    // repository, the branch or the revision.
    const config = requireGithub(env)
    const [head, access] = await Promise.all([resolveHead(config), installationAccess(config)])
    return json({ ...head, contents: access.contents, canWrite: access.canWrite, collections: Object.keys(contentSources), scope: `${repositoryPolicy.owner}/${repositoryPolicy.repo}` })
  }
  if (path.startsWith(COLLECTION_ROUTE) && request.method === 'GET') {
    return json(await readCollection(requireGithub(env), decodeURIComponent(path.slice(COLLECTION_ROUTE.length))))
  }
  // Writes name a collection, never a path: the Worker's registry decides which
  // file that is, so no request can reach a file outside the allowlist.
  if (path.startsWith(COLLECTION_ROUTE) && ['POST', 'PUT', 'DELETE'].includes(request.method)) {
    const collection = decodeURIComponent(path.slice(COLLECTION_ROUTE.length))
    const body = await jsonBody(request)
    const baseSha = typeof body.baseSha === 'string' ? body.baseSha : ''
    if (!/^[a-f0-9]{40}$/.test(baseSha)) throw new HttpError(400, 'base_revision_required')
    const action = request.method === 'POST' ? 'create' : request.method === 'PUT' ? 'update' : 'delete'
    const index = typeof body.index === 'number' ? body.index : undefined
    return json(await applyEntryChange(requireGithub(env), action, { collection, index, entry: body.entry, baseSha }))
  }
  // Origin and a session-bound CSRF token were already required for this method
  // before the request reached here.
  if (path === '/api/media/uploads' && request.method === 'POST') {
    if (!env.DRAFTS) return json({ error: 'uploads_not_connected' }, 503)
    if (Number(request.headers.get('content-length') ?? 0) > imagePolicy.maxBytes) return json({ error: 'image_too_large' }, 413)
    return json(await storeDraft(env.DRAFTS, await request.arrayBuffer(), request.headers.get('content-type')), 201)
  }
  if (path === '/api/media/publish' && request.method === 'POST') {
    if (!env.MEDIA || !env.DRAFTS) return json({ error: 'r2_not_connected' }, 503)
    const body = await jsonBody(request)
    const published = await publishDraft(env.MEDIA, env.DRAFTS, String(body.draft ?? ''), String(body.name ?? ''), body.replace === true)
    return json(published, 201)
  }
  if (path === '/api/media/drafts' && request.method === 'GET') {
    if (!env.DRAFTS) return json({ error: 'uploads_not_connected' }, 503)
    return json(await listDrafts(env.DRAFTS, new URL(request.url).searchParams.get('cursor') ?? undefined))
  }
  if (path.startsWith(DRAFT_ROUTE) && request.method === 'DELETE') {
    if (!env.DRAFTS) return json({ error: 'uploads_not_connected' }, 503)
    await discardDraft(env.DRAFTS, path.slice(DRAFT_ROUTE.length))
    return json({ discarded: true })
  }
  if (path.startsWith(MEDIA_ROUTE) && path.endsWith('/archive') && request.method === 'POST') {
    if (!env.MEDIA) return json({ error: 'r2_not_connected' }, 503)
    const name = decodeURIComponent(path.slice(MEDIA_ROUTE.length, -'/archive'.length))
    return json(await archiveMedia(env.MEDIA, name))
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
