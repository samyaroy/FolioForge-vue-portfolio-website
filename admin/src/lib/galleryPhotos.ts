// Photos uploaded from the Career Unlocks editor. Each is prepared in the
// browser to the limits scripts/fit-gallery-images.mjs checks the bucket
// against, so the pre-push run leaves it alone, and named after its entry the
// way the gallery's photos already are: `<id>`, then `<id>-01`, `<id>-02`.
import { GALLERY_PHOTO_JPEG_QUALITY, GALLERY_PHOTO_MAX_BYTES, GALLERY_PHOTO_MAX_EDGE } from '../../../shared/gallery/photoPolicy.js'

/** Lower qualities tried, in turn, when a photo is still over the size limit. */
const FALLBACK_QUALITIES = [0.72, 0.64, 0.56, 0.48]

function encode(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('This browser could not encode the photo.')), 'image/jpeg', quality)
  })
}

/**
 * The photo as the gallery wants it: a real JPEG, no edge over the limit, and
 * under the size budget. Any format the browser can open is accepted — an
 * iPhone HEIC in Safari included — and comes out as JPEG. The camera's
 * rotation is applied, transparency is laid on white rather than black, and
 * location and other metadata do not survive the re-encode.
 */
export async function prepareGalleryPhoto(file: File): Promise<File> {
  let bitmap: ImageBitmap
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
  } catch {
    throw new Error(`${file.name} is not an image this browser can open.`)
  }
  const scale = Math.min(1, GALLERY_PHOTO_MAX_EDGE / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  const context = canvas.getContext('2d')
  if (!context) throw new Error('This browser could not prepare the photo.')
  context.fillStyle = '#fff'
  context.fillRect(0, 0, canvas.width, canvas.height)
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()

  let blob = await encode(canvas, GALLERY_PHOTO_JPEG_QUALITY / 100)
  for (const quality of FALLBACK_QUALITIES) {
    if (blob.size <= GALLERY_PHOTO_MAX_BYTES) break
    blob = await encode(canvas, quality)
  }
  const stem = file.name.replace(/\.[^.]+$/, '') || 'photo'
  return new File([blob], `${stem}.jpg`, { type: 'image/jpeg' })
}

/** The next free name for an entry's photo: its id, then `<id>-01` onwards. */
export function nextGalleryKey(id: string, taken: Iterable<string>): string {
  const used = new Set(taken)
  if (!used.has(id)) return id
  for (let count = 1; ; count += 1) {
    const key = `${id}-${String(count).padStart(2, '0')}`
    if (!used.has(key)) return key
  }
}

/**
 * What a photo is published as. The gallery resolves a bare key to
 * `<key>.jpeg`, while a JPEG would otherwise be stored as `.jpg`, so the
 * extension is given explicitly.
 */
export function galleryPublishName(key: string): string {
  return `${key}.jpeg`
}

/** The bare key a published name stands for. */
export function galleryKeyOf(publishedKey: string): string {
  return publishedKey.replace(/\.jpeg$/i, '')
}
