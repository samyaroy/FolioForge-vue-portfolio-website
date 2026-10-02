import { useState } from 'react'
import type { KeyboardEvent } from 'react'
import { ChevronLeft, ChevronRight, ImageOff, Plus, Trash2 } from 'lucide-react'
import { Button, IconButton, TextField } from '@/components/form'
import { galleryImageUrl, splitGalleryImages } from '@/lib/galleryImages'

type GalleryImagesEditorProps = {
  images: string[]
  /** The entry's id, which the card falls back to when no image is listed. */
  fallbackId: string
  onChange: (images: string[]) => void
}

/** A photo as the card will load it; a missing one says so rather than vanishing. */
function ImagePreview({ image, className }: { image: string; className?: string }) {
  const [failed, setFailed] = useState(false)
  const url = galleryImageUrl(image)
  if (!url || failed) {
    return <span className={`gallery-image-missing ${className ?? ''}`}><ImageOff aria-hidden="true" />{url ? <small>Not found</small> : null}</span>
  }
  return <img className={className} src={url} alt="" loading="lazy" decoding="async" onError={() => setFailed(true)} />
}

export function GalleryImagesEditor({ images, fallbackId, onChange }: GalleryImagesEditorProps) {
  const [draft, setDraft] = useState('')
  const [notice, setNotice] = useState('')
  const [dragging, setDragging] = useState<number | null>(null)
  const [over, setOver] = useState<number | null>(null)
  const pending = splitGalleryImages(draft)

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
    <div className="gallery-images-editor">
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
                <ImagePreview key={image} image={image} />
                {index === 0 && <span className="gallery-image-cover">Cover</span>}
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
      </div>
      <small className="gallery-image-hint" role={notice ? 'status' : undefined}>{notice || <>A bare key loads <code>media.samyabrata.codeium.xyz/&lt;key&gt;.jpeg</code>; a full URL is used as it is.</>}</small>
    </div>
  )
}
