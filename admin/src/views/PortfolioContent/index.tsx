import { useState } from 'react'
import { toast } from 'react-toastify'
import { ArrowUpRight, Check, FileCode2, Pencil, Plus, Save } from 'lucide-react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { LocalNotice } from '@/components/admin/LocalNotice'
import { PageHeader } from '@/components/admin/PageHeader'
import { SearchField } from '@/components/admin/SearchField'
import { VisibilityPane } from '@/components/admin/VisibilityPane'
import { EntryEditorDialog } from '@/components/editor/EntryEditorDialog'
import { Button, TextareaField } from '@/components/form'
import { findPortfolioPage, portfolioAdminPath } from '@/config/portfolio'
import type { PortfolioPage, PortfolioSection } from '@/config/portfolio'
import { publishingTarget } from '@/config/publishing'
import { getPortfolioEntries } from '@/data/portfolioEntries'
import type { PortfolioEntry } from '@/data/portfolioEntries'

type EditorState = { mode: 'new' } | { mode: 'edit'; entry: PortfolioEntry }

export function PortfolioContentPage() {
  const { pageId, sectionId } = useParams()
  const page = findPortfolioPage(pageId)
  const section = page?.sections.find(item => item.id === sectionId)

  if (!page) return <Navigate to="/" replace />
  if (!section) return <Navigate to={portfolioAdminPath(page)} replace />

  return <PortfolioSectionEditor key={`${page.id}:${section.id}`} page={page} section={section} />
}

function PortfolioSectionEditor({ page, section }: { page: PortfolioPage; section: PortfolioSection }) {
  const [notes, setNotes] = useState('')
  const [saved, setSaved] = useState(false)
  const [query, setQuery] = useState('')
  const [entries, setEntries] = useState(() => getPortfolioEntries(page.id, section.id))
  const [editor, setEditor] = useState<EditorState | null>(null)

  const visibleEntries = entries.filter(entry => `${entry.title} ${entry.subtitle}`.toLowerCase().includes(query.trim().toLowerCase()))

  const saveLocalPreview = () => {
    toast.info('Preview remains in this session. Nothing has been published.')
    setSaved(true)
    window.setTimeout(() => setSaved(false), 1600)
  }

  const saveEntry = (nextEntry: PortfolioEntry) => {
    setEntries(current => editor?.mode === 'edit'
      ? current.map(entry => entry.id === nextEntry.id ? nextEntry : entry)
      : [nextEntry, ...current])
    setEditor(null)
    toast.success(editor?.mode === 'edit' ? 'Entry updated locally.' : 'Entry added locally.')
  }

  return (
    <>
      <PageHeader
        title={page.title}
        description={page.description}
        actions={
          <Button variant="outline" asChild>
            <a href={`${publishingTarget.portfolioOrigin}${page.publicPath}`} target="_blank" rel="noreferrer">View beta page <ArrowUpRight aria-hidden="true" /></a>
          </Button>
        }
      />

      <nav className="section-tabs" aria-label={`${page.title} sections`}>
        {page.sections.map(item => (
          <Link className={item.id === section.id ? 'section-tab-active' : ''} key={item.id} to={portfolioAdminPath(page, item)}>{item.title}</Link>
        ))}
      </nav>

      <LocalNotice>Entries below are loaded from the repository YAML. Edits and additions remain local until the collection adapter is connected.</LocalNotice>

      <div className="mapped-editor-layout">
        <section className="form-panel">
          <div className="panel-heading">
            <div><span>Collection</span><h2>{section.title}</h2></div>
            <Button size="sm" onClick={() => setEditor({ mode: 'new' })}><Plus aria-hidden="true" /> New entry</Button>
          </div>
          <div className="source-strip">
            <FileCode2 aria-hidden="true" />
            <span><small>Content source</small><strong>{section.sources.join(', ')}</strong></span>
          </div>
          <div className="entry-list-toolbar">
            <SearchField value={query} onChange={setQuery} placeholder={`Search ${section.title.toLowerCase()}`} label={`Search ${section.title}`} />
            <span>{visibleEntries.length} of {entries.length} entries</span>
          </div>
          <div className="repository-entry-list">
            {visibleEntries.map((entry, index) => (
              <article key={entry.id}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <div><strong>{entry.title}</strong>{entry.subtitle && <small>{entry.subtitle}</small>}</div>
                <span className="mapped-state"><Check aria-hidden="true" /> Mapped</span>
                <Button variant="outline" size="icon-sm" title="Edit entry" aria-label={`Edit ${entry.title}`} onClick={() => setEditor({ mode: 'edit', entry })}><Pencil aria-hidden="true" /></Button>
              </article>
            ))}
            {!visibleEntries.length && (
              <div className="collection-empty-state">
                <strong>{entries.length ? 'No matching entries' : `No ${section.title.toLowerCase()} added yet`}</strong>
                <span>{entries.length ? 'Try a different search.' : 'Create the first entry for this section.'}</span>
                {!entries.length && <Button size="sm" onClick={() => setEditor({ mode: 'new' })}><Plus aria-hidden="true" /> New entry</Button>}
              </div>
            )}
          </div>
        </section>

        <aside className="mapped-editor-aside">
          <VisibilityPane pageId={page.id} sectionId={section.id} />
          <section className="form-panel">
            <div className="panel-heading"><div><span>Draft</span><h2>Editor notes</h2></div></div>
            <div className="aside-form-body">
              <TextareaField label="Notes for this change" data-page-search value={notes} onChange={setNotes} placeholder="Optional review context" />
              <Button variant="outline" onClick={saveLocalPreview}><Save aria-hidden="true" />{saved ? 'Saved locally' : 'Save local preview'}</Button>
            </div>
          </section>
        </aside>
      </div>
      {editor && (
        <EntryEditorDialog
          key={editor.mode === 'edit' ? editor.entry.id : 'new'}
          entry={editor.mode === 'edit' ? editor.entry : undefined}
          fieldGroups={section.fields}
          requiredFields={section.requiredFields}
          typeOptions={section.typeOptions}
          credentialStyle={section.credentialStyle}
          isExperience={page.id === 'home' && section.id === 'experience'}
          isEducation={page.id === 'home' && section.id === 'education'}
          onClose={() => setEditor(null)}
          onSave={saveEntry}
        />
      )}
    </>
  )
}
