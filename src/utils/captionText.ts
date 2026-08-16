// Plain-text form of the caption markup that CaptionContent.vue renders.
// Needed wherever the markup cannot be rendered as components: a share caption
// handed to X or WhatsApp, an alt string, a meta description.
//
// The token pattern is deliberately identical to the one in
// CaptionContent.vue — the two read the same authored strings, so a token added
// there needs a case added here.

const TOKEN_PATTERN = /\[\[([^[\]]+?)\]\]|\*\*([^*]+?)\*\*|\*([^*]+?)\*/g

/**
 * `[[Nirnoy|Person]]` → `Nirnoy`, `**bold**` → `bold`, `*italic*` → `italic`.
 * A link's visible label is always its first `|`-separated part, matching how
 * CaptionContent.vue picks the text to display.
 */
export function captionPlainText(text: string | undefined | null): string {
  if (!text) return ''

  return text
    .replace(TOKEN_PATTERN, (match, linkValue?: string, bold?: string, italic?: string) => {
      if (linkValue) return linkValue.split('|')[0].trim() || match
      return bold ?? italic ?? match
    })
    .replace(/\s+/g, ' ')
    .trim()
}
