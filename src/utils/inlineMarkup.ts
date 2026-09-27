// Emphasis in authored strings: **bold**, *italic*, __underline__.
//
// The first two are the forms gallery captions and the ribbon already use, so
// this puts the same spelling behind every field SmartLink renders rather than
// inventing a second dialect. Underline has no Markdown spelling, so __ takes
// it — a doubled delimiter, which leaves snake_case words alone.
//
// Parsing stays deliberately small: it produces text with marks attached, never
// HTML, so callers render real elements and nothing can inject markup.

export type Emphasis = {
  bold?: boolean
  italic?: boolean
  underline?: boolean
}

export type MarkedText = Emphasis & { text: string }

// Longest delimiter first, so ** is never read as two * and *** is never read
// as ** plus a stray *. The triple is its own case because bolding and then
// italicising the same words — which is what the editor's buttons do — spells
// them that way, and a lazy ** would otherwise pair with the wrong asterisk.
//
// Italic content may not open with a further *, so the empty pair the bold
// button types before you type the words, ****, stays the literal marks it is.
const EMPHASIS_PATTERN = /\*\*\*([\s\S]+?)\*\*\*|\*\*([\s\S]+?)\*\*|__([\s\S]+?)__|\*([^*][\s\S]*?)\*/g

/** Tag order is outermost first, so marks nest the same way every time. */
export const EMPHASIS_TAGS = [
  ['bold', 'strong'],
  ['italic', 'em'],
  ['underline', 'u'],
] as const

/**
 * Splits authored text into runs that each carry the marks covering them.
 *
 * Marks combine by nesting — `**__both__**` is bold and underlined — because
 * the inner text is parsed again with the outer mark already applied.
 */
export function splitEmphasis(text: string, inherited: Emphasis = {}): MarkedText[] {
  if (!text) return []

  const runs: MarkedText[] = []
  let lastIndex = 0

  for (const match of text.matchAll(EMPHASIS_PATTERN)) {
    const matchIndex = match.index ?? 0
    if (matchIndex > lastIndex) {
      runs.push({ ...inherited, text: text.slice(lastIndex, matchIndex) })
    }

    const [, boldItalic, bold, underline, italic] = match
    const marks: Array<keyof Emphasis> = boldItalic !== undefined
      ? ['bold', 'italic']
      : bold !== undefined ? ['bold'] : underline !== undefined ? ['underline'] : ['italic']
    const covered = { ...inherited }
    for (const mark of marks) covered[mark] = true
    // The inner text is strictly shorter, having lost its delimiters.
    runs.push(...splitEmphasis(boldItalic ?? bold ?? underline ?? italic, covered))
    lastIndex = matchIndex + match[0].length
  }

  if (lastIndex < text.length) {
    runs.push({ ...inherited, text: text.slice(lastIndex) })
  }

  return runs.filter(run => run.text)
}

/** The tags a run needs, outermost first. */
export function emphasisTags(run: Emphasis): string[] {
  return EMPHASIS_TAGS.filter(([mark]) => run[mark]).map(([, tag]) => tag)
}

/**
 * Whether text carries any emphasis, so callers can skip the work when not.
 * Its own non-global copy, because `test` on a global pattern carries an index
 * from call to call and would answer differently the second time.
 */
export function hasEmphasis(text: string | undefined | null): boolean {
  if (!text) return false
  return new RegExp(EMPHASIS_PATTERN.source).test(text)
}

/**
 * The text a reader sees, with the delimiters removed. Needed wherever marks
 * cannot be drawn — a table cell, a lookup key, a meta description.
 */
export function stripEmphasis(text: string | undefined | null): string {
  if (!text) return ''
  return splitEmphasis(text).map(run => run.text).join('')
}
