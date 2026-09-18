import { useEffect, useRef, useState } from 'react'
import { AlertCircle, CheckCircle2, ImagePlus, Loader2, Trash2 } from 'lucide-react'
import { LocalNotice } from '@/components/admin/LocalNotice'
import { PageHeader } from '@/components/admin/PageHeader'
import { Button, FileField, IconButton } from '@/components/form'
import { LogoLibrary } from '@/components/admin/LogoLibrary'
import { useIntegrations } from '@/hooks/useIntegrations'
import { draftPreviewUrl, uploadImage, type StoredDraft } from '@/services/uploads'

type Staged = {
  id: string
  name: string
  size: string
  previewUrl: string
  state: 'uploading' | 'stored' | 'failed'
  stored?: StoredDraft
  error?: string
}

const megabytes = (bytes: number) => `${(bytes / 1024 / 1024).toFixed(2)} MB`

export function MediaLibraryPage() {
  const integrations = useIntegrations()
  const [staged, setStaged] = useState<Staged[]>([])
  const stagedRef = useRef(staged)
  const controllers = useRef(new Set<AbortController>())

  useEffect(() => { stagedRef.current = staged }, [staged])
  useEffect(() => () => {
    stagedRef.current.forEach(item => URL.revokeObjectURL(item.previewUrl))
    controllers.current.forEach(controller => controller.abort())
  }, [])

  const update = (id: string, change: Partial<Staged>) => setStaged(current => current.map(item => item.id === id ? { ...item, ...change } : item))

  const addFiles = (selected: FileList | null) => {
    if (!selected) return
    for (const file of selected) {
      const id = `${file.name}:${file.size}:${crypto.randomUUID()}`
      // The local preview is shown immediately; the server decides whether the
      // file is acceptable, and says so on this same card.
      setStaged(current => [...current, { id, name: file.name, size: megabytes(file.size), previewUrl: URL.createObjectURL(file), state: 'uploading' }])
      const controller = new AbortController()
      controllers.current.add(controller)
      uploadImage(file, controller.signal)
        .then(stored => update(id, { state: 'stored', stored }))
        .catch((error: unknown) => {
          if (error instanceof Error && error.name === 'AbortError') return
          update(id, { state: 'failed', error: error instanceof Error ? error.message : 'Upload failed.' })
        })
        .finally(() => controllers.current.delete(controller))
    }
  }

  const remove = (id: string) => {
    const item = stagedRef.current.find(entry => entry.id === id)
    if (item) URL.revokeObjectURL(item.previewUrl)
    setStaged(current => current.filter(entry => entry.id !== id))
  }

  const storedCount = staged.filter(item => item.state === 'stored').length

  return (
    <>
      <PageHeader
        title="Media & Gallery"
        description="Upload images to private staging and inspect what was stored."
        actions={<Button variant="outline" disabled>{storedCount} staged this session</Button>}
      />
      <LocalNotice>
        {integrations.uploads
          ? 'Uploads are stored in a private bucket with no public address. Location metadata is stripped before anything is written, and nothing here is published until a reviewed publish step exists.'
          : 'Upload storage is not connected, so files stay in your browser and reach nothing.'}
      </LocalNotice>
      <LogoLibrary />
      <FileField fieldClassName="media-dropzone" data-page-search multiple accept="image/jpeg,image/png,image/webp" onSelect={addFiles}>
        <ImagePlus aria-hidden="true" />
        <strong>Add portfolio images</strong>
        <span>JPEG, PNG or WebP, up to 10 MB and 25 megapixels.</span>
        <Button asChild variant="outline"><span>Choose files</span></Button>
      </FileField>
      {staged.length
        ? (
          <div className="media-grid">
            {staged.map(item => (
              <article className={`media-card media-card-${item.state}`} key={item.id}>
                <img src={item.stored ? draftPreviewUrl(item.stored.name) : item.previewUrl} alt="" />
                <div>
                  <strong>{item.name}</strong>
                  <span>
                    {item.state === 'uploading' && <><Loader2 className="media-spin" aria-hidden="true" /> Uploading {item.size}</>}
                    {item.state === 'stored' && item.stored && <><CheckCircle2 aria-hidden="true" /> {item.stored.width}x{item.stored.height} - {megabytes(item.stored.size)} stored</>}
                    {item.state === 'failed' && <><AlertCircle aria-hidden="true" /> {item.error}</>}
                  </span>
                  {item.stored && <code>{item.stored.name}</code>}
                </div>
                <IconButton variant="bare" size="none" label={`Remove ${item.name}`} onClick={() => remove(item.id)}><Trash2 aria-hidden="true" /></IconButton>
              </article>
            ))}
          </div>
        )
        : <div className="simple-empty">No images uploaded in this session.</div>}
    </>
  )
}
