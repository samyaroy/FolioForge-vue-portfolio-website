const formatter = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
})

/**
 * The one date format used across the site, e.g. "June 18, 2026".
 * Date-only strings (YYYY-MM-DD) are parsed as local dates so the rendered
 * day never shifts across timezones; unparseable input is shown as-is.
 */
export function formatDate(value: string | undefined): string {
  if (!value) return ''

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split('-').map(Number)
    return formatter.format(new Date(year, month - 1, day))
  }

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : formatter.format(date)
}
