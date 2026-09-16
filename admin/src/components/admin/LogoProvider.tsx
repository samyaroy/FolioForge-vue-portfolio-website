import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { toast } from 'react-toastify'
import { LogoContext } from '@/hooks/logoContext'
import { fetchLogos } from '@/services/logos'
import type { LogoAsset } from '@/types/logos'

const files = import.meta.glob('../../../../src/metadata/logo/**/*.{png,jpg,jpeg,webp}', { eager: true, query: '?url', import: 'default' }) as Record<string, string>
const repositoryLogos: LogoAsset[] = Object.entries(files).map(([path, url]) => {
  const name = path.split('/').pop()!
  return { name, url, value: name.replace(/\.png$/i, ''), source: 'repository' }
})

export function LogoProvider({ children }: { children: ReactNode }) {
  const [catalog, setCatalog] = useState(repositoryLogos)
  const [staged, setStaged] = useState<LogoAsset[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [revision, setRevision] = useState(0)
  const objectUrls = useRef<string[]>([])

  useEffect(() => {
    const controller = new AbortController()
    fetchLogos(controller.signal).then(items => { setCatalog(items); setError(null) }).catch(error => {
      if (!controller.signal.aborted) setError(error instanceof Error ? error.message : 'Could not fetch logos.')
    }).finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [revision])

  useEffect(() => () => objectUrls.current.forEach(url => URL.revokeObjectURL(url)), [])

  const stage = (file: File, replacement?: string) => {
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || file.size > 10 * 1024 * 1024) {
      toast.error('Choose a PNG, JPEG, or WebP logo under 10 MB.')
      return
    }
    const url = URL.createObjectURL(file)
    objectUrls.current.push(url)
    const value = replacement ?? `logo-${crypto.randomUUID()}.${file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg'}`
    setStaged(current => [...current.filter(item => item.value !== value), { value, name: file.name, url, source: 'local' }])
    toast.success(replacement ? 'Logo replacement staged locally. R2 is unchanged.' : 'Logo staged locally. R2 is unchanged.')
  }

  const logos = [...catalog.filter(item => !staged.some(draft => draft.value === item.value)), ...staged].sort((a, b) => a.name.localeCompare(b.name))
  return <LogoContext.Provider value={{ logos, loading, error, stage, refresh: () => { setLoading(true); setRevision(current => current + 1) } }}>{children}</LogoContext.Provider>
}
