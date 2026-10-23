// Bones for the Home view; imported by views/Home/index.vue. See ./load.ts.
import { registerBoneFiles } from './load'

registerBoneFiles(import.meta.glob('./home-*.bones.json', { eager: true, import: 'default' }))
