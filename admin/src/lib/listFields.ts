import { driveFieldMode, fromDriveEditorValue, toDriveEditorValue } from '@/lib/driveLinks'

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
// A declared column that holds such a value is kept the same way and shown as
// kept, never as an empty box whose save would delete it.
export type ListFieldsRow = Record<string, string>

/** Remembers which item a row came from, so the rest of it can be preserved. */
const ORIGIN = '__origin'
/** Marks a column whose value is not text; it holds how many items it lists. */
const KEPT = '__kept:'
/** Names a row added in the editor, which has no item to come from. */
const ADDED = '__added'

/** Keys the editor uses for its own bookkeeping, never written to the file. */
function isBookkeeping(key: string): boolean {
  return key.startsWith('__')
}

/** The last segment of a column, which is what decides a Drive link's form. */
function leafKey(column: string): string {
  return column.slice(column.lastIndexOf('.') + 1)
}

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
  // A value can still be the one comma-separated cell this list grew out of —
  // "Ada Lovelace, Alan Turing" — which the site reads as a list too. Split it
  // into rows rather than showing nothing and saving the names away.
  const items = Array.isArray(value)
    ? value
    : typeof value === 'string' ? value.split(',').map(name => name.trim()).filter(Boolean) : []
  return items.map((item, index) => {
    const source = item && typeof item === 'object' && !Array.isArray(item)
      ? item as Record<string, unknown>
      : { [fields[0]]: item }
    const row: ListFieldsRow = {}
    for (const column of columnsOf(source, fields)) {
      const found = readPath(source, column)
      // A non-scalar is left to the merge on save; reading it as text would
      // turn a credential list into "[object Object]".
      if (found && typeof found === 'object') row[`${KEPT}${column}`] = String(Array.isArray(found) ? found.length : 1)
      // A Drive link is edited as its file ID, as it is outside a list.
      row[column] = isScalar(found) ? String(driveFieldMode(leafKey(column), found) ? toDriveEditorValue(found) : found) : ''
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
      if (isBookkeeping(column) || row[`${KEPT}${column}`] !== undefined) continue
      const text = value.trim()
      const key = leafKey(column)
      writePath(base, column, driveFieldMode(key, readPath(source, column)) ? String(fromDriveEditorValue(text, readPath(source, column), key)) : text)
    }
    return prune(base)
  }).filter(row => Object.keys(row).length)

  if (head && built.some(row => !readPath(row, head))) {
    throw new Error(`Enter a ${head.split('.').pop()} for each ${label} entry before saving.`)
  }
  if (!built.length) return original === undefined ? undefined : null
  return built
}

/** Columns the editor should draw; the bookkeeping keys are not among them. */
export function visibleColumns(row: ListFieldsRow | undefined, fields: readonly string[]): string[] {
  const keys = Object.keys(row ?? {}).filter(key => !isBookkeeping(key))
  return keys.length ? keys : [...fields]
}

/**
 * How many items a column lists when it is not text and so is kept as it is,
 * or undefined when the column is ordinary text.
 */
export function keptCount(row: ListFieldsRow, column: string): number | undefined {
  const count = row[`${KEPT}${column}`]
  return count === undefined ? undefined : Number(count)
}

export function blankRow(columns: readonly string[]): ListFieldsRow {
  return { ...Object.fromEntries(columns.map(column => [column, ''])), [ADDED]: crypto.randomUUID() }
}

/**
 * A key that stays with a row when the rows around it are removed, so what a
 * row's controls remember does not pass to the row that moves into its place.
 */
export function rowKey(row: ListFieldsRow, index: number): string {
  return row[ORIGIN] !== undefined ? `item-${row[ORIGIN]}` : row[ADDED] ?? `row-${index}`
}
