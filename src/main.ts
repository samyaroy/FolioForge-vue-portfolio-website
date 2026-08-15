import { createApp } from 'vue'
import './style.css'
// Registers the boneyard-js skeleton definitions in src/bones/ so components
// can name a bone while their data loads. Extensionless on purpose: the CLI
// emits registry.ts, and pinning the extension here is how a stale registry.js
// from an older CLI kept being imported after a rebuild.
import './bones/registry'
import App from './App.vue'
import router from './router'

// Vuetify. Components and directives are resolved per-usage by
// vite-plugin-vuetify (see vite.config.ts), which scans templates and imports
// only what is referenced -- along with only those components' styles, which is
// where most of the CSS saving comes from. Registering them here with
// `import * as components` would pull the whole library back in and defeat it.
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import '@mdi/font/css/materialdesignicons.css'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faKaggle } from '@fortawesome/free-brands-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

library.add(faKaggle)

const vuetify = createVuetify()

createApp(App).use(router).use(vuetify).component('font-awesome-icon', FontAwesomeIcon).mount('#app')
