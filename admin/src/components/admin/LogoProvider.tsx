import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { LogoContext } from '@/hooks/logoContext'
import { fetchLogos } from '@/services/logos'
import type { LogoAsset } from '@/types/logos'

const files = import.meta.glob('../../../../src/metadata/logo/**/*.{png,jpg,jpeg,webp}', { eager: true, query: '?url', import: 'default' }) as Record<string, string>
const repositoryLogos: LogoAsset[] = Object.entries(files).map(([path, url]) => {
  const name = path.split('/').pop()!
  return { name, url, value: name.replace(/\.png$/i, ''), source: 'repository' }
})

export function LogoProvider({ children }: { children: ReactNode }) {
  // Repository logos are the fallback for when R2 cannot be reached, so the
  // selector still shows something recognisable rather than an empty list.
  const [catalog, setCatalog] = useState(repositoryLogos)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [revision, setRevision] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    fetchLogos(controller.signal).then(items => { setCatalog(items); setError(null) }).catch(error => {
      if (!controller.signal.aborted) setError(error instanceof Error ? error.message : 'Could not fetch logos.')
    }).finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [revision])

  const logos = [...catalog].sort((a, b) => a.name.localeCompare(b.name))
  return <LogoContext.Provider value={{ logos, loading, error, refresh: () => { setLoading(true); setRevision(current => current + 1) } }}>{children}</LogoContext.Provider>
}
