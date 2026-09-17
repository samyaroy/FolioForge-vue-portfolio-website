// A project `guide` is a person: the card prints the name, then the title,
// department and institution it finds. Editing them as separate boxes beats the
// raw JSON the dialog falls back to for nested values.
export const guideFields = ['name', 'title', 'department', 'institution'] as const

export type GuideDraft = Record<string, string>

export function guideDraft(value: unknown): GuideDraft {
  const source = value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {}
  const extras = Object.keys(source).filter(key => !guideFields.includes(key as typeof guideFields[number]))
  return Object.fromEntries([...guideFields, ...extras].map(key => [key, source[key] === undefined || source[key] === null ? '' : String(source[key])]))
}

export function serializeGuide(draft: GuideDraft, original: unknown): unknown {
  const filled = Object.entries(draft).map(([key, value]) => [key, value.trim()] as const).filter(([, value]) => value)
  if (filled.some(([key]) => key !== 'name') && !draft.name?.trim()) throw new Error('Enter the guide name before saving.')
  // A guide with nothing in it is written as a blank key, as the YAML does.
  if (!filled.length) return original === undefined ? undefined : null
  return Object.fromEntries(filled)
}
