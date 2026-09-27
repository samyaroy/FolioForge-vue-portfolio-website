/**
 * The identity a deep link uses when content has no id of its own.
 *
 * Titles and semester names are what other content already refers to, so the
 * slug is derived from them on both sides of a link rather than stored. A name
 * edited on one side and not the other stops matching, and the link falls back
 * to the page rather than breaking.
 */
export function slugify(value: unknown): string {
  return String(value ?? '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '') // combining marks left by NFKD
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}
