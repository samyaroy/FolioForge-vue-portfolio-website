// Trip covers are served as WebP from blog-travel/<name>.webp, beside the
// original photo they were made from (some originals are over 10 MB).
// scripts/fit-trip-covers.mjs converts each original and points trips.yml at
// the WebP; the admin's trip cover uploader publishes straight to WebP. Both
// follow shared/travel/tripCoverPolicy.js, so they agree on what a cover is.
import {
  TRIP_COVER_FOLDER,
  TRIP_COVER_MAX_BYTES,
  TRIP_COVER_MAX_EDGE,
  TRIP_COVER_WEBP_QUALITY,
} from '../../../shared/travel/tripCoverPolicy.js'

export const MEDIA_BASE = 'https://media.samyabrata.codeium.xyz'

const TRAVEL_FOLDER = `${MEDIA_BASE}/${TRIP_COVER_FOLDER}`

/** Longest edge (4K UHD), WebP quality, and the size a cover may not exceed. */
export const TRIP_COVER = {
  maxEdge: TRIP_COVER_MAX_EDGE,
  quality: TRIP_COVER_WEBP_QUALITY,
  maxBytes: TRIP_COVER_MAX_BYTES,
}

/** Extensions an original may carry, tried in this order beside a WebP. */
const ORIGINAL_EXTENSIONS = ['jpeg', 'jpg', 'png']

/** The file name without its extension, for a cover directly in blog-travel/. */
function coverStem(cover: string): string | undefined {
  if (!cover.startsWith(TRAVEL_FOLDER)) return undefined
  const file = cover.slice(TRAVEL_FOLDER.length)
  if (!file || file.includes('/')) return undefined
  return file.replace(/\.[^.]+$/, '')
}

/**
 * Where the WebP of a cover lives on the media host (blog-travel/<name>.webp),
 * or undefined for a cover outside the blog-travel/ folder, which is left as it is.
 */
export function webpCoverUrl(cover: string): string | undefined {
  const stem = coverStem(cover)
  return stem ? `${TRAVEL_FOLDER}${stem}.webp` : undefined
}

/**
 * Where the original of a cover may be: the cover itself when it is not a
 * WebP yet, otherwise each name an original beside that WebP could have.
 */
export function originalCoverUrls(cover: string): string[] {
  const stem = coverStem(cover)
  if (!stem) return []
  if (!/\.webp$/i.test(cover)) return [cover]
  return ORIGINAL_EXTENSIONS.map((extension) => `${TRAVEL_FOLDER}${stem}.${extension}`)
}
