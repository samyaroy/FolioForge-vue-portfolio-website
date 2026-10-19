import type { Plugin } from 'vite'
import { parse } from 'yaml'

/** Match the build-time content reader: date-only YAML values stay strings. */
export function contentYaml(): Plugin {
  return {
    name: 'blog-content-yaml',
    transform(source, id) {
      if (!/\.ya?ml$/.test(id)) return
      return { code: `export default ${JSON.stringify(parse(source))}`, map: null }
    },
  }
}
