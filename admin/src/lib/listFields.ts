// Entry values that are a list of small objects: the students on a mentored
// project, the roles held at one organisation. Each row is edited as its
// declared columns, and as with objectFields the first column is the head — a
// row is nothing without it.
//
// A column may name a nested value with a dotted path (`organization.name`),
// because content nests: an affiliation carries an organisation object rather
// than a flat name. Anything a row holds that is not a declared column — a
// credential list, a nested sequence — is carried across untouched rather than
// flattened into a string, which is what would happen if it were read as text.
export type ListFieldsRow = Record<string, string>

/** Remembers which item a row came from, so the rest of it can be preserved. */
const ORIGIN = '__origin'

function readPath(source: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>(
    (value, key) => (value && typeof value === 'object' ? (value as Record<string, unknown>)[key] : undefined),
    source,
  )
}

function writePath(target: Record<string, unknown>, path: string, value: string) {
  const keys = path.split('.')
  let cursor = target
  for (const key of keys.slice(0, -1)) {
    const next = cursor[key]
    cursor[key] = next && typeof next === 'object' && !Array.isArray(next) ? { ...(next as Record<string, unknown>) } : {}
    cursor = cursor[key] as Record<string, unknown>
  }
  const last = keys[keys.length - 1]
  if (value) cursor[last] = value
  else delete cursor[last]
}

/** Drop keys that ended up empty, so a cleared field leaves no husk behind. */
function prune(value: Record<string, unknown>): Record<string, unknown> {
  for (const [key, item] of Object.entries(value)) {
    if (item && typeof item === 'object' && !Array.isArray(item)) {
      const cleaned = prune(item as Record<string, unknown>)
      if (Object.keys(cleaned).length) value[key] = cleaned
      else delete value[key]
    }
  }
  return value
}

function isScalar(value: unknown): boolean {
  return value !== null && value !== undefined && typeof value !== 'object'
}

/** Declared columns, plus any plain extra key a row happens to carry. */
function columnsOf(source: Record<string, unknown>, fields: readonly string[]): string[] {
  const claimed = new Set(fields.map(field => field.split('.')[0]))
  const extras = Object.keys(source).filter(key => !claimed.has(key) && isScalar(source[key]))
  return [...fields, ...extras]
}

export function listFieldsDraft(value: unknown, fields: readonly string[]): ListFieldsRow[] {
  if (!Array.isArray(value)) return []
  return value.map((item, index) => {
    const source = item && typeof item === 'object' && !Array.isArray(item)
      ? item as Record<string, unknown>
      : { [fields[0]]: item }
    const row: ListFieldsRow = {}
    for (const column of columnsOf(source, fields)) {
      const found = readPath(source, column)
      // A non-scalar is left to the merge on save; reading it as text would
      // turn a credential list into "[object Object]".
      row[column] = isScalar(found) ? String(found) : ''
    }
    row[ORIGIN] = String(index)
    return row
  })
}

export function serializeListFields(rows: ListFieldsRow[], original: unknown, fields: readonly string[], label: string): unknown {
  const sources = Array.isArray(original) ? original : []
  const head = fields[0]

  const built = rows.map(row => {
    const source = sources[Number(row[ORIGIN])]
    // Start from what was there, so everything not on screen survives.
    const base: Record<string, unknown> = source && typeof source === 'object' && !Array.isArray(source)
      ? JSON.parse(JSON.stringify(source)) as Record<string, unknown>
      : {}
    for (const [column, value] of Object.entries(row)) {
      if (column === ORIGIN) continue
      writePath(base, column, value.trim())
    }
    return prune(base)
  }).filter(row => Object.keys(row).length)

  if (head && built.some(row => !readPath(row, head))) {
    throw new Error(`Enter a ${head.split('.').pop()} for each ${label} entry before saving.`)
  }
  if (!built.length) return original === undefined ? undefined : null
  return built
}

/** Columns the editor should draw; the bookkeeping key is not one of them. */
export function visibleColumns(row: ListFieldsRow | undefined, fields: readonly string[]): string[] {
  const keys = Object.keys(row ?? {}).filter(key => key !== ORIGIN)
  return keys.length ? keys : [...fields]
}

export function blankRow(columns: readonly string[]): ListFieldsRow {
  return Object.fromEntries(columns.map(column => [column, '']))
}
