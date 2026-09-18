import { HttpError } from './http.ts'

/**
 * Format detection, dimension reading and metadata removal, done on the bytes
 * themselves. The browser's `accept` attribute and the declared content type
 * are both trivially forged, so nothing here trusts either: the signature in
 * the file decides what the file is, and a declared type that disagrees with it
 * is a rejection rather than a correction.
 */
export const imagePolicy = {
  maxBytes: 10 * 1024 * 1024,
  maxPixels: 25_000_000,
  minPixels: 1,
} as const

export type ImageKind = 'image/jpeg' | 'image/png' | 'image/webp'
export type InspectedImage = { contentType: ImageKind; extension: 'jpg' | 'png' | 'webp'; width: number; height: number; bytes: Uint8Array }

const EXTENSION: Record<ImageKind, 'jpg' | 'png' | 'webp'> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }

function reject(reason: string): never {
  throw new HttpError(415, 'unsupported_image', reason)
}

function ascii(bytes: Uint8Array, offset: number, length: number) {
  return String.fromCharCode(...bytes.subarray(offset, offset + length))
}

function sniff(bytes: Uint8Array): ImageKind {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'image/jpeg'
  if (bytes.length >= 8 && ascii(bytes, 1, 3) === 'PNG' && bytes[0] === 0x89) return 'image/png'
  if (bytes.length >= 12 && ascii(bytes, 0, 4) === 'RIFF' && ascii(bytes, 8, 4) === 'WEBP') return 'image/webp'
  // Named explicitly because it is the format most often smuggled in as an
  // image: SVG is a document and can carry script.
  if (ascii(bytes, 0, 5).toLowerCase() === '<?xml' || ascii(bytes, 0, 4).toLowerCase() === '<svg') reject('svg_not_accepted')
  reject('unrecognised_signature')
}

/* ------------------------------- dimensions ------------------------------ */

function pngSize(bytes: Uint8Array) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  if (bytes.length < 24 || ascii(bytes, 12, 4) !== 'IHDR') reject('png_header_unreadable')
  return { width: view.getUint32(16), height: view.getUint32(20) }
}

function jpegSize(bytes: Uint8Array) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  let offset = 2
  while (offset + 9 < bytes.length) {
    if (bytes[offset] !== 0xff) reject('jpeg_structure_unreadable')
    const marker = bytes[offset + 1]
    if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) { offset += 2; continue }
    const length = view.getUint16(offset + 2)
    if (length < 2) reject('jpeg_structure_unreadable')
    // Any start-of-frame carries the size; C4/C8/CC are tables, not frames.
    if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
      return { height: view.getUint16(offset + 5), width: view.getUint16(offset + 7) }
    }
    if (marker === 0xda) break
    offset += 2 + length
  }
  reject('jpeg_size_not_found')
}

function webpSize(bytes: Uint8Array) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  const kind = ascii(bytes, 12, 4)
  if (kind === 'VP8X' && bytes.length >= 30) {
    const width = 1 + (view.getUint8(24) | (view.getUint8(25) << 8) | (view.getUint8(26) << 16))
    const height = 1 + (view.getUint8(27) | (view.getUint8(28) << 8) | (view.getUint8(29) << 16))
    return { width, height }
  }
  if (kind === 'VP8 ' && bytes.length >= 30) {
    return { width: view.getUint16(26, true) & 0x3fff, height: view.getUint16(28, true) & 0x3fff }
  }
  if (kind === 'VP8L' && bytes.length >= 25) {
    const bits = view.getUint32(21, true)
    return { width: 1 + (bits & 0x3fff), height: 1 + ((bits >> 14) & 0x3fff) }
  }
  reject('webp_header_unreadable')
}

/* ---------------------------- metadata removal --------------------------- */

/** Drop EXIF and XMP, which is where a phone writes GPS coordinates. */
function stripJpeg(bytes: Uint8Array) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  const kept: Uint8Array[] = [bytes.subarray(0, 2)]
  let offset = 2
  while (offset + 4 <= bytes.length) {
    if (bytes[offset] !== 0xff) break
    const marker = bytes[offset + 1]
    if (marker === 0xda) { kept.push(bytes.subarray(offset)); break }
    const length = view.getUint16(offset + 2)
    if (length < 2 || offset + 2 + length > bytes.length) break
    const segment = bytes.subarray(offset, offset + 2 + length)
    // APP1 holds EXIF and XMP; COM is a free-text comment.
    if (marker !== 0xe1 && marker !== 0xfe) kept.push(segment)
    offset += 2 + length
  }
  return concat(kept)
}

const PNG_DROP = new Set(['eXIf', 'tEXt', 'iTXt', 'zTXt', 'tIME'])

function stripPng(bytes: Uint8Array) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  const kept: Uint8Array[] = [bytes.subarray(0, 8)]
  let offset = 8
  while (offset + 12 <= bytes.length) {
    const length = view.getUint32(offset)
    const type = ascii(bytes, offset + 4, 4)
    const end = offset + 12 + length
    if (end > bytes.length) break
    if (!PNG_DROP.has(type)) kept.push(bytes.subarray(offset, end))
    offset = end
    if (type === 'IEND') break
  }
  return concat(kept)
}

const WEBP_DROP = new Set(['EXIF', 'XMP '])

function stripWebp(bytes: Uint8Array) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  const kept: Uint8Array[] = []
  let offset = 12
  while (offset + 8 <= bytes.length) {
    const fourcc = ascii(bytes, offset, 4)
    const size = view.getUint32(offset + 4, true)
    const padded = size + (size % 2)
    const end = offset + 8 + padded
    if (end > bytes.length) break
    if (!WEBP_DROP.has(fourcc)) kept.push(bytes.subarray(offset, end))
    offset = end
  }
  const payload = concat(kept)
  const out = new Uint8Array(12 + payload.length)
  out.set(bytes.subarray(0, 12))
  out.set(payload, 12)
  // The RIFF length covers everything after the first eight bytes.
  new DataView(out.buffer).setUint32(4, out.length - 8, true)
  return out
}

function concat(parts: Uint8Array[]) {
  const total = parts.reduce((sum, part) => sum + part.length, 0)
  const out = new Uint8Array(total)
  let at = 0
  for (const part of parts) { out.set(part, at); at += part.length }
  return out
}

/* --------------------------------- entry --------------------------------- */

export function inspectImage(input: ArrayBuffer, declaredType: string | null): InspectedImage {
  const bytes = new Uint8Array(input)
  if (bytes.length === 0) reject('empty_body')
  if (bytes.length > imagePolicy.maxBytes) throw new HttpError(413, 'image_too_large', `bytes_${bytes.length}`)

  const contentType = sniff(bytes)
  // A declared type that disagrees with the bytes is a lie worth refusing, not
  // a mismatch worth silently fixing.
  const declared = (declaredType ?? '').split(';')[0].trim().toLowerCase()
  if (declared && declared !== contentType) reject('declared_type_mismatch')

  const { width, height } = contentType === 'image/png' ? pngSize(bytes) : contentType === 'image/jpeg' ? jpegSize(bytes) : webpSize(bytes)
  if (!Number.isFinite(width) || !Number.isFinite(height) || width < imagePolicy.minPixels || height < imagePolicy.minPixels) reject('dimensions_unreadable')
  if (width * height > imagePolicy.maxPixels) throw new HttpError(413, 'image_too_large', `pixels_${width * height}`)

  const stripped = contentType === 'image/png' ? stripPng(bytes) : contentType === 'image/jpeg' ? stripJpeg(bytes) : stripWebp(bytes)
  return { contentType, extension: EXTENSION[contentType], width, height, bytes: stripped }
}

export async function contentDigest(bytes: Uint8Array): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', bytes as unknown as ArrayBuffer)
  return [...new Uint8Array(digest)].map(value => value.toString(16).padStart(2, '0')).join('')
}
