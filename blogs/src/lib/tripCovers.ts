// Trip covers are full-size travel photos, some over 10 MB.
// scripts/fit-trip-covers.mjs makes a lighter copy of each one that keeps its
// definition (HD is the point of these photos), for loading the travel
// page's cards faster. The script and any future reader import this module,
// so they agree on where a copy lives and how it is made.

export const MEDIA_BASE = 'https://media.samyabrata.codeium.xyz'

const TRAVEL_FOLDER = `${MEDIA_BASE}/blog-travel/`

/** Copy settings: longest edge (4K UHD), mozjpeg quality (visually lossless),
    and the size a copy should never exceed. An original that already fits
    within the edge is kept as it is unless re-encoding clearly pays off. */
export const TRIP_COVER_CARD = { maxEdge: 3840, quality: 94, maxBytes: 10 * 1024 * 1024 }

/**
 * Where the card copy of a cover would live on the media host
 * (blog-travel/card/<name>.jpeg), or undefined for a cover outside the
 * blog-travel/ folder, which gets no copy.
 */
export function cardCoverUrl(cover: string): string | undefined {
  if (!cover.startsWith(TRAVEL_FOLDER)) return undefined
  const file = cover.slice(TRAVEL_FOLDER.length)
  if (!file || file.includes('/')) return undefined
  return `${TRAVEL_FOLDER}card/${file.replace(/\.[^.]+$/, '')}.jpeg`
}
