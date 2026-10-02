import { useCallback, useEffect, useRef, useState } from 'react'
import { discardDraft, MediaRequestError, publishDraft, uploadImage } from '@/services/uploads'
import { galleryKeyOf, galleryPublishName, nextGalleryKey, prepareGalleryPhoto } from '@/lib/galleryPhotos'

export type PendingPhoto = {
  /** A local copy to show while the photo is not on the media host yet. */
  previewUrl: string
  state: 'preparing' | 'uploading' | 'ready' | 'failed'
  /** The staged upload, once the Worker has accepted it. */
  draft?: string
  error?: string
}

type GalleryUploadsOptions = {
  /** The entry's id, which its photos are named after. */
  id: string
  /** Keys the entry already lists, so a new photo takes a name nothing else has. */
  images: readonly string[]
  /** Changes the entry's list of images. */
  updateImages: (change: (images: string[]) => string[]) => void
}

/**
 * Photos added to a gallery entry from the editor. A photo is prepared and
 * staged as soon as it is picked, but published to the media host only when
 * the entry is saved: closing the editor or removing the photo first discards
 * it, so nothing reaches the bucket that no entry names.
 */
export function useGalleryUploads({ id, images, updateImages }: GalleryUploadsOptions) {
  const [photos, setPhotos] = useState<Record<string, PendingPhoto>>({})
  // Read from callbacks that outlive the render that made them.
  const latest = useRef(photos)
  useEffect(() => { latest.current = photos }, [photos])
  // Names handed out but perhaps not rendered yet, so two quick picks never
  // receive the same one.
  const reserved = useRef(new Set<string>())
  const controllers = useRef(new Map<string, AbortController>())

  const change = (key: string, next: Partial<PendingPhoto>) => {
    setPhotos(current => current[key] ? { ...current, [key]: { ...current[key], ...next } } : current)
  }

  // Touches only refs, so one copy serves every render.
  const discard = useCallback((key: string, photo: PendingPhoto) => {
    controllers.current.get(key)?.abort()
    controllers.current.delete(key)
    reserved.current.delete(key)
    URL.revokeObjectURL(photo.previewUrl)
    if (photo.draft) void discardDraft(photo.draft).catch(() => undefined)
  }, [])

  // Whatever is still staged when the editor closes was never saved.
  useEffect(() => () => {
    for (const [key, photo] of Object.entries(latest.current)) discard(key, photo)
  }, [discard])

  const upload = (files: File[]) => {
    const taken = new Set([...images, ...reserved.current])
    for (const file of files) {
      const key = nextGalleryKey(id.trim(), taken)
      taken.add(key)
      reserved.current.add(key)
      const controller = new AbortController()
      controllers.current.set(key, controller)
      const original = URL.createObjectURL(file)
      setPhotos(current => ({ ...current, [key]: { previewUrl: original, state: 'preparing' } }))
      updateImages(list => [...list, key])
      void (async () => {
        try {
          const prepared = await prepareGalleryPhoto(file)
          if (controller.signal.aborted) return
          // The prepared copy is what will be published, and one every browser
          // can show, which a HEIC original is not.
          const previewUrl = URL.createObjectURL(prepared)
          URL.revokeObjectURL(original)
          change(key, { state: 'uploading', previewUrl })
          const draft = await uploadImage(prepared, controller.signal)
          change(key, { state: 'ready', draft: draft.name })
        } catch (error) {
          if (controller.signal.aborted) return
          change(key, { state: 'failed', error: error instanceof Error ? error.message : 'The upload failed.' })
        } finally {
          controllers.current.delete(key)
        }
      })()
    }
  }

  /** Let go of photos the entry no longer lists. */
  const prune = (kept: readonly string[]) => {
    const keep = new Set(kept)
    const dropped = Object.entries(latest.current).filter(([key]) => !keep.has(key))
    if (!dropped.length) return
    for (const [key, photo] of dropped) discard(key, photo)
    setPhotos(current => Object.fromEntries(Object.entries(current).filter(([key]) => keep.has(key))))
  }

  /**
   * Publish every staged photo the entry lists, and return the list as it
   * should be saved. A name the media host already has moves the photo to the
   * next free one rather than replacing what is there.
   */
  const publishAll = async (listed: readonly string[]): Promise<string[]> => {
    const pending = listed.filter(key => latest.current[key])
    const unfinished = pending.find(key => latest.current[key].state !== 'ready')
    if (unfinished) {
      throw new Error(latest.current[unfinished].state === 'failed'
        ? `The photo ${unfinished} did not upload. Remove it, or add it again.`
        : 'Wait for the photos to finish uploading.')
    }
    const taken = new Set(listed)
    const renamed = new Map<string, string>()
    for (const key of pending) {
      const photo = latest.current[key]
      let candidate = key
      for (let attempt = 0; ; attempt += 1) {
        try {
          const published = await publishDraft(photo.draft!, galleryPublishName(candidate), false)
          renamed.set(key, galleryKeyOf(published.key))
          break
        } catch (error) {
          if (!(error instanceof MediaRequestError && error.code === 'media_exists') || attempt >= 20) throw error
          taken.add(candidate)
          candidate = nextGalleryKey(id.trim(), taken)
        }
      }
      // Published, so it is the entry's now and must not be discarded.
      const to = renamed.get(key)!
      if (to !== key) updateImages(list => list.map(item => item === key ? to : item))
      reserved.current.delete(key)
      URL.revokeObjectURL(photo.previewUrl)
      setPhotos(current => Object.fromEntries(Object.entries(current).filter(([item]) => item !== key)))
      latest.current = Object.fromEntries(Object.entries(latest.current).filter(([item]) => item !== key))
    }
    return listed.map(key => renamed.get(key) ?? key)
  }

  return { photos, upload, prune, publishAll, pending: Object.keys(photos).length > 0 }
}
