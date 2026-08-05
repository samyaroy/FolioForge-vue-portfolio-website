// Worker in front of the static site. Static assets are served first (see
// wrangler.jsonc); only /api/* reaches this script, via run_worker_first.
//
// GET /api/rail-route?train=NNNNN
//   Returns RailRadar route geometry for one train. Geometry is precomputed at
//   commit time (scripts/sync-rail.mjs) and stored in Workers KV, so the common
//   path never touches RailRadar — the free tier is only 50 requests/day per
//   key, shared across ALL visitors. On a KV miss (a train not synced yet) the
//   Worker fetches once from RailRadar and writes it back, so it self-heals and
//   the next request — on any device — comes straight from KV.

// Browser cache mirrors the client's localStorage TTL (6 h); the stored
// geometry itself never changes, so KV is the durable source of truth.
const BROWSER_TTL_S = 6 * 60 * 60
// Remember a RailRadar "unknown train" (a yml typo) for a day so it can't drain
// the daily quota one page-view at a time.
const MISS_TTL_S = 24 * 60 * 60

const KEY = (train) => `rail:${train}`
const MISS_KEY = (train) => `railmiss:${train}`

function json(body, status) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  })
}

function geometry(bodyStream, source) {
  return new Response(bodyStream, {
    headers: {
      'content-type': 'application/json',
      'cache-control': `public, max-age=${BROWSER_TTL_S}`,
      'x-rail-source': source,
    },
  })
}

async function railRoute(url, env, ctx) {
  const train = (url.searchParams.get('train') || '').trim()
  if (!/^\d{3,6}$/.test(train)) {
    return json({ error: 'invalid train number' }, 400)
  }

  // Primary path: geometry precomputed at commit time, served from KV.
  if (env.RAIL) {
    const stored = await env.RAIL.get(KEY(train), 'stream')
    if (stored) return geometry(stored, 'kv')
    // A train RailRadar already told us it doesn't know — don't ask again.
    if (await env.RAIL.get(MISS_KEY(train))) {
      return json({ error: 'railradar 404: unknown train' }, 502)
    }
  }

  // Fallback: KV miss (train not synced, or KV binding absent). Fetch once from
  // RailRadar, keeping the API key server-side, and write the result back to KV.
  if (!env.RAILRADAR_API_KEY) {
    return json({ error: 'rail-route not in store and proxy not configured' }, 503)
  }
  // Tolerate common paste mistakes in the secret: surrounding quotes,
  // whitespace, or an included "Bearer " prefix.
  const key = env.RAILRADAR_API_KEY.trim()
    .replace(/^["']|["']$/g, '')
    .replace(/^Bearer\s+/i, '')
  const upstream = await fetch(
    `https://api.railradar.in/v1/trains/${train}/route`,
    { headers: { Authorization: `Bearer ${key}` } },
  )
  if (!upstream.ok) {
    // Relay RailRadar's own error message so a bad key or unknown train is
    // diagnosable from the browser's network tab.
    const detail = await upstream
      .json()
      .then((b) => b?.error?.message)
      .catch(() => null)
    if (upstream.status === 404 && env.RAIL) {
      ctx.waitUntil(env.RAIL.put(MISS_KEY(train), '1', { expirationTtl: MISS_TTL_S }))
    }
    return json(
      { error: `railradar ${upstream.status}${detail ? `: ${detail}` : ''}` },
      502,
    )
  }

  const body = await upstream.text()
  if (env.RAIL) ctx.waitUntil(env.RAIL.put(KEY(train), body))
  return geometry(body, 'railradar')
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url)
    if (url.pathname === '/api/rail-route' && request.method === 'GET') {
      return railRoute(url, env, ctx)
    }
    if (url.pathname.startsWith('/api/')) {
      return json({ error: 'not found' }, 404)
    }
    // Non-API paths only land here when assets didn't match; let the asset
    // handler apply its SPA fallback.
    return env.ASSETS.fetch(request)
  },
}
