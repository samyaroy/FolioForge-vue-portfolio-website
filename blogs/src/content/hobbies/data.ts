// Typed accessors over data.yml. Edit the YAML file to add hobby tiles.
import raw from './data.yml'

export type HobbyTile = {
  label: string
  /** @mdi/font icon class, e.g. "mdi-camera". Rendered as the tile's front face. */
  icon?: string
  /**
   * Cloudflare media id, or a list of them. "hobby/hike1" resolves to
   * https://media.samyabrata.codeium.xyz/hobby/hike1.jpeg
   */
  imageId?: string | string[]
  /** Picture path (from public/), or a list of them. Ordered after imageId. */
  image?: string | string[]
  /** true renders the tile with the soft blue accent background. */
  tint?: boolean
}

const MEDIA_ORIGIN = 'https://media.samyabrata.codeium.xyz'

const { tiles } = raw as { tiles: HobbyTile[] }

export const HOBBY_TILES: HobbyTile[] = tiles

function toList(value?: string | string[]): string[] {
  if (!value) return []
  return Array.isArray(value) ? value : [value]
}

/** Media ids may contain slashes, so encode per path segment, not whole. */
function mediaUrl(id: string): string {
  const path = id.split('/').map(encodeURIComponent).join('/')
  return `${MEDIA_ORIGIN}/${path}.jpeg`
}

/**
 * Every picture for a tile, in display order: media ids first, then any
 * public/ paths. Empty for icon-only tiles.
 */
export function getTileImages(tile: HobbyTile): string[] {
  return [...toList(tile.imageId).map(mediaUrl), ...toList(tile.image)]
}
