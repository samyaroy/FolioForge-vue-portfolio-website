// Client for the Credly badge summary served by services/credly-badges.
//
// Everything here fails soft. A blank endpoint, a network error, a timeout, a
// 503 while the Worker has no snapshot, or a body in an unexpected shape all
// resolve to null, and the banner falls back to the plain Credly link it showed
// before the count existed. Nothing thrown here can reach the page.

export interface CredlyIssuer {
  name: string
  count: number
}

export interface CredlyBadgeSummary {
  count: number
  issuers: CredlyIssuer[]
  updatedAt: Date
}

const TIMEOUT_MS = 8000

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isCount(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0
}

function parseSummary(body: unknown): CredlyBadgeSummary | null {
  if (!isRecord(body) || !isCount(body.count) || typeof body.updatedAt !== 'string') return null
  const updatedAt = new Date(body.updatedAt)
  if (Number.isNaN(updatedAt.getTime())) return null

  // Issuers are extra detail: a malformed list drops the chips, not the count.
  const issuers = Array.isArray(body.issuers)
    ? body.issuers.filter((issuer): issuer is CredlyIssuer =>
        isRecord(issuer) && typeof issuer.name === 'string' && issuer.name.trim() !== '' && isCount(issuer.count))
    : []

  return { count: body.count, issuers, updatedAt }
}

async function request(endpoint: string): Promise<CredlyBadgeSummary | null> {
  try {
    const response = await fetch(endpoint, {
      headers: { accept: 'application/json' },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })
    return response.ok ? parseSummary(await response.json()) : null
  } catch {
    return null
  }
}

// The Certifications tab remounts the banner on every visit and the answer only
// changes monthly, so one request per page load. A failure is not kept, which
// lets the next visit to the tab try again.
let pending: Promise<CredlyBadgeSummary | null> | null = null

export function loadCredlyBadgeSummary(endpoint: unknown): Promise<CredlyBadgeSummary | null> {
  const url = typeof endpoint === 'string' ? endpoint.trim() : ''
  if (!url) return Promise.resolve(null)

  pending ??= request(url).then(summary => {
    if (!summary) pending = null
    return summary
  })
  return pending
}
