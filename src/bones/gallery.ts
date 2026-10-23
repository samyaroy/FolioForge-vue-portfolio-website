// Bones for the gallery cards; imported by views/Gallery/components/GalleryCard.vue. See ./load.ts.
import { registerBoneFiles } from './load'

registerBoneFiles(import.meta.glob('./gallery-card-*.bones.json', { eager: true, import: 'default' }))
