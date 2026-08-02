// Lets TypeScript/editors understand `.yml` imports, which @modyfi/vite-plugin-yaml
// transforms into plain objects at build time.
declare module '*.yml' {
  // `any` is deliberate: these are hand-maintained content files with no
  // fixed schema, and every consumer indexes straight into them
  // (config.profile.name, config.contacts.gmail, ...). Narrowing to
  // `unknown` would only push a cast into each call site.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: Record<string, any>
  export default data
}
