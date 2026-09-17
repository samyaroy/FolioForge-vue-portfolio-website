import { useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import { Save, X } from 'lucide-react'
import { Button, IconButton, SelectField, TextareaField, TextField } from '@/components/form'
import type { PortfolioEntry } from '@/data/portfolioEntries'
import { driveFieldMode, fromDriveEditorValue, toDriveEditorValue } from '@/lib/driveLinks'
import { entryPresentation } from '@/lib/entryPresentation'
import { ExperienceProjectsEditor } from '@/components/editor/ExperienceProjectsEditor'
import { DescriptionLinesEditor } from '@/components/editor/DescriptionLinesEditor'
import { CurriculumEditor } from '@/components/editor/CurriculumEditor'
import { EducationSubFieldsEditor } from '@/components/editor/EducationSubFieldsEditor'
import { CredentialLinksEditor } from '@/components/editor/CredentialLinksEditor'
import { curriculumDraft, serializeCurriculum } from '@/lib/curriculum'
import { credentialLinksDraft, serializeCredentialLinks } from '@/lib/credentialLinks'
import { educationTypeIcons } from '../../../../src/config/educationTypes.ts'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LogoSelector } from '@/components/editor/LogoSelector'

type EntryEditorDialogProps = {
  entry?: PortfolioEntry
  fieldGroups: string[]
  isExperience?: boolean
  isEducation?: boolean
  onClose: () => void
  onSave: (entry: PortfolioEntry) => void
}

function editableValue(value: unknown): string {
  if (value === null || value === undefined) return ''
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return String(value)
  return JSON.stringify(value, null, 2)
}

function fieldKey(label: string) {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/(^_|_$)/g, '')
}

export function EntryEditorDialog({ entry, fieldGroups, isExperience = false, isEducation = false, onClose, onSave }: EntryEditorDialogProps) {
  const initialFields = useMemo(() => {
    if (entry) {
      const raw = isExperience ? { ...entry.raw, cred_link: credentialLinksDraft(entry.raw.cred_link), projects: entry.raw.projects ?? [], description: Array.isArray(entry.raw.description) ? entry.raw.description : entry.raw.description ? [entry.raw.description] : [] } : isEducation ? { ...entry.raw, sub_field: entry.raw.sub_field ?? [] } : entry.raw
      return Object.fromEntries(Object.entries(raw).filter(([key]) => !entry.readOnlyFields?.includes(key) && !(isEducation && key === 'cirriculum')).map(([key, value]) => [key, editableValue(toDriveEditorValue(value))]))
    }
    if (isExperience) return { job_role: '', type: '', company: '', location: '', time_period: '', description: '[]', cred_link: '[]', projects: '[]' }
    if (isEducation) return { type: '', degree: '', field: '', institution: '', location: '', time_period: '', gpa: '', cred_link: '', category: '', sub_field: '[]' }
    return Object.fromEntries(fieldGroups.map(label => [fieldKey(label), '']))
  }, [entry, fieldGroups, isExperience, isEducation])
  const [fields, setFields] = useState<Record<string, string>>(initialFields)
  const [educationTab, setEducationTab] = useState('details')
  const [curriculum, setCurriculum] = useState(() => curriculumDraft(entry?.raw.cirriculum))
  const fieldOrder = ['job_role', 'type', 'company', 'department', 'location', 'time_period', 'supervisor']
  const orderedFields = isExperience
    ? [
      ...fieldOrder.filter(key => key in fields),
      ...Object.keys(fields).filter(key => !fieldOrder.includes(key) && !['cred_link', 'description', 'projects'].includes(key)),
      ...['cred_link', 'description', 'projects'].filter(key => key in fields),
    ].map(key => [key, fields[key]] as const)
    : Object.entries(fields)

  const saveEntry = () => {
    if (!Object.values(fields).some(value => value.trim())) {
      toast.error('Enter content before saving.')
      return
    }
    try {
      const raw = { ...entry?.raw, ...Object.fromEntries(Object.entries(fields).map(([key, value]) => {
        const original = entry?.raw[key]
        if (value === initialFields[key] && original !== undefined) return [key, original]
        if (isExperience && key === 'cred_link') return [key, serializeCredentialLinks(JSON.parse(value), original)]
        const structured = (original !== null && typeof original === 'object') || (isExperience && (key === 'projects' || key === 'description')) || (isEducation && key === 'sub_field') || (key === 'logo' && value.startsWith('['))
        const parsed: unknown = structured ? JSON.parse(value) : value
        if (isEducation && key === 'sub_field' && Array.isArray(parsed) && parsed.some(item => !item || typeof item !== 'object' || typeof item.label !== 'string' || !item.label.trim() || typeof item.name !== 'string' || !item.name.trim())) throw new Error('Enter a label and name for each sub-field before saving.')
        if (isExperience && key === 'description' && Array.isArray(parsed) && parsed.some(line => typeof line !== 'string' || !line.trim())) throw new Error('Enter text for each description line before saving.')
        if (isExperience && key === 'projects' && Array.isArray(parsed) && parsed.some(project => !project || typeof project !== 'object' || typeof project.title !== 'string' || !project.title.trim())) throw new Error('Enter a title for each project before saving.')
        return [key, fromDriveEditorValue(parsed, original, key)]
      })) }
      // An entry that never had a credential and still has none keeps no key.
      if (raw.cred_link === undefined) delete raw.cred_link
      if (isEducation && (entry?.raw.cirriculum !== undefined || Object.keys(curriculum).length)) raw.cirriculum = serializeCurriculum(curriculum)
      const presentation = entry?.presentation ?? { titlePaths: ['title', 'name', 'organization', 'role', 'degree', Object.keys(fields)[0]], subtitlePaths: ['institution', 'date', 'location'], fallbackTitle: entry?.title ?? 'New entry' }
      onSave({
        ...entry,
        id: entry?.id ?? `local-${Date.now()}`,
        ...entryPresentation(raw, presentation),
        presentation,
        raw,
      })
    } catch (error) {
      toast.error(error instanceof SyntaxError ? 'Invalid entry JSON. Check the nested fields before saving.' : error instanceof Error ? error.message : 'Could not update this entry. Your edits are still open.')
    }
  }

  return (
    <div className="entry-dialog-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="entry-dialog" role="dialog" aria-modal="true" aria-label={entry ? `Edit ${entry.title}` : 'Add entry'} onMouseDown={event => event.stopPropagation()}>
        <header>
          <div><span>{entry ? 'Edit entry' : 'New entry'}</span><h2>{entry?.title ?? 'Add collection entry'}</h2></div>
          <IconButton variant="bare" size="none" label="Close editor" onClick={onClose}><X aria-hidden="true" /></IconButton>
        </header>
        {isEducation && <Tabs value={educationTab} onValueChange={setEducationTab} className="education-editor-tabs"><TabsList><TabsTrigger value="details">Education details</TabsTrigger><TabsTrigger value="curriculum">Curriculum</TabsTrigger></TabsList></Tabs>}
        <div className="entry-dialog-body" hidden={isEducation && educationTab !== 'details'}>
          <div className="entry-field-divider"><span>{isExperience ? 'Role details' : 'Entry fields'}</span>{!isExperience && <small>{Object.keys(fields).length}</small>}</div>
          {orderedFields.map(([key, value], index) => {
            if (key === 'logo') return <LogoSelector key={key} multiple={typeof entry?.raw.logo !== 'string'} values={value.startsWith('[') ? JSON.parse(value) : value ? [value] : []} onChange={logos => setFields(current => ({ ...current, logo: typeof entry?.raw.logo === 'string' ? logos[0] ?? '' : JSON.stringify(logos) }))} />
            if (isEducation && key === 'sub_field') return <EducationSubFieldsEditor key={key} subFields={JSON.parse(value)} onChange={subFields => setFields(current => ({ ...current, sub_field: JSON.stringify(subFields) }))} />
            if (isExperience && key === 'projects') return <ExperienceProjectsEditor key={key} projects={JSON.parse(value)} onChange={projects => setFields(current => ({ ...current, projects: JSON.stringify(projects) }))} />
            if (isExperience && key === 'description') return <DescriptionLinesEditor key={key} lines={JSON.parse(value)} onChange={lines => setFields(current => ({ ...current, description: JSON.stringify(lines) }))} />
            if (isExperience && key === 'cred_link') return <CredentialLinksEditor key={key} links={JSON.parse(value)} onChange={links => setFields(current => ({ ...current, cred_link: JSON.stringify(links) }))} />
            if (isEducation && key === 'type') {
              // Only types the site's education timeline renders; an unrecognised
              // value from the YAML stays listed so opening the entry does not drop it.
              const types = Object.keys(educationTypeIcons).map(type => ({ value: type, label: type }))
              const options = value && !types.some(type => type.value === value) ? [{ value, label: `${value} (unsupported)` }, ...types] : types
              return <SelectField key={key} label="type" placeholder="Select type" value={value} options={options} onChange={type => setFields(current => ({ ...current, type }))} />
            }
            const isStructured = value.includes('\n') || value.startsWith('{') || value.startsWith('[')
            const label = `${key.replaceAll('_', ' ')}${!isStructured && driveFieldMode(key, entry?.raw[key]) ? ' (Drive file ID / URL)' : ''}`
            const change = (next: string) => setFields(current => ({ ...current, [key]: next }))
            return isStructured
              ? <TextareaField key={key} label={label} value={value} onChange={change} />
              : <TextField key={key} label={label} value={value} onChange={change} autoFocus={index === 0} />
          })}
        </div>
        {isEducation && <div className="entry-dialog-body curriculum-tab-body" hidden={educationTab !== 'curriculum'}><CurriculumEditor curriculum={curriculum} onChange={setCurriculum} /></div>}
        <footer><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={saveEntry}><Save aria-hidden="true" /> Save local change</Button></footer>
      </section>
    </div>
  )
}
