import { createElement, Fragment, type ReactNode } from 'react'
import { emphasisTags, splitEmphasis } from '../../../src/utils/inlineMarkup'

/**
 * Authored text drawn the way the site draws it, so **bold**, *italic* and
 * __underline__ read as formatting here rather than as stray punctuation.
 *
 * The parser is the site's own module, imported by path, so the admin cannot
 * drift into recognising a different set of markers than the site renders.
 * It yields text with marks attached, never HTML, so nothing here is set as
 * innerHTML and authored angle brackets stay literal.
 */
export function InlineMarkup({ text }: { text: string }) {
  return (
    <>
      {splitEmphasis(text).map((run, index) => (
        <Fragment key={index}>{nest(run.text, emphasisTags(run))}</Fragment>
      ))}
    </>
  )
}

/** Wraps the text in its marks, innermost last, so combined marks nest. */
function nest(text: string, tags: string[]): ReactNode {
  return tags.reduceRight<ReactNode>((child, tag) => createElement(tag, null, child), text)
}
