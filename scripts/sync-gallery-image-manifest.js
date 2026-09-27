import fs from 'node:fs'
import path from 'node:path'
import YAML from 'yaml'
import { renderGalleryManifest } from '../shared/gallery/manifest.js'

// A filesystem wrapper around the shared renderer, so this CLI and the admin
// Worker produce byte-identical manifests from the same gallery.
const galleryPath = path.resolve('src/content/profile_info/gallery.yml')
const manifestPath = path.resolve('src/content/galleryImageManifest.yml')

const gallery = YAML.parse(fs.readFileSync(galleryPath, 'utf8'))
fs.writeFileSync(manifestPath, renderGalleryManifest(gallery))
