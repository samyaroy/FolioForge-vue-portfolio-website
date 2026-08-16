const FENCE_RE = /^\s{0,3}(?:```|~~~)/
// Two hashes and a space: `###` and deeper are not numbered sections.
const SECTION_RE = /^##\s+\S/

/**
 * Section numbers for a post's `##` headings, keyed by the source line each one
 * starts on. react-markdown hands every component the node it came from and
 * those nodes keep their source position, so numbering by line stays correct
 * even when two sections in one post share a title.
 */
export function sectionNumbersByLine(markdown: string): Map<number, number> {
  const numbers = new Map<number, number>()
  let insideFence = false
  let count = 0

  markdown.split('\n').forEach((line, index) => {
    if (FENCE_RE.test(line)) {
      insideFence = !insideFence
      return
    }

    if (insideFence || !SECTION_RE.test(line)) return

    count += 1
    // mdast positions are 1-based.
    numbers.set(index + 1, count)
  })

  return numbers
}
