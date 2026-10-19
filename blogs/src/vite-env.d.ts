/// <reference types="vite/client" />

// scripts/content-yaml.ts turns `.yml` imports into plain objects at build
// time. Typed as `unknown` so each content module must pin its own shape.
declare module '*.yml' {
  const data: unknown
  export default data
}
