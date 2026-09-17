import { fromDriveEditorValue, toDriveEditorValue } from './driveLinks.ts'

export type CourseDraft = { fields: Record<string, string>; original: Record<string, unknown> }
export type CurriculumDraft = Record<string, CourseDraft[]>
export type FacultyMemberDraft = { name: string; link: string }

function fieldText(value: unknown): string {
  if (value === null || value === undefined) return ''
  return typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)
}

// `faculty` is a name, a list of names, or a list of `{ name, link }`, where
// `name` may itself list several people sharing one link (as CourseCard reads it).
export function facultyDraft(value: unknown): FacultyMemberDraft[] {
  const items = Array.isArray(value) ? value : value === undefined || value === null ? [] : [value]
  return items.flatMap(item => {
    if (!item || typeof item !== 'object') return item === undefined || item === null ? [] : [{ name: String(item), link: '' }]
    const record = item as Record<string, unknown>
    const names = Array.isArray(record.name) ? record.name : [record.name]
    return names.map(name => ({ name: name === undefined || name === null ? '' : String(name), link: typeof record.link === 'string' ? record.link : '' }))
  })
}

function serializeFaculty(value: string, old: unknown, courseName: string): unknown {
  const members = (JSON.parse(value) as FacultyMemberDraft[]).map(member => ({ name: member.name.trim(), link: member.link.trim() })).filter(member => member.name || member.link)
  if (members.some(member => !member.name)) throw new Error(`Enter a name for each faculty member in ${courseName}.`)
  // Keep the shape the YAML already uses: objects once anyone has a link,
  // otherwise plain names, and a bare string where the course had one.
  const usesObjects = members.some(member => member.link) || (Array.isArray(old) ? old.some(item => item && typeof item === 'object') : Boolean(old && typeof old === 'object'))
  if (usesObjects) return members.map(({ name, link }) => link ? { name, link } : { name })
  if (members.length === 1 && typeof old === 'string') return members[0].name
  return members.map(member => member.name)
}

export function curriculumDraft(value: unknown): CurriculumDraft {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  return Object.fromEntries(Object.entries(value).map(([group, courses]) => [group, Array.isArray(courses) ? courses.map(course => ({ original: course, fields: Object.fromEntries(Object.entries(course).map(([key, field]) => [key, key === 'faculty' ? JSON.stringify(facultyDraft(field)) : fieldText(toDriveEditorValue(field))])) })) : []]))
}

export function serializeCurriculum(draft: CurriculumDraft) {
  return Object.fromEntries(Object.entries(draft).map(([group, courses]) => [group, courses.map(course => {
    if (!course.fields.course_name?.trim()) throw new Error(`Enter a course name in ${group.replaceAll('_', ' ')}.`)
    return Object.fromEntries(Object.entries(course.fields).map(([key, value]) => {
      const old = course.original[key]
      if (key === 'faculty') return [key, old !== undefined && value === JSON.stringify(facultyDraft(old)) ? old : serializeFaculty(value, old, course.fields.course_name.trim())]
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
