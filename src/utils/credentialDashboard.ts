import { profileInfoSources } from '@/content/profile_info'

const CREDENTIAL_KEYS = new Set([
  'cred_link',
  'details_cred',
  'credential_link',
  'credentialLink',
  'certificate_link',
  'certificateLink',
])

type UnknownRecord = Record<string, unknown>

export interface CredentialLink {
  label: string
  url: string
}

export interface CredentialDashboardRow {
  id: string
  section: string
  item: string
  detail: string
  date: string
  source: string
  configPath: string
  links: CredentialLink[]
  hasLink: boolean
}

function isPlainObject(value: unknown): value is UnknownRecord {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function humanize(value: string): string {
  return value
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function stringify(value: unknown): string {
  if (value === null || value === undefined) return ''
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value).trim()
  }
  return ''
}

function compact(values: unknown[]): string {
  return values.map(stringify).filter(Boolean).join(' · ')
}

function displayName(node: UnknownRecord, ancestry: UnknownRecord[]): string {
  const direct = compact([
    node.title,
    node.role,
    node.name,
    node.course_name,
    node.company,
    node.institution,
  ])

  if (direct) return direct

  for (const ancestor of [...ancestry].reverse()) {
    const inherited = compact([ancestor.title, ancestor.role, ancestor.name, ancestor.course_name])
    if (inherited) return inherited
  }

  return 'Untitled credential'
}

function displayDetail(node: UnknownRecord): string {
  if (Array.isArray(node.institution)) {
    const institutions = node.institution
      .map((entry) => (isPlainObject(entry) ? stringify(entry.name) : stringify(entry)))
      .filter(Boolean)
      .join(', ')
    if (institutions) return institutions
  }

  if (isPlainObject(node.issuer)) {
    return compact([node.issuer.institution, node.issuer.platform])
  }

  return compact([node.company, node.host, node.type, node.mode])
}

function displayDate(node: UnknownRecord): string {
  return compact([node.date, node.time_period, node.duration])
}

function sectionFromPath(path: string[]): string {
  const firstMeaningful = path.find((part) => Number.isNaN(Number(part)))
  return firstMeaningful ? humanize(firstMeaningful) : 'Portfolio'
}

function credentialLinksFrom(value: unknown, fallbackLabel: string): CredentialLink[] {
  if (typeof value === 'string') {
    const url = value.trim()
    return url ? [{ label: humanize(fallbackLabel), url }] : []
  }

  if (isPlainObject(value)) {
    return Object.entries(value).flatMap(([label, nested]) => credentialLinksFrom(nested, label))
  }

  if (Array.isArray(value)) {
    return value.flatMap((nested, index) => credentialLinksFrom(nested, `${fallbackLabel} ${index + 1}`))
  }

  return []
}

function collectFromNode(
  node: unknown,
  source: string,
  path: string[],
  ancestry: UnknownRecord[],
  rows: CredentialDashboardRow[],
): void {
  if (Array.isArray(node)) {
    node.forEach((item, index) =>
      collectFromNode(item, source, [...path, String(index + 1)], ancestry, rows),
    )
    return
  }

  if (!isPlainObject(node)) return

  const credentialEntries = Object.entries(node).filter(([key]) => CREDENTIAL_KEYS.has(key))
  if (credentialEntries.length) {
    const links = credentialEntries.flatMap(([key, value]) => credentialLinksFrom(value, key))

    rows.push({
      id: `${source}:${path.join('.')}`,
      section: sectionFromPath(path),
      item: displayName(node, ancestry),
      detail: displayDetail(node),
      date: displayDate(node),
      source,
      configPath: path.join('.'),
      links,
      hasLink: links.length > 0,
    })
  }

  const nextAncestry = [...ancestry, node]
  for (const [key, value] of Object.entries(node)) {
    if (CREDENTIAL_KEYS.has(key)) continue
    collectFromNode(value, source, [...path, key], nextAncestry, rows)
  }
}

export function getCredentialDashboardRows(): CredentialDashboardRow[] {
  const rows: CredentialDashboardRow[] = []

  for (const { source, data } of profileInfoSources) {
    collectFromNode(data, source, [], [], rows)
  }

  return rows.sort((a, b) =>
    a.section.localeCompare(b.section) ||
    a.item.localeCompare(b.item) ||
    a.source.localeCompare(b.source),
  )
}
