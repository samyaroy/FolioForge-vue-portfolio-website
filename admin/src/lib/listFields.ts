// Entry values that are a list of small objects: the students on a mentored
// project, say. Each row is edited as its declared columns, and as with
// objectFields the first column is the head — a row is nothing without it.
export type ListFieldsRow = Record<string, string>

export function listFieldsDraft(value: unknown, fields: readonly string[]): ListFieldsRow[] {
  if (!Array.isArray(value)) return []
  return value.map(item => {
    const source = item && typeof item === 'object' && !Array.isArray(item) ? item as Record<string, unknown> : { [fields[0]]: item }
    const extras = Object.keys(source).filter(key => !fields.includes(key))
    return Object.fromEntries([...fields, ...extras].map(key => [key, source[key] === undefined || source[key] === null ? '' : String(source[key])]))
  })
}

export function serializeListFields(rows: ListFieldsRow[], original: unknown, fields: readonly string[], label: string): unknown {
  const head = fields[0]
  const filled = rows
    .map(row => Object.fromEntries(Object.entries(row).map(([key, value]) => [key, value.trim()])))
    .filter(row => Object.values(row).some(Boolean))

  if (head && filled.some(row => !row[head])) throw new Error(`Enter a ${head} for each ${label} entry before saving.`)
  if (!filled.length) return original === undefined ? undefined : null
  // Blank columns are dropped so a row carries only what was filled in.
  return filled.map(row => Object.fromEntries(Object.entries(row).filter(([, value]) => value)))
}
