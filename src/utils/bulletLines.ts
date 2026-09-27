// ─── SUB-BULLET FEATURE (unused) ─────────────────────────────────────────────
// Nothing in src/content authors a "- " line today, so none of this runs. It is
// left whole and working so it can be switched back on by authoring such a line,
// or removed in one pass. Every piece of it is tagged: grep "SUB-BULLET FEATURE".
// ─────────────────────────────────────────────────────────────────────────────

// Sub-bullets inside a description.
//
// A description is a list of lines, each drawn with its own bullet. A line that
// opens with "- " is a sub-bullet of the line above it, which lets one point
// carry its own breakdown — a cohort list under the engagement that ran them —
// without description having to stop being a list of strings.
//
// Consecutive sub-bullets are one numbered list, drawn side by side, so a short
// breakdown reads as a set rather than as a column of loose fragments.
//
// One level is all this recognises. A second would need a spelling for depth,
// and nothing in the content wants one yet.

/** The marker, and the space that keeps it from running into the words. */
export const SUB_BULLET_PREFIX = '- '

// Leading spaces are tolerated so a line indented for readability in the YAML
// still counts, and the dash may be followed by any run of spaces.
const SUB_BULLET = /^\s*-\s+/

export type DescriptionBlock =
  | { kind: 'point'; text: string }
  | { kind: 'list'; items: string[] }

export function isSubBullet(line: string): boolean {
  return SUB_BULLET.test(line)
}

/** The line without its marker — what actually gets drawn. */
export function stripSubBullet(line: string): string {
  return line.replace(SUB_BULLET, '')
}

/** Adds the marker to a line, or takes it off a line that already has one. */
export function toggleSubBullet(line: string): string {
  return isSubBullet(line) ? line.replace(SUB_BULLET, '') : `${SUB_BULLET_PREFIX}${line}`
}

/**
 * Groups the lines into what gets drawn: a point, or the run of sub-bullets
 * that follows one. A run that opens the description has no point above it,
 * which is odd content rather than an error, and is still drawn as a list.
 */
export function descriptionBlocks(lines: readonly string[]): DescriptionBlock[] {
  const blocks: DescriptionBlock[] = []

  for (const line of lines) {
    if (!isSubBullet(line)) {
      blocks.push({ kind: 'point', text: line })
      continue
    }
    const text = stripSubBullet(line)
    const open = blocks[blocks.length - 1]
    if (open?.kind === 'list') open.items.push(text)
    else blocks.push({ kind: 'list', items: [text] })
  }

  return blocks
}

/**
 * Which number a line will be given, counting from the start of its own run —
 * what the editor needs to show one line the way the site will draw it.
 */
export function subBulletOrdinal(lines: readonly string[], index: number): number {
  let ordinal = 0
  for (let position = index; position >= 0 && isSubBullet(lines[position]); position -= 1) ordinal += 1
  return ordinal
}
