import fs from 'node:fs'
import path from 'node:path'
import YAML from 'yaml'

const galleryPath = path.resolve('src/content/profile_info/gallery.yml')
const manifestPath = path.resolve('src/content/galleryImageManifest.yml')

const categoryOrder = [
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

const gallery = readYaml(galleryPath)
const items = Array.isArray(gallery?.items) ? gallery.items : []
const groupedItems = new Map(categoryOrder.map(category => [category, []]))

items
  .filter(item => item?.id)
  .forEach((item) => {
    const category = getCategory(item)

    if (!groupedItems.has(category)) groupedItems.set(category, [])

    groupedItems.get(category).push({
      id: String(item.id),
      date: item.date ? String(item.date) : '',
      description: getDescription(item),
    })
  })

for (const images of groupedItems.values()) {
  images.sort((firstItem, secondItem) => (
    getTimestamp(secondItem.date) - getTimestamp(firstItem.date)
    || firstItem.id.localeCompare(secondItem.id)
  ))
}

const output = renderManifest(groupedItems)
fs.writeFileSync(manifestPath, output)

function readYaml(filePath) {
  return YAML.parse(fs.readFileSync(filePath, 'utf8'))
}

function getCategory(item) {
  const tags = Array.isArray(item.tags)
    ? item.tags.map(tag => normalizeTag(tag))
    : []

  const match = categoryMatchers.find(({ tags: expectedTags }) => (
    expectedTags.some(expectedTag => tags.includes(expectedTag))
  ))

  return match?.category || 'Other'
}

function normalizeTag(value) {
  return String(value).trim().toLowerCase()
}

function getDescription(item) {
  return String(item.manifestDescription || item.title || item.id)
    .replace(/\s+/g, ' ')
    .trim()
}

function getTimestamp(value) {
  const timestamp = Date.parse(value)
  return Number.isNaN(timestamp) ? Number.NEGATIVE_INFINITY : timestamp
}

function renderManifest(groupedItems) {
  const lines = [
    '# Auxiliary tracking manifest for Cloudflare gallery assets.',
    '# FULLY GENERATED from gallery.yml by scripts/sync-gallery-image-manifest.js — do not edit.',
    '# To change a description, set `manifestDescription` on the item in gallery.yml',
    '# (falls back to the item title when absent).',
    '',
    'categories:',
  ]

  categoryOrder.forEach((category) => {
    const images = groupedItems.get(category) || []
    if (!images.length) return

    lines.push(`  - category: ${quoteString(category)}`)
    lines.push('    images:')

    images.forEach((image, index) => {
      if (index > 0) lines.push('')

      lines.push(`      - id: ${quoteString(image.id)}`)
      lines.push(`        date: ${quoteString(image.date)}`)
      lines.push(`        description: ${quoteString(image.description)}`)
    })

    lines.push('')
  })

  return `${lines.join('\n').trimEnd()}\n`
}

function quoteString(value) {
  return YAML.stringify(String(value)).trim()
}
