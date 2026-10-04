/**
 * A registry collection's entries from a parsed YAML document, read the way
 * the Worker addresses them: each array key is a dotted path, where `*` takes
 * every item of an outer list and `[field=value]` the item named so. See
 * `resolvePaths` in worker/content/entries.ts, which does the same on a
 * YAML document.
 */

function isMap(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function walk(node: unknown, segments: readonly string[]): unknown[] {
  if (!segments.length) return Array.isArray(node) ? node : []
  const [segment, ...rest] = segments
  if (segment === '*') return Array.isArray(node) ? node.flatMap(item => walk(item, rest)) : []
  const selector = /^([^[]+)\[([^=]+)=(.+)\]$/.exec(segment)
  if (selector) {
    const [, key, field, value] = selector
    const list = isMap(node) ? node[key] : undefined
    return walk(Array.isArray(list) ? list.find(item => isMap(item) && String(item[field]) === value) : undefined, rest)
  }
  return walk(isMap(node) ? node[segment] : undefined, rest)
}

export function collectionEntries(data: unknown, arrayKeys: readonly string[]): unknown[] {
  return arrayKeys.flatMap(key => walk(data, key.split('.')))
}

/** The ids a collection's entries carry, which is what a CV reference can name. */
export function entryIds(entries: readonly unknown[]): Set<string> {
  return new Set(entries.flatMap(entry => (isMap(entry) && typeof entry.id === 'string' ? [entry.id] : [])))
}
