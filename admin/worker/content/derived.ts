// @ts-expect-error - shared JS module, typed by its use here
import { renderGalleryManifest } from '../../../shared/gallery/manifest.js'

/**
 * Files that are generated from content rather than authored.
 *
 * The gallery manifest is rendered from gallery.yml by the same shared function
 * the CLI uses, so the admin cannot produce a manifest that differs from the one
 * a local `npm run build` would. It travels in the same commit as the gallery it
 * came from: a commit where the two disagree is a state nothing should be able
 * to create.
 */
const GALLERY = 'src/content/profile_info/gallery.yml'
const GALLERY_MANIFEST = 'src/content/galleryImageManifest.yml'

/** Paths written only as a consequence of writing their source. */
export const generatedPaths: readonly string[] = [GALLERY_MANIFEST]

export function derivedFiles(sourcePath: string, data: unknown): { path: string; text: string }[] {
  if (sourcePath !== GALLERY) return []
  return [{ path: GALLERY_MANIFEST, text: renderGalleryManifest(data) as string }]
}
