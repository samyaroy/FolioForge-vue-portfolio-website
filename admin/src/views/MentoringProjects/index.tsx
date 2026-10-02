import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { ArrowLeft, ExternalLink, Pencil, Plus, Trash2 } from 'lucide-react'
import { toast } from 'react-toastify'
import { DataTable } from '@/components/admin/DataTable'
import { SaveStatusHint } from '@/components/admin/InfoHint'
import { PageHeader } from '@/components/admin/PageHeader'
import { ExpandableSearchField } from '@/components/admin/SearchField'
import { EntryEditorDialog } from '@/components/editor/EntryEditorDialog'
import { Button, IconButton, SwitchField } from '@/components/form'
import { getPortfolioEntries, mentoringCohorts, type PortfolioEntry } from '@/data/portfolioEntries'
import { columnsFor, type DataTableColumns } from '@/lib/dataTable'
import { changeCohortProject, cohortProjects, type MentoringProjectChange } from '@/lib/mentoringProjects'
import { fetchCollection, saveEntry } from '@/services/content'
import { entryFields } from '../../../../src/config/entryFields.ts'
import { isEntryEnabled } from '../../../../src/config/entryStatus.ts'

const collection = 'teaching/mentoring'
const mentoringPath = '/portfolio/pages/teaching/mentoring'
const projectFields = entryFields.mentoredProjects.filter(field => field !== 'course' && !(typeof field === 'object' && field.key === 'affiliation'))
const column = columnsFor<PortfolioEntry>()

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {}
}

function projectEntries(cohort: PortfolioEntry): PortfolioEntry[] {
  return cohortProjects(cohort.raw).map((value, index) => {
    const raw = record(value)
    return { id: String(index), title: String(raw.title || 'Untitled project'), subtitle: '', raw, readOnlyFields: ['semester', 'course', 'affiliation'] }
  })
}

export function MentoringProjectsPage() {
  const { cohortId = '' } = useParams()
  return <CohortProjectTable key={cohortId} cohortId={cohortId} />
}

function CohortProjectTable({ cohortId }: { cohortId: string }) {
  const location = useLocation()
  const [cohort, setCohort] = useState<PortfolioEntry | undefined>(() => {
    const linked = (location.state as { cohort?: PortfolioEntry } | null)?.cohort
    return linked?.id === cohortId ? linked : getPortfolioEntries('teaching', 'mentoring').find(item => item.id === cohortId)
  })
  const [query, setQuery] = useState('')
  const [editor, setEditor] = useState<{ entry?: PortfolioEntry } | null>(null)
  const [baseSha, setBaseSha] = useState('')
  const [failure, setFailure] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const writing = useRef(false)

  useEffect(() => {
    const controller = new AbortController()
    fetchCollection(collection, controller.signal)
      .then(state => {
        setCohort(mentoringCohorts(state.entries).find(item => item.id === cohortId))
        setBaseSha(state.baseSha)
        setFailure('')
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        setFailure(error instanceof Error ? error.message : 'Could not read this cohort.')
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [cohortId])

  const entries = useMemo(() => cohort ? projectEntries(cohort) : [], [cohort])
  const visibleEntries = entries.filter(entry => JSON.stringify(entry.raw).toLowerCase().includes(query.trim().toLowerCase()))

  const persist = async (change: MentoringProjectChange) => {
    if (!cohort || writing.current || loading) return
    writing.current = true
    setSaving(true)
    try {
      if (!baseSha) {
        setCohort({ ...cohort, raw: changeCohortProject(cohort.raw, cohort.raw, change) })
        setEditor(null)
        toast.info('Saved in this session only. GitHub is not connected.')
        return
      }
      // Re-read the parent so a project edit keeps any newer cohort metadata.
      const state = await fetchCollection(collection, new AbortController().signal)
      if (state.baseSha !== baseSha) throw new Error('This file changed since you opened it. Reload before saving.')
      const cohorts = mentoringCohorts(state.entries)
      const index = cohorts.findIndex(item => item.id === cohortId)
      const current = cohorts[index]
      if (!current) throw new Error('This cohort no longer exists. Return to Mentoring and reopen Project info.')
      const raw = changeCohortProject(current.raw, cohort.raw, change)
      const pending = await saveEntry(collection, index, raw, state.baseSha)
      setCohort({ ...current, raw })
      setBaseSha(state.baseSha)
      setEditor(null)
      toast.success(`Saved. ${pending} file${pending === 1 ? '' : 's'} waiting to publish.`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not save this project.')
    } finally {
      writing.current = false
      setSaving(false)
    }
  }

  const remove = (entry: PortfolioEntry) => {
    if (window.confirm(`Delete "${entry.title}" from ${cohort?.title}?`)) void persist({ kind: 'delete', index: Number(entry.id) })
  }
  const disabled = loading || saving
  const columns: DataTableColumns<PortfolioEntry> = [
    column.accessor('title', {
      header: 'Project',
      meta: { width: '35%' },
      cell: ({ row }) => <div className="post-title-cell"><strong>{row.original.title}</strong>{typeof row.original.raw.registration_number === 'string' && row.original.raw.registration_number && <span>{row.original.raw.registration_number}</span>}</div>,
    }),
    column.accessor(entry => Array.isArray(entry.raw.students) ? entry.raw.students.map(student => String(record(student).name ?? '')).join(', ') : '', {
      id: 'students', header: 'Students',
      cell: ({ getValue }) => <span className="mentoring-project-students">{getValue() || '-'}</span>,
    }),
    column.display({
      id: 'links', header: 'Links', meta: { width: '120px' },
      cell: ({ row }) => <div className="mentoring-project-links">{Object.entries(record(row.original.raw.cred_link)).filter(([, value]) => typeof value === 'string' && /^https?:\/\//i.test(value)).map(([name, url]) => <a key={name} href={String(url)} target="_blank" rel="noopener noreferrer" title={name} aria-label={`Open ${name} for ${row.original.title}`}><ExternalLink aria-hidden="true" /><span>{name}</span></a>)}</div>,
    }),
    column.display({
      id: 'enabled', header: 'Enabled', meta: { width: '76px' },
      cell: ({ row }) => <SwitchField aria-label={`Enable ${row.original.title}`} checked={isEntryEnabled(row.original.raw)} disabled={disabled} onChange={enabled => void persist({ kind: 'update', index: Number(row.original.id), project: { ...row.original.raw, enabled } })} />,
    }),
    column.display({
      id: 'actions', header: () => <span className="sr-only">Actions</span>, meta: { width: '88px' },
      cell: ({ row }) => <div className="hyperlink-row-actions"><IconButton variant="outline" label={`Edit ${row.original.title}`} disabled={disabled} onClick={() => setEditor({ entry: row.original })}><Pencil aria-hidden="true" /></IconButton><IconButton variant="outline" label={`Delete ${row.original.title}`} disabled={disabled} onClick={() => remove(row.original)}><Trash2 aria-hidden="true" /></IconButton></div>,
    }),
  ]

  return (
    <>
      <PageHeader
        title="Project info"
        description={cohort ? [cohort.title, String(cohort.raw.semester ?? '')].filter(Boolean).join(' · ') : 'Mentoring'}
        actions={<Button variant="outline" size="sm" asChild><Link to={mentoringPath}><ArrowLeft aria-hidden="true" /> Mentoring</Link></Button>}
        status={<SaveStatusHint saveable={Boolean(baseSha)} failure={failure}>Changes wait here until you publish.</SaveStatusHint>}
      />
      {cohort ? (
        <section className="form-panel collection-panel mentoring-project-panel" aria-labelledby="mentoring-project-heading">
          <div className="panel-heading">
            <div><span>Collection</span><h2 id="mentoring-project-heading">Projects <small>{visibleEntries.length}/{entries.length}</small></h2></div>
            <div className="panel-heading-actions">
              <ExpandableSearchField value={query} onChange={setQuery} placeholder="Search projects or students" label="Search cohort projects" />
              <Button className="section-action-button" size="sm" disabled={disabled} onClick={() => setEditor({})}><Plus aria-hidden="true" /> New project</Button>
            </div>
          </div>
          <DataTable key={query} columns={columns} data={visibleEntries} pageSize={25} rowClassName={entry => isEntryEnabled(entry.raw) ? undefined : 'entry-disabled'} caption={`Projects for ${cohort.title}`} emptyTitle={query ? 'No matching projects' : 'No projects yet'} emptyDetail={query ? 'Try a different search.' : ''} />
        </section>
      ) : <div className="collection-empty-state"><strong>{loading ? 'Loading cohort...' : failure ? 'Could not load this cohort' : 'Cohort not found'}</strong><Button variant="outline" asChild><Link to={mentoringPath}><ArrowLeft aria-hidden="true" /> Mentoring</Link></Button></div>}
      {editor && cohort && <EntryEditorDialog entry={editor.entry} context={['Teaching', 'Mentoring', cohort.title, String(cohort.raw.semester ?? ''), 'Project info']} fieldGroups={['Project', 'Students', 'Links']} entryFields={projectFields} requiredFields={['title']} saving={saving} onClose={() => { if (!saving) setEditor(null) }} onSave={entry => void persist(editor.entry ? { kind: 'update', index: Number(editor.entry.id), project: entry.raw } : { kind: 'create', project: entry.raw })} />}
    </>
  )
}
