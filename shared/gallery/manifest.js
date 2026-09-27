import YAML from 'yaml'

/**
 * Renders `galleryImageManifest.yml` from the gallery content.
 *
 * This is the single definition of that mapping. The CLI in `scripts/` wraps it
 * with file reads and writes; the admin Worker calls it with the gallery it is
 * about to commit, so the generated file travels in the same commit as the
 * source it was derived from and the two never disagree in the repository.
 */

export const categoryOrder = [
  'Academic Milestone',
  'Event',
  'Guest Event',
  'Meetup',
  'Mentoring',
  'New Role and Internship',
  'Publication',
  'TechFest',
  'Workshop, Conference and Bootcamp',
  'Other',
]

const categoryMatchers = [
  { category: 'Academic Milestone', tags: ['academic milestone'] },
  { category: 'Guest Event', tags: ['guest event'] },
  { category: 'Meetup', tags: ['meetup'] },
  { category: 'Mentoring', tags: ['mentoring'] },
  { category: 'New Role and Internship', tags: ['new role', 'internship'] },
  { category: 'Publication', tags: ['new publication', 'article'] },
  { category: 'TechFest', tags: ['techfest'] },
  { category: 'Workshop, Conference and Bootcamp', tags: ['workshop', 'conference', 'bootcamp', 'confclave'] },
  { category: 'Event', tags: ['event'] },
]

function normalizeTag(value) {
  return String(value).trim().toLowerCase()
}

function getCategory(item) {
  const tags = Array.isArray(item.tags) ? item.tags.map(normalizeTag) : []
  const match = categoryMatchers.find(({ tags: expected }) => expected.some(tag => tags.includes(tag)))
  return match?.category || 'Other'
}

function getDescription(item) {
  return String(item.manifestDescription || item.title || item.id).replace(/\s+/g, ' ').trim()
}

function getTimestamp(value) {
  const timestamp = Date.parse(value)
  return Number.isNaN(timestamp) ? Number.NEGATIVE_INFINITY : timestamp
}

function quoteString(value) {
  return YAML.stringify(String(value)).trim()
}

/** Group the gallery's items by category, newest first within each. */
export function groupGalleryItems(gallery) {
  const items = Array.isArray(gallery?.items) ? gallery.items : []
  const grouped = new Map(categoryOrder.map(category => [category, []]))

  for (const item of items) {
    if (!item?.id) continue
    const category = getCategory(item)
    if (!grouped.has(category)) grouped.set(category, [])
    grouped.get(category).push({
      id: String(item.id),
      date: item.date ? String(item.date) : '',
      description: getDescription(item),
    })
  }

  for (const images of grouped.values()) {
    images.sort((first, second) => getTimestamp(second.date) - getTimestamp(first.date) || first.id.localeCompare(second.id))
  }
  return grouped
}

/** The manifest file's exact contents for a given gallery document. */
export function renderGalleryManifest(gallery) {
  const grouped = groupGalleryItems(gallery)
  const lines = [
    '# Auxiliary tracking manifest for Cloudflare gallery assets.',
    '# FULLY GENERATED from gallery.yml by scripts/sync-gallery-image-manifest.js — do not edit.',
    '# To change a description, set `manifestDescription` on the item in gallery.yml',
    '# (falls back to the item title when absent).',
    '',
    'categories:',
  ]

  for (const category of categoryOrder) {
    const images = grouped.get(category) || []
    if (!images.length) continue
    lines.push(`  - category: ${quoteString(category)}`)
    lines.push('    images:')
    images.forEach((image, index) => {
      if (index > 0) lines.push('')
      lines.push(`      - id: ${quoteString(image.id)}`)
      lines.push(`        date: ${quoteString(image.date)}`)
      lines.push(`        description: ${quoteString(image.description)}`)
    })
    lines.push('')
  }

  return `${lines.join('\n').trimEnd()}\n`
}
