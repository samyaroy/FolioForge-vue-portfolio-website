import { Plus, Trash2 } from 'lucide-react'
import { Button, IconButton, TextareaField, TextField } from '@/components/form'

type Project = Record<string, unknown>
type ExperienceProjectsEditorProps = {
  projects: Project[]
  onChange: (projects: Project[]) => void
}

export function ExperienceProjectsEditor({ projects, onChange }: ExperienceProjectsEditorProps) {
  const updateProject = (index: number, key: string, value: string) => {
    onChange(projects.map((project, position) => position === index ? { ...project, [key]: value } : project))
  }

  const updateInvestigator = (index: number, key: string, value: string) => {
    onChange(projects.map((project, position) => {
      if (position !== index) return project
      const current = project.principal_investigator
      const investigator = current && typeof current === 'object' ? current as Project : {}
      const updated = { ...investigator, [key]: value }
      const next = { ...project }
      if (Object.values(updated).some(item => item !== '' && item !== null && item !== undefined)) next.principal_investigator = updated
      else delete next.principal_investigator
      return next
    }))
  }

  return (
    <div className="experience-projects-editor">
      <div className="experience-projects-heading">
        <h3>Projects <span>{projects.length}</span></h3>
        <Button variant="outline" size="sm" onClick={() => onChange([...projects, { title: '' }])}><Plus aria-hidden="true" /> Add project</Button>
      </div>
      {projects.map((project, index) => {
        const investigator = project.principal_investigator && typeof project.principal_investigator === 'object' ? project.principal_investigator as Project : {}
        return (
          <section className="experience-project-section" key={index} aria-label={`Project ${index + 1}`}>
            <header><h4>Project {index + 1}</h4><IconButton label={`Remove project ${index + 1}`} title="Remove project" onClick={() => onChange(projects.filter((_, position) => position !== index))}><Trash2 aria-hidden="true" /></IconButton></header>
            <div className="experience-project-fields">
              <TextareaField label="Project title" required fieldClassName="experience-project-title" value={String(project.title ?? '')} onChange={value => updateProject(index, 'title', value)} />
              <TextField label="Principal investigator" value={String(investigator.name ?? '')} onChange={value => updateInvestigator(index, 'name', value)} />
              <TextField label="Investigator institution" value={String(investigator.institution ?? '')} onChange={value => updateInvestigator(index, 'institution', value)} />
            </div>
          </section>
        )
      })}
    </div>
  )
}
