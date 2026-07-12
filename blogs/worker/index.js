// Worker in front of the static site. Static assets are served first (see
// wrangler.jsonc); only /api/* reaches this script, via run_worker_first.
//
// GET /api/rail-route?train=NNNNN
//   Relays RailRadar's route-geometry endpoint for one train, keeping the
//   API key server-side (secret: `npx wrangler secret put RAILRADAR_API_KEY`).
//   Responses are cached at the edge AND marked cacheable for the browser,
//   because the free RailRadar tier is 50 requests/day per key — shared
//   across all visitors, so every cache layer counts.

// Matches the client's localStorage TTL (6 h) for the browser; the edge
// keeps entries longer — a train's route geometry effectively never changes.
const BROWSER_TTL_S = 6 * 60 * 60
const EDGE_TTL_S = 7 * 24 * 60 * 60

function json(body, status) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  })
}

async function railRoute(url, env, ctx) {
  const train = (url.searchParams.get('train') || '').trim()
  if (!/^\d{3,6}$/.test(train)) {
    return json({ error: 'invalid train number' }, 400)
  }
  if (!env.RAILRADAR_API_KEY) {
    return json({ error: 'rail-route proxy not configured' }, 503)
  }

  // Normalised synthetic cache key: one entry per train, per colo.
  const cacheKey = new Request(`${url.origin}/api/rail-route?train=${train}`)
  const cached = await caches.default.match(cacheKey)
  if (cached) return cached

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
    const res = json(
      { error: `railradar ${upstream.status}${detail ? `: ${detail}` : ''}` },
      502,
    )
    if (upstream.status === 404) {
      // A train RailRadar doesn't know stays unknown; cache the miss so a
      // yml typo can't drain the request quota one page-view at a time.
      res.headers.set('cache-control', 'public, max-age=3600, s-maxage=86400')
      ctx.waitUntil(caches.default.put(cacheKey, res.clone()))
    }
    return res
  }

  const res = new Response(upstream.body, {
    headers: {
      'content-type': 'application/json',
      'cache-control': `public, max-age=${BROWSER_TTL_S}, s-maxage=${EDGE_TTL_S}`,
    },
  })
  ctx.waitUntil(caches.default.put(cacheKey, res.clone()))
  return res
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
