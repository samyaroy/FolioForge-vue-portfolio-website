// Bones for the app shell, rendered on every route by App.vue. Page-specific
// bones live in ./home.ts and ./gallery.ts; see ./load.ts for why.
import { configureBoneyard, type AnimationStyle } from 'boneyard-js/vue'
import boneyardConfig from '../../boneyard.config.json'
import { registerBoneFiles } from './load'

configureBoneyard({
  color: boneyardConfig.color,
  darkColor: boneyardConfig.darkColor,
  animate: boneyardConfig.animate as AnimationStyle,
  transition: boneyardConfig.transition,
})

registerBoneFiles(import.meta.glob('./page-shell.bones.json', { eager: true, import: 'default' }))
