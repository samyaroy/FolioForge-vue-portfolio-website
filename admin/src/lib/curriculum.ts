import { fromDriveEditorValue, toDriveEditorValue } from './driveLinks.ts'

export type CourseDraft = { fields: Record<string, string>; original: Record<string, unknown> }
export type CurriculumDraft = Record<string, CourseDraft[]>

function fieldText(value: unknown): string {
  if (value === null || value === undefined) return ''
  return typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)
}

export function curriculumDraft(value: unknown): CurriculumDraft {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  return Object.fromEntries(Object.entries(value).map(([group, courses]) => [group, Array.isArray(courses) ? courses.map(course => ({ original: course, fields: Object.fromEntries(Object.entries(course).map(([key, field]) => [key, fieldText(toDriveEditorValue(field))])) })) : []]))
}

export function serializeCurriculum(draft: CurriculumDraft) {
  return Object.fromEntries(Object.entries(draft).map(([group, courses]) => [group, courses.map(course => {
    if (!course.fields.course_name?.trim()) throw new Error(`Enter a course name in ${group.replaceAll('_', ' ')}.`)
    return Object.fromEntries(Object.entries(course.fields).map(([key, value]) => {
      const old = course.original[key]
      if (value === fieldText(toDriveEditorValue(old))) return [key, old ?? null]
      let parsed: unknown = value
      if ((old !== null && typeof old === 'object') || value.trim().startsWith('[') || value.trim().startsWith('{')) parsed = JSON.parse(value)
      else if (key === 'credit' || typeof old === 'number') {
        parsed = value.trim() ? Number(value) : null
        if (typeof parsed === 'number' && (!Number.isFinite(parsed) || (key === 'credit' && parsed < 0))) throw new Error('Enter valid non-negative course credits.')
      } else if (typeof old === 'boolean') {
        if (value !== 'true' && value !== 'false') throw new Error(`Enter true or false for ${key}.`)
        parsed = value === 'true'
      }
      return [key, fromDriveEditorValue(parsed, old, key)]
    }))
  })]))
}
