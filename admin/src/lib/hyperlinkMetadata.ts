import hyperlinkYaml from '../../../src/metadata/hyperlinkMetadata.yml'

// SmartLink resolves a name or alias to a URL through this file: Institute
// entries carry `Website`, Person entries `Link`. A misspelled key leaves the
// entry unresolvable, which is what `issues` reports.
export type HyperlinkGroup = 'Institute' | 'Person'

export type HyperlinkEntry = {
  id: string
  group: HyperlinkGroup
  name: string
  aliases: string[]
  url: string
  issues: string[]
}

const URL_KEYS: Record<HyperlinkGroup, string> = { Institute: 'Website', Person: 'Link' }

function text(value: unknown): string {
  return value === undefined || value === null ? '' : String(value)
}

export function hyperlinkEntries(): HyperlinkEntry[] {
  const document = hyperlinkYaml as Record<string, unknown>
  return (Object.keys(URL_KEYS) as HyperlinkGroup[]).flatMap(group => {
    const items = Array.isArray(document[group]) ? document[group] as unknown[] : []
    return items.map((item, index) => {
      const record = item && typeof item === 'object' ? item as Record<string, unknown> : {}
      const urlKey = URL_KEYS[group]
      const name = text(record.Name)
      const url = text(record[urlKey])
      const known = new Set(['Name', 'Aliases', urlKey])
      const issues = [
        ...(name ? [] : ['No Name']),
        ...(url ? [] : [`No ${urlKey}`]),
        ...Object.keys(record).filter(key => !known.has(key)).map(key => `Unknown key "${key}"`),
      ]
      return {
        id: `${group}-${index}`,
        group,
        name,
        aliases: Array.isArray(record.Aliases) ? record.Aliases.map(text).filter(Boolean) : [],
        url,
        issues,
      }
    })
  })
}

export function serializeHyperlinkEntry(entry: HyperlinkEntry) {
  const urlKey = URL_KEYS[entry.group]
  const aliases = entry.aliases.map(alias => alias.trim()).filter(Boolean)
  return {
    Name: entry.name.trim(),
    ...(aliases.length ? { Aliases: aliases } : {}),
    [urlKey]: entry.url.trim(),
  }
}
