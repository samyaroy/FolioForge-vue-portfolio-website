/**
 * Per-entry publishing, in place of commenting a block out of the YAML.
 *
 * An entry with `enabled: false` is dropped before the site sees it, at any
 * depth, so a disabled education entry, project or ribbon message renders
 * exactly as a commented-out one did — but stays editable, and can be switched
 * back on from the admin. A missing key means enabled, so existing content and
 * anything hand-written keeps working untouched.
 */
export const ENTRY_ENABLED_KEY = 'enabled'

export function isEntryEnabled(entry: unknown): boolean {
  if (!entry || typeof entry !== 'object') return true
  return (entry as Record<string, unknown>)[ENTRY_ENABLED_KEY] !== false
}

export function withoutDisabledEntries<T>(value: T): T {
  if (Array.isArray(value)) return value.filter(isEntryEnabled).map(item => withoutDisabledEntries(item)) as T
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, withoutDisabledEntries(item)])) as T
  }
  return value
}
