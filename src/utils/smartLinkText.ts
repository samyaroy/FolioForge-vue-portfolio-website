// Plain-text form of the inline link markup that SmartLink.vue renders.
// Needed wherever the markup cannot be rendered as components — the credentials
// dashboard lists authored strings in plain table cells, so the delimiters
// would otherwise show up as literal characters.
//
// The two forms below are deliberately the same ones as INLINE_LINK_PATTERN in
// SmartLink.vue — both read the same authored strings, so a form added there
// needs a case added here.

/** `[Upatto](https://…)` → `Upatto`. */
const EXPLICIT_LINK_PATTERN = /\[([^\]]+)\]\((?:https?:\/\/[^\s)]+)\)/g

/** Backticked name, looked up in hyperlinkMetadata.yml on the site. */
const LOOKUP_LINK_PATTERN = /`([^`]+)`/g

/**
 * Reduces both link forms to the text a reader actually sees, and collapses the
 * whitespace that removing a delimiter can leave behind.
 */
export function smartLinkPlainText(text: string | undefined | null): string {
  if (!text) return ''

  return text
    .replace(EXPLICIT_LINK_PATTERN, '$1')
    .replace(LOOKUP_LINK_PATTERN, '$1')
    .replace(/\s+/g, ' ')
    .trim()
}
