// Trip covers uploaded from the Media Library. Each is re-encoded in the
// browser to shared/travel/tripCoverPolicy.js, the same policy the blog's
// fit-trip-covers script converts to, and the Worker refuses anything that is
// not a WebP within it.
import { TRIP_COVER_MAX_BYTES, TRIP_COVER_MAX_EDGE, TRIP_COVER_WEBP_QUALITY } from '../../../shared/travel/tripCoverPolicy.js'

/** Lower qualities tried, in turn, when a cover is still over the size cap. */
const FALLBACK_QUALITIES = [0.84, 0.78, 0.72]

function encode(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('This browser could not encode the cover.')), 'image/webp', quality)
  })
}

/**
 * The cover as the travel page wants it: a WebP with no edge over 4K and under
 * the size cap. Any format the browser can open is accepted and comes out as
 * WebP; the camera's rotation is applied, and location and other metadata do
 * not survive the re-encode. A browser that cannot write WebP (Safari, which
 * quietly hands back a PNG) is told so rather than uploading something else.
 */
export async function prepareTripCover(file: File): Promise<File> {
  let bitmap: ImageBitmap
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
  } catch {
    throw new Error(`${file.name} is not an image this browser can open.`)
  }
  const scale = Math.min(1, TRIP_COVER_MAX_EDGE / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  const context = canvas.getContext('2d')
  if (!context) throw new Error('This browser could not prepare the cover.')
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()

  let blob = await encode(canvas, TRIP_COVER_WEBP_QUALITY / 100)
  if (blob.type !== 'image/webp') {
    throw new Error('This browser cannot save WebP, so the cover was not uploaded. Use Chrome, Edge or Firefox for trip covers.')
  }
  for (const quality of FALLBACK_QUALITIES) {
    if (blob.size <= TRIP_COVER_MAX_BYTES) break
    blob = await encode(canvas, quality)
  }
  const stem = file.name.replace(/\.[^.]+$/, '') || 'cover'
  return new File([blob], `${stem}.webp`, { type: 'image/webp' })
}

/** Whether a trip's cover is already a WebP. */
export function isWebpCover(cover: unknown): boolean {
  return typeof cover === 'string' && /\.webp$/i.test(cover)
}
