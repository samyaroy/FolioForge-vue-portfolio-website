/// <reference types="vite/client" />

// `.yml` imports are declared in src/content/profile_info/yml.d.ts.

interface ImportMetaEnv {
  /**
   * Which deployment this build is for: 'beta' or 'stable'. Set per deployment
   * in the host's build settings (Cloudflare), never committed, so it survives
   * V1 -> main tree replacement the same way the hostname check does.
   * Unset is normal and falls back to hostname detection.
   * See src/config/siteEnvironment.ts.
   */
  readonly VITE_SITE_ENV?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// Vuetify's stylesheet entry is a bare specifier, not a .css path, so
// vite/client's `*.css` declaration doesn't cover this side-effect import.
declare module 'vuetify/styles'

// SFCs authored without `lang="ts"` still need a module shape for the compiler.
// The `any` is deliberate: the shim has to accept components with arbitrary
// props, and narrowing it would just push casts into every importer.
declare module '*.vue' {
    import type { DefineComponent } from 'vue'
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, any>
    export default component
}
