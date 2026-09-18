import { useEffect, useState } from 'react'
import { fetchRepositoryHead, type RepositoryHead } from '@/services/repository'

type RepositoryState = {
  head?: RepositoryHead
  /** `undefined` until the first answer arrives, so the UI can say "checking". */
  connected?: boolean
}

/**
 * Ask the Worker which revision of the publishing branch is live. A failure is
 * the ordinary unconnected case, not an error worth showing: the admin reads
 * repository content from its own bundle and works either way.
 */
export function useRepositoryHead(): RepositoryState {
  const [state, setState] = useState<RepositoryState>({})

  useEffect(() => {
    const controller = new AbortController()
    fetchRepositoryHead(controller.signal)
      .then(head => setState({ head, connected: true }))
      .catch((error: unknown) => {
        if (error instanceof Error && error.name === 'AbortError') return
        setState({ connected: false })
      })
    return () => controller.abort()
  }, [])

  return state
}
