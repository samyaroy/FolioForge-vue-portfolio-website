import { useCallback, useMemo, useState } from 'react'
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
import { projectLinksDraft, serializeProjectLinks } from '@/lib/projectLinks'
import { objectFieldsDraft, serializeObjectFields } from '@/lib/objectFields'
import { listFieldsDraft, serializeListFields } from '@/lib/listFields'
import { ProjectLinksEditor } from '@/components/editor/ProjectLinksEditor'
import { ObjectFieldsEditor } from '@/components/editor/ObjectFieldsEditor'
import { ListFieldsEditor } from '@/components/editor/ListFieldsEditor'
import { fieldCaption } from '@/lib/fieldNames'
import { credentialStyleOf, fieldKeys, listFieldsOf, objectFieldsOf, type EntryField } from '../../../../src/config/entryFields.ts'
import { ENTRY_ENABLED_KEY } from '../../../../src/config/entryStatus.ts'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LogoSelector } from '@/components/editor/LogoSelector'

type EntryEditorDialogProps = {
  entry?: PortfolioEntry
  fieldGroups: string[]
  /** Entry keys this section cannot be saved without; see PortfolioSection. */
  requiredFields?: string[]
  /** Values offered for the entry's `type` field; see PortfolioSection. */
  typeOptions?: readonly string[]
  /** Every field an entry carries, with nested shapes; see PortfolioSection. */
  entryFields?: readonly EntryField[]
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

export function EntryEditorDialog({ entry, fieldGroups, requiredFields = [], typeOptions = [], entryFields: schema = [], isExperience = false, isEducation = false, onClose, onSave }: EntryEditorDialogProps) {
  // Nesting is read off the schema, so a collection declares its shape once.
  const entryFields = useMemo(() => fieldKeys(schema), [schema])
  const objectFields = useMemo(() => objectFieldsOf(schema), [schema])
  const listFields = useMemo(() => listFieldsOf(schema), [schema])
  const credentialStyle = useMemo(() => credentialStyleOf(schema), [schema])
  // What an untouched field holds before anything is typed into it.
  const blankValue = useCallback((key: string) => {
    if (objectFields[key]) return JSON.stringify(objectFieldsDraft(undefined, objectFields[key]))
    if (listFields[key]) return '[]'
    if (key === 'cred_link' && credentialStyle) return '[]'
    if (isExperience && (key === 'projects' || key === 'description')) return '[]'
    if (isEducation && key === 'sub_field') return '[]'
    return ''
  }, [objectFields, listFields, credentialStyle, isExperience, isEducation])

  const initialFields = useMemo(() => {
    if (entry) {
      // The schema decides which fields exist; the entry only fills them in.
      // Keys outside it stay, after the declared ones, so nothing is lost.
      const withSchema = { ...Object.fromEntries(entryFields.map(key => [key, entry.raw[key] ?? ''])), ...entry.raw }
      const base = isExperience ? { ...withSchema, projects: entry.raw.projects ?? [], description: Array.isArray(entry.raw.description) ? entry.raw.description : entry.raw.description ? [entry.raw.description] : [] } : isEducation ? { ...withSchema, sub_field: entry.raw.sub_field ?? [] } : withSchema
      // Nested values the dialog edits as their own controls rather than JSON.
      const drafts: Record<string, unknown> = {
        ...(credentialStyle === 'documents' ? { cred_link: credentialLinksDraft(base.cred_link) } : {}),
        ...(credentialStyle === 'categories' ? { cred_link: projectLinksDraft(base.cred_link) } : {}),
        // Declared object keys are drafted even when the entry lacks them, so
        // one can be filled in; an untouched blank group writes no key.
        ...Object.fromEntries(Object.entries(objectFields).map(([key, fields]) => [key, objectFieldsDraft(base[key], fields)])),
        ...Object.fromEntries(Object.entries(listFields).map(([key, fields]) => [key, listFieldsDraft(base[key], fields)])),
      }
      const raw = { ...base, ...drafts }
      // Values drafted above already hold what their editor should show, so the
      // Drive pass must skip them: a project link is a plain URL, not a file ID.
      const drafted = new Set(Object.keys(drafts))
      return Object.fromEntries(Object.entries(raw).filter(([key]) => !entry.readOnlyFields?.includes(key) && !(isEducation && key === 'cirriculum')).map(([key, value]) => [key, editableValue(drafted.has(key) ? value : toDriveEditorValue(value))]))
    }
    if (entryFields.length) return Object.fromEntries(entryFields.map(key => [key, blankValue(key)]))
    if (isExperience) return { job_role: '', type: '', company: '', location: '', time_period: '', description: '[]', cred_link: '[]', projects: '[]' }
    if (isEducation) return { type: '', degree: '', field: '', institution: '', location: '', time_period: '', gpa: '', cred_link: '', category: '', sub_field: '[]' }
    return Object.fromEntries(fieldGroups.map(label => [fieldKey(label), '']))
  }, [entry, fieldGroups, isExperience, isEducation, credentialStyle, objectFields, listFields, entryFields, blankValue])
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

  // Only fields the dialog actually shows are enforced, so an older entry that
  // never carried one of these keys stays editable.
  const isRequired = (key: string) => requiredFields.includes(key) && key in fields

  const saveEntry = () => {
    if (!Object.values(fields).some(value => value.trim())) {
      toast.error('Enter content before saving.')
      return
    }
    const blank = Object.keys(fields).find(key => isRequired(key) && !fields[key].trim())
    if (blank) {
      toast.error(`Enter ${blank.replaceAll('_', ' ')} before saving.`)
      return
    }
    try {
      const raw = { ...entry?.raw, ...Object.fromEntries(Object.entries(fields).map(([key, value]) => {
        const original = entry?.raw[key]
        if (value === initialFields[key] && original !== undefined) return [key, original]
        if (credentialStyle === 'documents' && key === 'cred_link') return [key, serializeCredentialLinks(JSON.parse(value), original)]
        if (credentialStyle === 'categories' && key === 'cred_link') return [key, serializeProjectLinks(JSON.parse(value), original)]
        if (objectFields[key]) return [key, serializeObjectFields(JSON.parse(value), original, objectFields[key], key)]
        if (listFields[key]) return [key, serializeListFields(JSON.parse(value), original, listFields[key], fieldCaption(key).toLowerCase())]
        const structured = (original !== null && typeof original === 'object') || (isExperience && (key === 'projects' || key === 'description')) || (isEducation && key === 'sub_field') || (key === 'logo' && value.startsWith('['))
        const parsed: unknown = structured ? JSON.parse(value) : value
        if (isEducation && key === 'sub_field' && Array.isArray(parsed) && parsed.some(item => !item || typeof item !== 'object' || typeof item.label !== 'string' || !item.label.trim() || typeof item.name !== 'string' || !item.name.trim())) throw new Error('Enter a label and name for each sub-field before saving.')
        if (isExperience && key === 'description' && Array.isArray(parsed) && parsed.some(line => typeof line !== 'string' || !line.trim())) throw new Error('Enter text for each description line before saving.')
        if (isExperience && key === 'projects' && Array.isArray(parsed) && parsed.some(project => !project || typeof project !== 'object' || typeof project.title !== 'string' || !project.title.trim())) throw new Error('Enter a title for each project before saving.')
        return [key, fromDriveEditorValue(parsed, original, key)]
      })) }
      // A declared field is always written, blank if empty, so every entry in
      // the collection keeps the same shape. Undeclared ones vanish as before.
      for (const key of Object.keys(raw)) {
        if (raw[key] !== undefined) continue
        if (entryFields.includes(key)) raw[key] = null
        else delete raw[key]
      }
      for (const key of entryFields) if (!(key in raw)) raw[key] = ''
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
          {orderedFields.filter(([key]) => key !== ENTRY_ENABLED_KEY).map(([key, value], index) => {
            if (key === 'logo') return <LogoSelector key={key} multiple={typeof entry?.raw.logo !== 'string'} values={value.startsWith('[') ? JSON.parse(value) : value ? [value] : []} onChange={logos => setFields(current => ({ ...current, logo: typeof entry?.raw.logo === 'string' ? logos[0] ?? '' : JSON.stringify(logos) }))} />
            if (isEducation && key === 'sub_field') return <EducationSubFieldsEditor key={key} subFields={JSON.parse(value)} onChange={subFields => setFields(current => ({ ...current, sub_field: JSON.stringify(subFields) }))} />
            if (isExperience && key === 'projects') return <ExperienceProjectsEditor key={key} projects={JSON.parse(value)} onChange={projects => setFields(current => ({ ...current, projects: JSON.stringify(projects) }))} />
            if (isExperience && key === 'description') return <DescriptionLinesEditor key={key} lines={JSON.parse(value)} onChange={lines => setFields(current => ({ ...current, description: JSON.stringify(lines) }))} />
            if (credentialStyle === 'documents' && key === 'cred_link') return <CredentialLinksEditor key={key} links={JSON.parse(value)} onChange={links => setFields(current => ({ ...current, cred_link: JSON.stringify(links) }))} />
            if (credentialStyle === 'categories' && key === 'cred_link') return <ProjectLinksEditor key={key} links={JSON.parse(value)} onChange={links => setFields(current => ({ ...current, cred_link: JSON.stringify(links) }))} />
            if (objectFields[key]) return <ObjectFieldsEditor key={key} name={key} draft={JSON.parse(value)} onChange={draft => setFields(current => ({ ...current, [key]: JSON.stringify(draft) }))} />
            if (listFields[key]) return <ListFieldsEditor key={key} name={key} fields={listFields[key]} rows={JSON.parse(value)} onChange={rows => setFields(current => ({ ...current, [key]: JSON.stringify(rows) }))} />
            if (key === 'type' && typeOptions.length) {
              // Only types the site recognises; an unrecognised value from the
              // YAML stays listed so opening the entry does not drop it.
              const types = typeOptions.map(type => ({ value: type, label: fieldCaption(type) }))
              const options = value && !types.some(type => type.value === value) ? [{ value, label: `${value} (unsupported)` }, ...types] : types
              return <SelectField key={key} label={fieldCaption(key)} placeholder="Select type" required={isRequired(key)} value={value} options={options} onChange={type => setFields(current => ({ ...current, type }))} />
            }
            const isStructured = value.includes('\n') || value.startsWith('{') || value.startsWith('[')
            const label = `${fieldCaption(key)}${!isStructured && driveFieldMode(key, entry?.raw[key]) ? ' (Drive file ID / URL)' : ''}`
            const change = (next: string) => setFields(current => ({ ...current, [key]: next }))
            return isStructured
              ? <TextareaField key={key} label={label} required={isRequired(key)} value={value} onChange={change} />
              : <TextField key={key} label={label} required={isRequired(key)} value={value} onChange={change} autoFocus={index === 0} />
          })}
        </div>
        {isEducation && <div className="entry-dialog-body curriculum-tab-body" hidden={educationTab !== 'curriculum'}><CurriculumEditor curriculum={curriculum} onChange={setCurriculum} /></div>}
        <footer><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={saveEntry}><Save aria-hidden="true" /> Save local change</Button></footer>
      </section>
    </div>
  )
}
