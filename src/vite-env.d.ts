/// <reference types="vite/client" />

// `.yml` imports are declared in src/content/profile_info/yml.d.ts.

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
