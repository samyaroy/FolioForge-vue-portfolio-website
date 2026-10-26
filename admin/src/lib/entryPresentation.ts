export type EntryPresentation = {
  titlePaths: string[]
  subtitlePaths: string[]
  fallbackTitle: string
  groupedBy?: string
}

function text(value: unknown): string {
  if (typeof value === 'string' || typeof value === 'number') return String(value)
  if (Array.isArray(value)) return value.map(text).filter(Boolean).join(', ')
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>
    return text(record.name ?? record.title ?? record.organization ?? record.institution)
  }
  return ''
}

export function entryPresentation(raw: Record<string, unknown>, presentation: EntryPresentation) {
  const read = (path: string) => text(path.split('.').reduce<unknown>((value, key) => value && typeof value === 'object' ? (value as Record<string, unknown>)[key] : undefined, raw))
  const roles = presentation.groupedBy ? raw[presentation.groupedBy] : undefined
  const groupedTitle = Array.isArray(roles)
    ? roles.map(role => role && typeof role === 'object' ? text(role.role) : '').filter(Boolean).join(' + ')
    : ''
  return {
    title: presentation.titlePaths.map(read).find(Boolean) || groupedTitle || presentation.fallbackTitle,
    subtitle: presentation.subtitlePaths.map(read).filter(Boolean).slice(0, 2).join(' · '),
  }
}
