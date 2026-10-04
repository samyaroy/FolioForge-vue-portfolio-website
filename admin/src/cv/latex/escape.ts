/**
 * Making authored text safe to place in a LaTeX document.
 *
 * Escaping is what stops authored text from becoming LaTeX commands, so every
 * string that reaches a template passes through here. Characters the template's
 * fonts cannot set are refused, naming the character, rather than vanishing
 * from the PDF or failing the compile somewhere far from their cause.
 */

const SPECIALS: Readonly<Record<string, string>> = {
  '\\': '\\textbackslash{}',
  '{': '\\{',
  '}': '\\}',
  '$': '\\$',
  '&': '\\&',
  '#': '\\#',
  '^': '\\textasciicircum{}',
  '_': '\\_',
  '%': '\\%',
  '~': '\\textasciitilde{}',
  '<': '\\textless{}',
  '>': '\\textgreater{}',
}

/** Characters beyond ASCII that pdfLaTeX's default fonts set, and how. */
const UNICODE: Readonly<Record<string, string>> = {
  ' ': '~',
  '±': '$\\pm$',
  '²': '\\textsuperscript{2}',
  '³': '\\textsuperscript{3}',
  '×': '$\\times$',
  '–': '--',
  '—': '---',
  '‘': '`',
  '’': "'",
  '“': '``',
  '”': "''",
  '•': '$\\bullet$',
  '…': '\\ldots{}',
  '≈': '$\\approx$',
  '≤': '$\\leq$',
  '≥': '$\\geq$',
}

/** Accented Latin letters, which LaTeX's own UTF-8 support composes. */
const LATIN_LETTER = /^[À-ÖØ-öø-ÿ]$/

export class UnsupportedCharacterError extends Error {}

export function escapeText(text: string): string {
  let escaped = ''
  for (const char of text) {
    if (Object.hasOwn(SPECIALS, char)) escaped += SPECIALS[char]
    else if (char === '\n' || char === '\r' || char === '\t') escaped += ' '
    else if (char >= ' ' && char <= '~') escaped += char
    else if (Object.hasOwn(UNICODE, char)) escaped += UNICODE[char]
    else if (LATIN_LETTER.test(char)) escaped += char
    else {
      const code = char.codePointAt(0)?.toString(16).toUpperCase().padStart(4, '0')
      throw new UnsupportedCharacterError(`"${char}" (U+${code}) cannot be set by the template's fonts.`)
    }
  }
  return escaped
}

/**
 * A URL as `\href`'s first argument, or undefined when it may not be a link.
 * Only https and mailto pass, so a `javascript:` address never becomes a link
 * annotation in a published PDF. hyperref turns `\%`, `\#`, `\&` and `\_` back
 * into the plain characters, even inside another command's argument or a
 * table cell; the few characters it cannot are percent-encoded first.
 */
export function hrefTarget(url: string): string | undefined {
  let parsed: URL
  try {
    parsed = new URL(url.trim())
  } catch {
    return undefined
  }
  if (parsed.protocol !== 'https:' && parsed.protocol !== 'mailto:') return undefined
  return parsed.href
    .replace(/[{}\\^$`]/g, char => `%${char.charCodeAt(0).toString(16).toUpperCase()}`)
    .replace(/[%#&_]/g, char => `\\${char}`)
}
