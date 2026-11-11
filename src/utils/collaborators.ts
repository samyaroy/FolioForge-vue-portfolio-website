// Reads a `collaborators` value from the content files into names plus the
// contact links shown as icons beside each name. The names themselves are not
// links.
//
// Accepted shapes, all of which the content already uses:
//   collaborators: Jane Doe, John Roe                 one comma-separated string
//   collaborators: [Jane Doe, John Roe]               a list of names
//   collaborators:                                    rows, as the admin edits them
//     - name: Jane Doe
//       email: jane@example.com
//       linkedin: https://www.linkedin.com/in/jane    or just the handle, `jane`
//       orcid: 0000-0002-1825-0097                    the iD, or its orcid.org URL
//       link: https://example.com                     any other page
//
// `link` predates the dedicated keys, so a LinkedIn, ORCID or mailto URL there
// gets the matching icon rather than the generic one.

export type ContactKind = 'email' | 'linkedin' | 'orcid' | 'website'

export interface CollaboratorContact {
  kind: ContactKind
  href: string
  /** Read out by screen readers and shown as the tooltip. */
  label: string
}

export interface Collaborator {
  name: string
  contacts: CollaboratorContact[]
  key: string
}

const ORCID_ID = /^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/i
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const WEB_URL = /^https?:\/\//i

const text = (value: unknown): string => (typeof value === 'string' ? value.trim() : '')

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '').toLowerCase()
  } catch {
    return ''
  }
}

function isLinkedInHost(host: string): boolean {
  return host === 'linkedin.com' || host.endsWith('.linkedin.com')
}

function emailContact(value: unknown, name: string): CollaboratorContact | null {
  const address = text(value).replace(/^mailto:/i, '')
  return EMAIL.test(address) ? { kind: 'email', href: `mailto:${address}`, label: `Email ${name}` } : null
}

function linkedinContact(value: unknown, name: string): CollaboratorContact | null {
  const raw = text(value)
  if (!raw) return null
  const href = WEB_URL.test(raw) ? raw : `https://www.linkedin.com/in/${raw.replace(/^@/, '').replace(/^\/+|\/+$/g, '')}`
  return isLinkedInHost(hostOf(href)) ? { kind: 'linkedin', href, label: `${name} on LinkedIn` } : null
}

function orcidContact(value: unknown, name: string): CollaboratorContact | null {
  const raw = text(value)
  const id = WEB_URL.test(raw) && hostOf(raw) === 'orcid.org' ? new URL(raw).pathname.replace(/\//g, '') : raw
  return ORCID_ID.test(id)
    ? { kind: 'orcid', href: `https://orcid.org/${id.toUpperCase()}`, label: `${name}'s ORCID iD ${id.toUpperCase()}` }
    : null
}

function linkContact(value: unknown, name: string): CollaboratorContact | null {
  const raw = text(value)
  if (/^mailto:/i.test(raw)) return emailContact(raw, name)
  if (!WEB_URL.test(raw)) return null
  const host = hostOf(raw)
  if (isLinkedInHost(host)) return linkedinContact(raw, name)
  if (host === 'orcid.org') return orcidContact(raw, name)
  return host ? { kind: 'website', href: raw, label: `${name}'s website` } : null
}

function toCollaborator(entry: unknown, index: number): Collaborator | null {
  const row = entry && typeof entry === 'object' ? (entry as Record<string, unknown>) : null
  const name = row ? text(row.name) : text(entry)
  if (!name) return null

  const candidates = row
    ? [
        emailContact(row.email, name),
        linkedinContact(row.linkedin, name),
        orcidContact(row.orcid, name),
        linkContact(row.link ?? row.website ?? row.url, name),
      ]
    : []

  // One icon per destination, even when `link` repeats a dedicated key.
  const contacts = candidates.filter(
    (contact, i, all): contact is CollaboratorContact =>
      contact !== null && all.findIndex(other => other?.href === contact.href) === i,
  )
  return { name, contacts, key: `${name}-${index}` }
}

export function collaboratorList(value: unknown): Collaborator[] {
  const entries = Array.isArray(value) ? value : typeof value === 'string' ? value.split(',') : []
  return entries.map(toCollaborator).filter((person): person is Collaborator => person !== null)
}
