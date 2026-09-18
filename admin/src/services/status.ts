export type Integrations = {
  github: boolean
  r2: boolean
  publishing: boolean
}

function asBoolean(value: unknown): boolean {
  return value === true
}

/**
 * Ask the Worker which integrations are actually wired. Anything unreadable is
 * reported as disconnected: claiming a connection the admin does not have is
 * the one answer worth ruling out.
 */
export async function fetchIntegrations(signal: AbortSignal): Promise<Integrations> {
  const response = await fetch('/api/status', { signal, credentials: 'same-origin', headers: { Accept: 'application/json' } })
  if (!response.ok || !response.headers.get('content-type')?.includes('application/json')) throw new Error('Status is unavailable.')
  const body: unknown = await response.json()
  if (!body || typeof body !== 'object') throw new Error('Invalid status response.')
  const integrations = (body as { integrations?: unknown }).integrations
  if (!integrations || typeof integrations !== 'object') throw new Error('Invalid status response.')
  const { github, r2, publishing } = integrations as Record<string, unknown>
  return { github: asBoolean(github), r2: asBoolean(r2), publishing: asBoolean(publishing) }
}
