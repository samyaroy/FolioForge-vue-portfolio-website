import type { EntryField } from '../../../src/config/entryFields.ts'

type ScalarField = Extract<EntryField, { type: string }>

export function scalarFieldsOf(fields: readonly EntryField[]): Record<string, ScalarField> {
  return Object.fromEntries(fields.flatMap(field => typeof field !== 'string' && 'type' in field ? [[field.key, field]] : []))
}

/** Preserve the YAML types expected by the public blog, including new fields. */
export function serializeScalarField(value: string, field: ScalarField): unknown {
  const text = value.trim()
  if (!text) return undefined
  if (field.type === 'boolean') {
    if (text !== 'true' && text !== 'false') throw new Error(`Choose Yes or No for ${field.key}.`)
    return text === 'true'
  }
  if (field.type === 'number') {
    const number = Number(text)
    if (!Number.isSafeInteger(number) || (field.min !== undefined && number < field.min) || (field.max !== undefined && number > field.max)) {
      throw new Error(`Enter a whole number${field.min !== undefined ? ` from ${field.min} to ${field.max}` : ''} for ${field.key}.`)
    }
    return number
  }
  if (field.type === 'date') {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(text) || !Number.isFinite(Date.parse(text)) || new Date(text).toISOString().slice(0, 10) !== text) {
      throw new Error(`Enter a valid date for ${field.key}.`)
    }
    return text
  }
  if (field.type === 'json-array' || (field.type === 'text-or-list' && text.startsWith('['))) {
    const list: unknown = JSON.parse(text)
    if (!Array.isArray(list)) throw new Error(`Enter a JSON list for ${field.key}.`)
    if (field.type === 'text-or-list' && list.some(item => typeof item !== 'string' || !item.trim())) {
      throw new Error(`Every ${field.key} item must be nonempty text.`)
    }
    if (field.key === 'cities' && list.some(city => !city || typeof city !== 'object' || typeof city.name !== 'string' || !city.name.trim())) {
      throw new Error('Enter a name for every city.')
    }
    return list
  }
  return value
}
