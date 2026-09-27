import { fromDriveEditorValue, toDriveEditorValue } from './driveLinks.ts'

export type CredentialLinkDraft = { label: string; url: string }

type UnknownRecord = Record<string, unknown>

// `cred_link` is either one URL or a list of `{ label, url }` documents, which
// the site's DocumentViewer shows as tabs. Object keys mirror the aliases that
// viewer accepts.
function sourceLinks(value: unknown): { label: string; url: string }[] {
  const items = Array.isArray(value) ? value : value === undefined || value === null ? [] : [value]
  return items.flatMap(item => {
    if (typeof item === 'string') return [{ label: '', url: item }]
    if (!item || typeof item !== 'object') return []
    const record = item as UnknownRecord
    const url = [record.url, record.href, record.link, record.src].find(candidate => typeof candidate === 'string')
    const label = [record.label, record.title, record.name].find(candidate => typeof candidate === 'string')
    return [{ label: String(label ?? ''), url: String(url ?? '') }]
  }).filter(link => link.url.trim() && link.url.trim() !== '#')
}

export function credentialLinksDraft(value: unknown): CredentialLinkDraft[] {
  return sourceLinks(value).map(link => ({ label: link.label, url: String(toDriveEditorValue(link.url)) }))
}

export function serializeCredentialLinks(links: CredentialLinkDraft[], original: unknown): unknown {
  const filled = links.map(link => ({ label: link.label.trim(), url: link.url.trim() })).filter(link => link.label || link.url)
  if (filled.some(link => !link.url)) throw new Error('Enter a Drive file ID or URL for each credential before saving.')
  if (filled.length > 1 && filled.some(link => !link.label)) throw new Error('Enter a label for each credential when an entry has more than one.')

  // Match originals by file rather than position so a reordered or removed row
  // keeps each file's existing Drive format and resource key.
  const originalUrls = sourceLinks(original).map(link => link.url)
  const resolved = filled.map(link => ({
    label: link.label,
    url: String(fromDriveEditorValue(link.url, originalUrls.find(url => toDriveEditorValue(url) === link.url), 'cred_link')),
  }))

  if (!resolved.length) return original === undefined ? undefined : ''
  // A single unlabelled link stays a plain string, the shape existing YAML uses.
  if (resolved.length === 1 && !resolved[0].label) return resolved[0].url
  return resolved.map(({ label, url }) => label ? { label, url } : { url })
}
