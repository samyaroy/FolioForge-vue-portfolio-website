// Lets TypeScript/editors understand `.yml` imports, which @modyfi/vite-plugin-yaml
// transforms into plain objects at build time.
declare module '*.yml' {
  const data: Record<string, any>
  export default data
}
