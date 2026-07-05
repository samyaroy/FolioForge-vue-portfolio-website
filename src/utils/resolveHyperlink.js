import links from '@/metadata/hyperlinkMetadata.yml'

// Mirrors SmartLink's lookup: exact (case-insensitive) match on Name/Aliases
// within a group of src/metadata/hyperlinkMetadata.yml. Returns '' when no
// entry matches, so callers can fall back to their own url.
export function resolveHyperlink(text, type = 'Institute') {
  const groups = links || {}
  const requestedType = normalize(type)
  const groupKey = Object.keys(groups).find(key => normalize(key) === requestedType)
  const candidates = groups[groupKey ?? 'Institute']
  const lookupValue = normalize(text)

  if (!lookupValue || !Array.isArray(candidates)) return ''

  const match = candidates.find(item =>
    Boolean(item) && [item.Name, ...(Array.isArray(item.Aliases) ? item.Aliases : [])]
      .some(name => typeof name === 'string' && normalize(name) === lookupValue)
  )

  return match?.Website || match?.Link || ''
}

function normalize(value) {
  return typeof value === 'string' ? value.trim().toLowerCase() : ''
}
