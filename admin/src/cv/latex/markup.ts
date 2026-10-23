import { splitEmphasis } from '../../../../src/utils/inlineMarkup.ts'
import { stripCrossReference } from '../../../../src/utils/crossReference.ts'
import { escapeText, hrefTarget } from './escape.ts'

/**
 * Authored markup to LaTeX. The site's own parsers decide what counts as
 * emphasis and as a cross-reference, so a CV recognises exactly the markup the
 * site renders. The link forms are the two `smartLinkPlainText` knows
 * (src/utils/smartLinkText.ts), which is the module to follow if SmartLink
 * gains another; that module itself is not imported because its imports carry
 * no extension, which Node and the Worker cannot resolve.
 */

// `[label](https://…)`, a backticked name, and the caption form `[[Visible|…]]`.
const INLINE = /\[\[([^\]|]+)(?:\|[^\]]*)?\]\]|\[([^\]]+)\]\(([^)\s]+)\)|`([^`]+)`/g

const WRAPPERS = { bold: '\\textbf', italic: '\\textit', underline: '\\underline' } as const

function inline(text: string): string {
  let latex = ''
  let last = 0
  for (const match of text.matchAll(INLINE)) {
    latex += escapeText(text.slice(last, match.index))
    const [, visible, label, url, name] = match
    if (visible !== undefined) latex += escapeText(visible)
    else if (label !== undefined) {
      const target = hrefTarget(url)
      // A link that may not be one keeps its words and loses the address.
      latex += target ? `\\href{${target}}{${escapeText(label)}}` : escapeText(label)
    } else {
      // On the site a backticked name links to its institute; on a CV it is
      // set in bold, as the CVs already set institutions.
      latex += `\\textbf{${escapeText(name)}}`
    }
    last = (match.index ?? 0) + match[0].length
  }
  return latex + escapeText(text.slice(last))
}

/**
 * One authored string as LaTeX: emphasis, links, backticked names and the
 * site's line breaks, with everything else escaped. A trailing `@see` points
 * into the site, so it is dropped.
 */
export function markupToLatex(markup: string): string {
  const text = stripCrossReference(markup).replace(/<br\s*\/?>/gi, ' ').replace(/\s+/g, ' ').trim()
  return splitEmphasis(text)
    .map(run => {
      let latex = inline(run.text)
      for (const mark of ['underline', 'italic', 'bold'] as const) {
        if (run[mark]) latex = `${WRAPPERS[mark]}{${latex}}`
      }
      return latex
    })
    .join('')
}

/** A period such as `Oct 2025 - Aug 2026`, with the range set as an en dash. */
export function periodToLatex(period: string): string {
  return markupToLatex(period.replace(/\s+[-–]\s+/g, ' – '))
}
