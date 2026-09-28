// Reads one Credly earner's public badges.
//
// Credly has no official API for this. Its documented API
// (https://www.credly.com/docs) belongs to issuing organisations and needs an
// organisation token; it can list the badges an organisation has issued, not
// the badges one earner has collected. The public profile page, though, loads
// its badge list from an unauthenticated JSON endpoint, and that is what this
// reads:
//
//   https://www.credly.com/users/<username>/badges.json?page=N
//
// That endpoint is undocumented, so Credly can change or drop it without
// notice. Every field used here is checked, and anything unexpected throws,
// which leaves the last good snapshot in place instead of publishing a wrong
// number. It sends no CORS headers, which is why a browser cannot read it and
// this Worker exists.
//
// The count comes straight from `metadata.total_count`. Credly fixes the page
// size at 48 (a `page_size` parameter is ignored), so the pages are still walked,
// but only because the issuer tally needs every badge.

export interface IssuerCount {
  name: string
  count: number
}

export interface BadgeSnapshot {
  count: number
  /** Most badges first, then by name. */
  issuers: IssuerCount[]
  /** When Credly was last read successfully (ISO 8601, UTC). */
  updatedAt: string
}

interface BadgePage {
  totalCount: number
  badges: unknown[]
  nextPageUrl: string | null
}

const CREDLY_ORIGIN = 'https://www.credly.com'
const USER_AGENT = 'folioforge-credly-badges (+https://samyabrata.codeium.xyz)'
const REQUEST_TIMEOUT_MS = 10_000

// 960 badges. A guard against a pagination loop, not a real limit.
const MAX_PAGES = 20

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isCount(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0
}

async function getJson(url: string, fetchImpl: typeof fetch): Promise<unknown> {
  const response = await fetchImpl(url, {
    headers: { accept: 'application/json', 'user-agent': USER_AGENT },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  })
  if (!response.ok) throw new Error(`Credly responded ${response.status} for ${url}`)
  return response.json()
}

function nextPage(value: unknown): string | null {
  if (value === null || value === undefined) return null
  if (typeof value !== 'string') throw new Error('Credly next_page_url is not a string')
  const url = new URL(value, CREDLY_ORIGIN)
  // Only ever follow Credly's own pagination.
  if (url.origin !== CREDLY_ORIGIN) throw new Error(`Refusing to follow pagination to ${url.origin}`)
  return url.href
}

function parsePage(body: unknown): BadgePage {
  if (!isRecord(body) || !isRecord(body.metadata) || !Array.isArray(body.data)) {
    throw new Error('Unexpected Credly response shape')
  }
  const totalCount = body.metadata.total_count
  if (!isCount(totalCount)) throw new Error('Credly metadata.total_count is missing or invalid')
  return { totalCount, badges: body.data, nextPageUrl: nextPage(body.metadata.next_page_url) }
}

/**
 * Who issued a badge. Credly can list several entities on one badge ("Issued
 * by", "Authorized by"); the primary one is the issuer. Falls back to every
 * entity, then to the "issued by X" summary line.
 */
export function issuerNames(badge: unknown): string[] {
  const issuer = isRecord(badge) && isRecord(badge.issuer) ? badge.issuer : null
  if (!issuer) return []

  const entities = Array.isArray(issuer.entities) ? issuer.entities.filter(isRecord) : []
  const primary = entities.filter(entity => entity.primary === true)
  const names = (primary.length ? primary : entities)
    .map(entity => (isRecord(entity.entity) ? entity.entity.name : undefined))
    .filter((name): name is string => typeof name === 'string')
    .map(name => name.trim())
    .filter(Boolean)

  if (!names.length && typeof issuer.summary === 'string') {
    const fromSummary = issuer.summary.replace(/^\s*issued by\s+/i, '').trim()
    if (fromSummary) names.push(fromSummary)
  }
  return [...new Set(names)]
}

export async function fetchBadgeSnapshot(
  username: string,
  options: { fetch?: typeof fetch; now?: Date } = {},
): Promise<BadgeSnapshot> {
  // The slug goes into a URL path; anything else is a misconfigured var.
  if (!/^[a-z0-9._-]+$/i.test(username)) throw new Error(`Invalid CREDLY_USERNAME: ${JSON.stringify(username)}`)

  const fetchImpl = options.fetch ?? fetch
  const tally = new Map<string, number>()
  let url: string | null = `${CREDLY_ORIGIN}/users/${username}/badges.json?page=1`
  let count: number | null = null

  for (let pages = 0; url; pages++) {
    if (pages === MAX_PAGES) throw new Error(`Credly pagination did not end after ${MAX_PAGES} pages`)
    const page = parsePage(await getJson(url, fetchImpl))
    count ??= page.totalCount
    for (const badge of page.badges) {
      for (const name of issuerNames(badge)) tally.set(name, (tally.get(name) ?? 0) + 1)
    }
    url = page.nextPageUrl
  }

  const issuers = [...tally]
    .map(([name, issued]) => ({ name, count: issued }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))

  return { count: count ?? 0, issuers, updatedAt: (options.now ?? new Date()).toISOString() }
}

/** Shape check for a snapshot read back from KV. */
export function isBadgeSnapshot(value: unknown): value is BadgeSnapshot {
  return (
    isRecord(value) &&
    isCount(value.count) &&
    typeof value.updatedAt === 'string' &&
    !Number.isNaN(Date.parse(value.updatedAt)) &&
    Array.isArray(value.issuers) &&
    value.issuers.every(issuer => isRecord(issuer) && typeof issuer.name === 'string' && isCount(issuer.count))
  )
}
