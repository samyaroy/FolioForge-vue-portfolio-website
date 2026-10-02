type RecordValue = Record<string, unknown>

export type MentoringProjectChange =
  | { kind: 'create'; project: RecordValue }
  | { kind: 'update'; index: number; project: RecordValue }
  | { kind: 'delete'; index: number }

export function cohortProjects(cohort: RecordValue): unknown[] {
  if (cohort.projects === undefined || cohort.projects === null) return []
  if (!Array.isArray(cohort.projects)) throw new Error('This cohort has an unreadable project list.')
  return cohort.projects
}

/** Apply only the project change, preserving current cohort metadata. */
export function changeCohortProject(current: RecordValue, expected: RecordValue, change: MentoringProjectChange): RecordValue {
  const projects = [...cohortProjects(current)]
  if (JSON.stringify(projects) !== JSON.stringify(cohortProjects(expected))) {
    throw new Error('This cohort\'s projects changed since you opened them. Reload before saving.')
  }
  if (change.kind === 'create') projects.push(change.project)
  else {
    if (!Number.isInteger(change.index) || change.index < 0 || change.index >= projects.length) {
      throw new Error('This project no longer exists. Reload before saving.')
    }
    if (change.kind === 'delete') projects.splice(change.index, 1)
    else projects[change.index] = change.project
  }
  return { ...current, projects }
}
