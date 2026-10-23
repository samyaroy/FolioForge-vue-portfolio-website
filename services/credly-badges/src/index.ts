// Credly badge summary for the portfolio's Certifications tab.
//
//   GET /credly-count  ->  { count, issuers: [{ name, count }], updatedAt }
//
// Page views are answered from a snapshot in KV and never reach Credly. The
// cron trigger re-reads the public Credly profile once a month (see
// wrangler.jsonc), and a failed read keeps the previous snapshot, so a Credly
// outage or format change shows up as an older `updatedAt`, not an error.
//
// The one time a request does reach Credly is when there is no snapshot yet:
// right after the first deploy, or after the key has been deleted to force a
// refresh (see README.md).

import { fetchBadgeSnapshot, isBadgeSnapshot, type BadgeSnapshot } from './credly.ts'

export interface Env {
  CREDLY_KV: KVNamespace
  CREDLY_USERNAME: string
}

// Named in README.md, which deletes it to force a refresh. Not exported: every
// named export of a Worker's main module is taken for an entrypoint.
const SNAPSHOT_KEY = 'snapshot'
const ROUTE = '/credly-count'

// The data changes monthly. Six hours spares KV a read on every page view and
// still lets a new month's number reach returning visitors the same day.
const CACHE_OK = 'public, max-age=21600'

const CORS_HEADERS: Record<string, string> = {
  // Public, read-only data with no credentials involved, so any origin may read
  // it: the stable site, the beta site, local dev and preview URLs alike.
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, HEAD, OPTIONS',
  'access-control-max-age': '86400',
}

function json(body: unknown, status: number, cacheControl: string, extra: Record<string, string> = {}): Response {
  return Response.json(body, {
    status,
    headers: { ...CORS_HEADERS, 'cache-control': cacheControl, 'x-content-type-options': 'nosniff', ...extra },
  })
}

async function readSnapshot(env: Env): Promise<BadgeSnapshot | null> {
  try {
    const stored = await env.CREDLY_KV.get(SNAPSHOT_KEY, 'json')
    return isBadgeSnapshot(stored) ? stored : null
  } catch (error) {
    console.error('credly-badges: KV read failed', error)
    return null
  }
}

async function writeSnapshot(env: Env, snapshot: BadgeSnapshot): Promise<void> {
  await env.CREDLY_KV.put(SNAPSHOT_KEY, JSON.stringify(snapshot))
  console.log(`credly-badges: stored ${snapshot.count} badges from ${snapshot.issuers.length} issuers`)
}

/** Same calendar month, UTC. ISO strings start with YYYY-MM. */
function sameMonth(iso: string, now: Date): boolean {
  return new Date(iso).toISOString().slice(0, 7) === now.toISOString().slice(0, 7)
}

export default {
  async fetch(request, env, ctx) {
    const { pathname } = new URL(request.url)
    if (pathname !== ROUTE) return json({ error: 'Not found' }, 404, 'no-store')

    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS_HEADERS })
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return json({ error: 'Method not allowed' }, 405, 'no-store', { allow: 'GET, HEAD, OPTIONS' })
    }

    const stored = await readSnapshot(env)
    if (stored) return json(stored, 200, CACHE_OK)

    try {
      const snapshot = await fetchBadgeSnapshot(env.CREDLY_USERNAME)
      ctx.waitUntil(writeSnapshot(env, snapshot).catch(error => console.error('credly-badges: KV write failed', error)))
      return json(snapshot, 200, CACHE_OK)
    } catch (error) {
      console.error('credly-badges: seeding from Credly failed', error)
      return json({ error: 'Badge count unavailable' }, 503, 'no-store', { 'retry-after': '3600' })
    }
  },

  async scheduled(controller, env) {
    const now = new Date(controller.scheduledTime)
    const stored = await readSnapshot(env)
    if (stored && sameMonth(stored.updatedAt, now)) return

    // A throw here marks the cron run as failed in the Worker's logs and leaves
    // the stored snapshot untouched; tomorrow's run tries again.
    await writeSnapshot(env, await fetchBadgeSnapshot(env.CREDLY_USERNAME, { now }))
  },
} satisfies ExportedHandler<Env>
