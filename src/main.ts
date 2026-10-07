import { createApp } from 'vue'
import './style.css'
// Inter with its optical-size axis, so small text and headlines switch cuts the
// way SF Pro Text and Display do. Used on non-Apple devices; see style.css.
import '@fontsource-variable/inter/opsz.css'
// Configures boneyard-js and registers the app shell's skeleton. Page bones are
// registered by the pages that render them (see src/bones/load.ts), so the
// entry chunk no longer carries every page's skeleton data.
import './bones/shell'
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
