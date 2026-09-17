import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { FacultyMemberDraft } from '@/lib/curriculum'

type FacultyEditorProps = {
  members: FacultyMemberDraft[]
  onChange: (members: FacultyMemberDraft[]) => void
}

export function FacultyEditor({ members, onChange }: FacultyEditorProps) {
  const update = (index: number, key: keyof FacultyMemberDraft, value: string) => {
    onChange(members.map((member, position) => position === index ? { ...member, [key]: value } : member))
  }

  return (
    <div className="faculty-editor">
      <div className="faculty-editor-heading">
        <span>Faculty <small>{members.length}</small></span>
        <Button variant="outline" size="sm" onClick={() => onChange([...members, { name: '', link: '' }])}><Plus aria-hidden="true" /> Add faculty</Button>
      </div>
      {members.length > 0 && (
        <div className="faculty-member faculty-member-captions" aria-hidden="true"><span>Name</span><span>Profile link</span></div>
      )}
      {members.map((member, index) => (
        <div className="faculty-member" key={index}>
          <input aria-label={`Faculty ${index + 1} name`} placeholder="Prof. Name" value={member.name} onChange={event => update(index, 'name', event.target.value)} />
          <input aria-label={`Faculty ${index + 1} link`} placeholder="https://" type="url" value={member.link} onChange={event => update(index, 'link', event.target.value)} />
          <Button variant="ghost" size="icon-sm" title="Remove faculty" aria-label={`Remove faculty ${index + 1}`} onClick={() => onChange(members.filter((_, position) => position !== index))}><Trash2 aria-hidden="true" /></Button>
        </div>
      ))}
    </div>
  )
}
