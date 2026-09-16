import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

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
            <header><h4>Project {index + 1}</h4><Button variant="ghost" size="icon-sm" title="Remove project" aria-label={`Remove project ${index + 1}`} onClick={() => onChange(projects.filter((_, position) => position !== index))}><Trash2 aria-hidden="true" /></Button></header>
            <div className="experience-project-fields">
              <label className="field experience-project-title"><span>Project title</span><textarea value={String(project.title ?? '')} onChange={event => updateProject(index, 'title', event.target.value)} /></label>
              <label className="field"><span>Principal investigator</span><input value={String(investigator.name ?? '')} onChange={event => updateInvestigator(index, 'name', event.target.value)} /></label>
              <label className="field"><span>Investigator institution</span><input value={String(investigator.institution ?? '')} onChange={event => updateInvestigator(index, 'institution', event.target.value)} /></label>
            </div>
          </section>
        )
      })}
    </div>
  )
}
