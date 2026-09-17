// Some entry values are small objects rather than text: a project's `guide`
// is a person, an article's `publication` is a venue. The dialog would fall
// back to raw JSON for those, so each is edited as its declared sub-fields.
// The first field in the list is the head — the one its card prints first —
// and the rest are meaningless without it.
export type ObjectFieldsDraft = Record<string, string>

export function objectFieldsDraft(value: unknown, fields: readonly string[]): ObjectFieldsDraft {
  const source = value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {}
  const extras = Object.keys(source).filter(key => !fields.includes(key))
  return Object.fromEntries([...fields, ...extras].map(key => [key, source[key] === undefined || source[key] === null ? '' : String(source[key])]))
}

export function serializeObjectFields(draft: ObjectFieldsDraft, original: unknown, fields: readonly string[], label: string): unknown {
  const filled = Object.entries(draft).map(([key, value]) => [key, value.trim()] as const).filter(([, value]) => value)
  const head = fields[0]
  if (head && filled.some(([key]) => key !== head) && !draft[head]?.trim()) {
    throw new Error(`Enter the ${label} ${head} before saving.`)
  }
  // Emptied entirely, it is written as a blank key, as the YAML does.
  if (!filled.length) return original === undefined ? undefined : null
  return Object.fromEntries(filled)
}
