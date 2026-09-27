import { useEffect, useRef, useState } from 'react'
import { toast } from 'react-toastify'
import { AlertCircle, Archive, CheckCircle2, CloudUpload, ImagePlus, Loader2, Trash2 } from 'lucide-react'
import { LocalNotice } from '@/components/admin/LocalNotice'
import { PageHeader } from '@/components/admin/PageHeader'
import { Button, FileField, IconButton, TextField } from '@/components/form'
import { LogoLibrary } from '@/components/admin/LogoLibrary'
import { useIntegrations } from '@/hooks/useIntegrations'
import { archiveMedia, discardDraft, draftPreviewUrl, listDrafts, publishDraft, uploadImage, type StoredDraft } from '@/services/uploads'

type Staged = {
  id: string
  name: string
  size: string
  previewUrl: string
  state: 'uploading' | 'stored' | 'failed'
  stored?: StoredDraft
  error?: string
  /** The name this image will carry once published, and where it landed. */
  publishAs?: string
  publishedUrl?: string
  publishing?: boolean
}

const megabytes = (bytes: number) => `${(bytes / 1024 / 1024).toFixed(2)} MB`

export function MediaLibraryPage() {
  const integrations = useIntegrations()
  const [staged, setStaged] = useState<Staged[]>([])
  const stagedRef = useRef(staged)
  const controllers = useRef(new Set<AbortController>())

  useEffect(() => { stagedRef.current = staged }, [staged])

  // Uploads survive a reload; showing only this session's made older ones
  // invisible and impossible to clear.
  useEffect(() => {
    const controller = new AbortController()
    listDrafts(controller.signal)
      .then(items => setStaged(current => [
        ...items
          .filter(item => !current.some(entry => entry.stored?.name === item.name))
          .map(item => ({ id: item.name, name: item.name, size: megabytes(item.size), previewUrl: draftPreviewUrl(item.name), state: 'stored' as const, stored: item })),
        ...current,
      ]))
      .catch(() => undefined)
    return () => controller.abort()
  }, [])
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

  const remove = async (id: string) => {
    const item = stagedRef.current.find(entry => entry.id === id)
    if (!item) return
    if (item.stored && !window.confirm(`Discard "${item.name}" from staging? The upload is deleted.`)) return
    if (item.stored) {
      try {
        await discardDraft(item.stored.name)
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Could not discard that upload.')
        return
      }
    }
    if (item.previewUrl.startsWith('blob:')) URL.revokeObjectURL(item.previewUrl)
    setStaged(current => current.filter(entry => entry.id !== id))
    if (item.stored) toast.success('Upload discarded.')
  }

  const unpublish = async (item: Staged) => {
    const name = item.publishedUrl?.split('/').pop()
    if (!name) return
    if (!window.confirm(`Take ${name} off the media host? The file moves to archived/, so anything still pointing at it will break.`)) return
    try {
      const archivedAs = await archiveMedia(name)
      update(item.id, { publishedUrl: undefined })
      toast.success(`Archived to ${archivedAs}.`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not archive that file.')
    }
  }

  const storedCount = staged.filter(item => item.state === 'stored').length

  const publish = async (item: Staged) => {
    const name = (item.publishAs ?? '').trim()
    if (!item.stored || !name) { toast.error('Name the image before publishing it.'); return }
    const replace = window.confirm(`Publish as "${name}"?\n\nOK to replace an existing file of that name (the old one is archived), or Cancel to refuse if the name is taken.`)
    update(item.id, { publishing: true })
    try {
      const published = await publishDraft(item.stored.name, name, replace)
      update(item.id, { publishedUrl: published.url, publishing: false })
      toast.success(published.replaced ? `Published. The previous file is in ${published.replaced}.` : 'Published to the media host.')
    } catch (error) {
      update(item.id, { publishing: false })
      toast.error(error instanceof Error ? error.message : 'Could not publish that image.')
    }
  }

  return (
    <>
      <PageHeader
        title="Media & Gallery"
        description="Upload images to private staging and inspect what was stored."
        actions={<Button variant="outline" disabled>{storedCount} staged this session</Button>}
      />
      <LocalNotice>
        {integrations.uploads
          ? 'Uploads land in a private bucket with no public address, and location metadata is stripped before anything is written. Publishing copies one to the media host under the name your content will reference.'
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
                  {item.stored && !item.publishedUrl && (
                    <span className="media-publish">
                      <TextField
                        aria-label={`Publish ${item.name} as`}
                        value={item.publishAs ?? ''}
                        onChange={value => update(item.id, { publishAs: value })}
                        placeholder="Name on the media host"
                      />
                      <Button size="sm" variant="outline" disabled={item.publishing} onClick={() => void publish(item)}>
                        <CloudUpload aria-hidden="true" /> {item.publishing ? 'Publishing...' : 'Publish'}
                      </Button>
                    </span>
                  )}
                  {item.publishedUrl && <code><a href={item.publishedUrl} target="_blank" rel="noreferrer">{item.publishedUrl.replace('https://', '')}</a></code>}
                </div>
                <span className="media-card-actions">
                  {item.publishedUrl && (
                    <IconButton variant="bare" size="none" title="Take off the media host" label={`Archive ${item.name}`} onClick={() => void unpublish(item)}><Archive aria-hidden="true" /></IconButton>
                  )}
                  <IconButton variant="bare" size="none" title={item.stored ? 'Discard this upload' : 'Remove from this list'} label={`Remove ${item.name}`} onClick={() => void remove(item.id)}><Trash2 aria-hidden="true" /></IconButton>
                </span>
              </article>
            ))}
          </div>
        )
        : <div className="simple-empty">No images uploaded in this session.</div>}
    </>
  )
}
