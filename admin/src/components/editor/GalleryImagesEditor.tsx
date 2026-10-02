import { useState } from 'react'
import type { DragEvent, KeyboardEvent } from 'react'
import { AlertCircle, ChevronLeft, ChevronRight, CloudUpload, ImageOff, Loader2, Plus, Trash2 } from 'lucide-react'
import { Button, FileField, IconButton, TextField } from '@/components/form'
import { galleryImageUrl, splitGalleryImages } from '@/lib/galleryImages'
import type { PendingPhoto } from '@/hooks/useGalleryUploads'

type GalleryImagesEditorProps = {
  images: string[]
  /** The entry's id, which the card falls back to when no image is listed. */
  fallbackId: string
  onChange: (images: string[]) => void
  /** Photos picked here and not yet published, by the key each will take. */
  uploads?: Record<string, PendingPhoto>
  /** Takes photos to upload; without it the editor only assigns keys. */
  onUpload?: (files: File[]) => void
}

const UPLOAD_STATUS: Record<PendingPhoto['state'], string> = {
  preparing: 'Preparing',
  uploading: 'Uploading',
  ready: 'Publishes on save',
  failed: 'Upload failed',
}

/** The image files a drop or a picker carried; anything else is ignored. */
function imageFiles(files: FileList | null): File[] {
  return Array.from(files ?? []).filter(file => file.type.startsWith('image/') || /\.(heic|heif)$/i.test(file.name))
}

function carriesFiles(event: DragEvent) {
  return Array.from(event.dataTransfer.types).includes('Files')
}

/** A photo as the card will load it; a missing one says so rather than vanishing. */
function ImagePreview({ image, src, className }: { image: string; src?: string; className?: string }) {
  const [failed, setFailed] = useState(false)
  const url = src ?? galleryImageUrl(image)
  if (!url || failed) {
    return <span className={`gallery-image-missing ${className ?? ''}`}><ImageOff aria-hidden="true" />{url ? <small>Not found</small> : null}</span>
  }
  return <img className={className} src={url} alt="" loading="lazy" decoding="async" onError={() => setFailed(true)} />
}

export function GalleryImagesEditor({ images, fallbackId, onChange, uploads = {}, onUpload }: GalleryImagesEditorProps) {
  const [draft, setDraft] = useState('')
  const [notice, setNotice] = useState('')
  const [dragging, setDragging] = useState<number | null>(null)
  const [over, setOver] = useState<number | null>(null)
  const [dropping, setDropping] = useState(false)
  const pending = splitGalleryImages(draft)
  // Photos are named after the entry, so there is nothing to name them by yet.
  const canUpload = Boolean(onUpload && fallbackId.trim())

  const receive = (files: FileList | null) => {
    const picked = imageFiles(files)
    if (!onUpload) return
    if (!fallbackId.trim()) { setNotice('Give the entry an ID first; its photos are named after it.'); return }
    if (!picked.length) { setNotice('Only image files can be uploaded.'); return }
    setNotice('')
    onUpload(picked)
  }

  const move = (from: number, to: number) => {
    if (from === to || to < 0 || to >= images.length) return
    const next = [...images]
    const [item] = next.splice(from, 1)
    next.splice(to, 0, item)
    onChange(next)
  }

  const add = () => {
    if (!pending.length) return
    const fresh = pending.filter((image, index) => !images.includes(image) && pending.indexOf(image) === index)
    const repeated = pending.filter(image => images.includes(image))
    setNotice(repeated.length ? `Already listed: ${repeated.join(', ')}` : '')
    setDraft('')
    if (fresh.length) onChange([...images, ...fresh])
  }

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') return
    event.preventDefault()
    add()
  }

  return (
    <div
      className="gallery-images-editor"
      data-dropping={dropping || undefined}
      // Photos dropped anywhere on the editor are uploaded; a tile being
      // dragged to reorder is not a file, so it passes through untouched.
      onDragOver={event => { if (!onUpload || !carriesFiles(event)) return; event.preventDefault(); setDropping(true) }}
      onDragLeave={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDropping(false) }}
      onDrop={event => { if (!carriesFiles(event)) return; event.preventDefault(); setDropping(false); receive(event.dataTransfer.files) }}
    >
      <div className="gallery-images-heading">
        <span className="logo-selector-label">Images <small>{images.length}</small></span>
        {images.length > 1 && <small>Drag to reorder. The first image is the cover.</small>}
      </div>
      {images.length ? (
        <ol className="gallery-image-grid">
          {images.map((image, index) => (
            <li
              // A file written by hand can list one image twice; count it in.
              key={`${image}#${images.slice(0, index).filter(item => item === image).length}`}
              className="gallery-image"
              draggable
              data-dragging={dragging === index || undefined}
              data-over={over === index && dragging !== index ? true : undefined}
              onDragStart={event => { setDragging(index); event.dataTransfer.effectAllowed = 'move'; event.dataTransfer.setData('text/plain', image) }}
              onDragOver={event => { if (dragging === null) return; event.preventDefault(); setOver(index) }}
              onDrop={event => { event.preventDefault(); if (dragging !== null) move(dragging, index); setDragging(null); setOver(null) }}
              onDragEnd={() => { setDragging(null); setOver(null) }}
            >
              <div className="gallery-image-frame">
                <ImagePreview key={uploads[image]?.previewUrl ?? image} image={image} src={uploads[image]?.previewUrl} />
                {index === 0 && <span className="gallery-image-cover">Cover</span>}
                {uploads[image] && (
                  <span className="gallery-image-status" data-state={uploads[image].state} title={uploads[image].error}>
                    {uploads[image].state === 'failed' ? <AlertCircle aria-hidden="true" /> : uploads[image].state === 'ready' ? <CloudUpload aria-hidden="true" /> : <Loader2 className="animate-spin" aria-hidden="true" />}
                    {UPLOAD_STATUS[uploads[image].state]}
                  </span>
                )}
                <span className="gallery-image-actions">
                  <IconButton variant="bare" size="none" label={`Move ${image} earlier`} title="Move earlier" disabled={index === 0} onClick={() => move(index, index - 1)}><ChevronLeft aria-hidden="true" /></IconButton>
                  <IconButton variant="bare" size="none" label={`Move ${image} later`} title="Move later" disabled={index === images.length - 1} onClick={() => move(index, index + 1)}><ChevronRight aria-hidden="true" /></IconButton>
                  <IconButton variant="bare" size="none" label={`Remove ${image}`} title="Remove" onClick={() => onChange(images.filter((_, position) => position !== index))}><Trash2 aria-hidden="true" /></IconButton>
                </span>
              </div>
              <code className="gallery-image-key" title={image}>{image}</code>
            </li>
          ))}
        </ol>
      ) : (
        <div className="gallery-image-fallback">
          {fallbackId.trim() && <ImagePreview key={fallbackId} image={fallbackId} className="gallery-image-fallback-thumb" />}
          <span>
            <strong>No images listed</strong>
            <small>{fallbackId.trim() ? <>The card shows the image named after the entry ID, <code>{fallbackId.trim()}</code>.</> : 'Add one, or give the entry an ID to use as its image.'}</small>
          </span>
        </div>
      )}
      <div className="gallery-image-add">
        {/* What is about to be added, before it is: a typo shows as a gap here
            rather than as a broken card on the site. */}
        <span className="gallery-image-add-preview" aria-hidden="true">
          {pending.length ? <ImagePreview key={pending[0]} image={pending[0]} /> : <Plus />}
        </span>
        <TextField aria-label="Image key or URL to add" value={draft} onChange={value => { setDraft(value); setNotice('') }} onKeyDown={onKeyDown} placeholder="Image key or URL, e.g. competition-01-03" />
        <Button variant="outline" size="sm" disabled={!pending.length} onClick={add}><Plus aria-hidden="true" /> Add{pending.length > 1 ? ` ${pending.length}` : ''}</Button>
        {onUpload && (
          <FileField
            fieldClassName="gallery-image-upload"
            accept="image/*,.heic,.heif"
            multiple
            disabled={!canUpload}
            title={canUpload ? 'Upload photos from this device' : 'Give the entry an ID first; its photos are named after it'}
            onSelect={receive}
          ><CloudUpload aria-hidden="true" /> Upload</FileField>
        )}
      </div>
      <small className="gallery-image-hint" role={notice ? 'status' : undefined}>
        {notice || <>
          {onUpload && <>Upload or drop photos: they are named after the entry and published when you save. </>}
          A bare key loads <code>media.samyabrata.codeium.xyz/&lt;key&gt;.jpeg</code>; a full URL is used as it is.
        </>}
      </small>
    </div>
  )
}
