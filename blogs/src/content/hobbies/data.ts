// Typed accessors over data.yml. Edit the YAML file to add hobby tiles.
import raw from './data.yml'

export type HobbyTile = {
  label: string
  /** @mdi/font icon class, e.g. "mdi-camera". Used when no image is set. */
  icon?: string
  /** Optional Cloudflare media id. Builds a media.samyabrata.codeium.xyz image URL. */
  imageId?: string
  /** Optional picture path (from public/); takes precedence over the icon. */
  image?: string
  /** true renders the tile with the soft blue accent background. */
  tint?: boolean
}

const { tiles } = raw as { tiles: HobbyTile[] }

export const HOBBY_TILES: HobbyTile[] = tiles
