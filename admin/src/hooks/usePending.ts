import { useCallback, useEffect, useState } from 'react'
import { fetchPending, type PendingFile } from '@/services/pending'

/**
 * What is waiting to be published. Shared by the header, which shows the count,
 * and the publishing screen, which lists and commits it.
 */
export function usePending() {
  const [files, setFiles] = useState<PendingFile[]>([])
  const [ready, setReady] = useState(false)

  const refresh = useCallback(async () => {
    const next = await fetchPending(new AbortController().signal).catch(() => [])
    setFiles(next)
    setReady(true)
    return next
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    fetchPending(controller.signal)
      .then(next => { setFiles(next); setReady(true) })
      .catch(() => setReady(true))
    return () => controller.abort()
  }, [])

  return { files, ready, refresh }
}
