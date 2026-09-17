import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { toast } from 'react-toastify'
import { Button, IconButton, TextareaField, TextField } from '@/components/form'
import type { CourseDraft, CurriculumDraft } from '@/lib/curriculum'
import { fieldCaption } from '@/lib/fieldNames'
import { LogoSelector } from '@/components/editor/LogoSelector'
import { FacultyEditor } from '@/components/editor/FacultyEditor'

type CurriculumEditorProps = {
  curriculum: CurriculumDraft
  onChange: (curriculum: CurriculumDraft) => void
}

export function CurriculumEditor({ curriculum, onChange }: CurriculumEditorProps) {
  const [groupName, setGroupName] = useState('')
  const addGroup = () => {
    const key = groupName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')
    if (!key || Object.hasOwn(curriculum, key)) {
      toast.error('Enter a unique semester or level name.')
      return
    }
    onChange({ ...curriculum, [key]: [] })
    setGroupName('')
  }
  const updateGroup = (key: string, courses: CourseDraft[]) => onChange({ ...curriculum, [key]: courses })

  return (
    <div className="curriculum-editor">
      <div className="curriculum-add-group"><TextField label="Semester or level" required value={groupName} onChange={setGroupName} placeholder="Semester 2 or Foundation" /><Button variant="outline" size="sm" onClick={addGroup}><Plus aria-hidden="true" /> Add group</Button></div>
      {Object.entries(curriculum).map(([group, courses]) => (
        <section className="curriculum-group" key={group} aria-label={group.replaceAll('_', ' ')}>
          <header><h3>{group.replaceAll('_', ' ')}</h3><div><Button variant="outline" size="sm" onClick={() => updateGroup(group, [...courses, { original: {}, fields: { course_name: '', course_code: '', type: '', credit: '', faculty: '[]' } }])}><Plus aria-hidden="true" /> Add course</Button><IconButton label={`Remove ${group.replaceAll('_', ' ')}`} title="Remove group" onClick={() => { const next = { ...curriculum }; delete next[group]; onChange(next) }}><Trash2 aria-hidden="true" /></IconButton></div></header>
          {courses.map((course, index) => (
            <section className="curriculum-course" key={index} aria-label={`Course ${index + 1}`}>
              <header><h4>Course {index + 1}</h4><IconButton label={`Remove course ${index + 1}`} title="Remove course" onClick={() => updateGroup(group, courses.filter((_, position) => position !== index))}><Trash2 aria-hidden="true" /></IconButton></header>
              <div className="curriculum-course-fields">
                {Object.entries(course.fields).map(([key, value]) => {
                  if (key === 'faculty') return null
                  if (key === 'logo') return <LogoSelector key={key} multiple={typeof course.original.logo !== 'string'} values={value.startsWith('[') ? JSON.parse(value) : value ? [value] : []} onChange={logos => updateGroup(group, courses.map((item, position) => position === index ? { ...item, fields: { ...item.fields, logo: typeof course.original.logo === 'string' ? logos[0] ?? '' : JSON.stringify(logos) } } : item))} />
                  const structured = value.includes('\n') || value.startsWith('[') || value.startsWith('{')
                  const change = (value: string) => updateGroup(group, courses.map((item, position) => position === index ? { ...item, fields: { ...item.fields, [key]: value } } : item))
                  const label = fieldCaption(key)
                  // serializeCurriculum refuses to save a course without a name.
                  const required = key === 'course_name'
                  return structured
                    ? <TextareaField key={key} label={label} required={required} value={value} onChange={change} />
                    : <TextField key={key} label={label} required={required} value={value} onChange={change} type={key === 'credit' ? 'number' : 'text'} min={key === 'credit' ? 0 : undefined} step={key === 'credit' ? 'any' : undefined} />
                })}
                {/* Shown on every course so faculty can be added where none is listed;
                    the key is only written once this editor is used. */}
                <FacultyEditor members={JSON.parse(course.fields.faculty ?? '[]')} onChange={members => updateGroup(group, courses.map((item, position) => position === index ? { ...item, fields: { ...item.fields, faculty: JSON.stringify(members) } } : item))} />
              </div>
            </section>
          ))}
        </section>
      ))}
    </div>
  )
}
