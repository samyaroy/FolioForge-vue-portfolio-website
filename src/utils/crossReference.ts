// A cross-reference on a description line: "see also, elsewhere on this site".
//
// An entry often has a counterpart page — a role that mentored the projects
// listed under Teachings, an internship whose output sits under Projects. The
// line says what happened; the reference is the way through to the rest.
//
// It is authored as a trailing @see, so the line still reads as a sentence and
// the marker cannot be mistaken for part of it:
//
//   "Mentored 13 interns ... @see[See the projects](/teachings)"
//
// The target may carry a query, so a reference can land on one card rather than
// a page — the Projects tab already answers ?project=<slug>.

export type CrossReference = {
  label: string
  target: string
  /** A site path goes through the router; anything else opens as a link. */
  internal: boolean
}

export type ReferencedLine = {
  text: string
  reference: CrossReference | null
}

// Anchored to the end: the reference is drawn where the line runs out, so that
// is also the only place it may be written. Authoring it mid-sentence would
// promise something the rendering does not do.
const CROSS_REFERENCE = /\s*@see\[([^\]]+)\]\(([^)\s]+)\)\s*$/

export const CROSS_REFERENCE_PREFIX = '@see'

export function hasCrossReference(line: string): boolean {
  return CROSS_REFERENCE.test(line)
}

/** Splits the sentence from the reference that follows it. */
export function splitCrossReference(line: string): ReferencedLine {
  const match = CROSS_REFERENCE.exec(line)
  if (!match) return { text: line, reference: null }

  const [, label, target] = match
  return {
    text: line.slice(0, match.index),
    reference: { label, target, internal: target.startsWith('/') },
  }
}

/** The marker spelled out, for an editor inserting one. */
export function writeCrossReference(label: string, target: string): string {
  return `${CROSS_REFERENCE_PREFIX}[${label}](${target})`
}

/** Removes the reference, leaving the sentence — what an editor toggles off. */
export function stripCrossReference(line: string): string {
  return line.replace(CROSS_REFERENCE, '')
}
