import { useEffect, useState } from 'react'
import { fetchIntegrations, type Integrations } from '@/services/status'

const DISCONNECTED: Integrations = { github: false, r2: false, publishing: false }

/**
 * Which integrations the Worker reports. Until it answers, and if it never
 * does, everything reads as disconnected — the admin works from its own bundle
 * either way, and an optimistic guess would be the misleading one.
 */
export function useIntegrations(): Integrations {
  const [integrations, setIntegrations] = useState<Integrations>(DISCONNECTED)

  useEffect(() => {
    const controller = new AbortController()
    fetchIntegrations(controller.signal)
      .then(setIntegrations)
      .catch((error: unknown) => {
        if (error instanceof Error && error.name === 'AbortError') return
        setIntegrations(DISCONNECTED)
      })
    return () => controller.abort()
  }, [])

  return integrations
}
