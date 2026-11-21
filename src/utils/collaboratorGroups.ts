// Sorts the people on the Collaborators tab into the groups it shows: current
// and past, and within each, mentors and guides ahead of peers.
//
// An entry is current when its `period` says so ("2024 – Present"). Every other
// entry is past, including one with no `period` at all, so nobody listed is
// ever dropped from the page.
//
// `type` says who the person was to you:
//   type: mentor    a mentor or supervisor
//   type: guide     a project or thesis guide; grouped with mentors
//   type: peer      a teammate, co-author or colleague
// Leaving it out, or any other value, counts as a peer.

export type CollaboratorKind = 'mentor' | 'peer'

/** The values the admin offers for a collaborator's `type`, in menu order. */
export const COLLABORATOR_TYPES = ['mentor', 'guide', 'peer'] as const

export interface CollaboratorGroup<T> {
  kind: CollaboratorKind
  label: string
  people: T[]
}

export interface CollaboratorSections<T> {
  current: CollaboratorGroup<T>[]
  past: CollaboratorGroup<T>[]
}

type CollaboratorEntry = { period?: unknown; type?: unknown }

const CURRENT_PERIOD = /\b(present|ongoing|current)\b/i
const MENTOR_TYPES = new Set(['mentor', 'guide'])

const GROUP_LABELS: Record<CollaboratorKind, string> = {
  mentor: 'Mentors & guides',
  peer: 'Peers',
}

export function isCurrentCollaborator(entry: CollaboratorEntry): boolean {
  const period = typeof entry.period === 'string' ? entry.period : ''
  return CURRENT_PERIOD.test(period)
}

export function collaboratorKind(entry: CollaboratorEntry): CollaboratorKind {
  const type = typeof entry.type === 'string' ? entry.type.trim().toLowerCase() : ''
  return MENTOR_TYPES.has(type) ? 'mentor' : 'peer'
}

// Mentors first, then peers; a group with nobody in it is left out, so the
// tab never shows a label over an empty list. Within a group the content's own
// order is kept.
function groupsOf<T extends CollaboratorEntry>(entries: T[]): CollaboratorGroup<T>[] {
  return (['mentor', 'peer'] as const)
    .map(kind => ({ kind, label: GROUP_LABELS[kind], people: entries.filter(entry => collaboratorKind(entry) === kind) }))
    .filter(group => group.people.length > 0)
}

export function groupCollaborators<T extends CollaboratorEntry>(entries: readonly T[]): CollaboratorSections<T> {
  const people = entries.filter(entry => entry !== null && typeof entry === 'object')
  return {
    current: groupsOf(people.filter(isCurrentCollaborator)),
    past: groupsOf(people.filter(entry => !isCurrentCollaborator(entry))),
  }
}
