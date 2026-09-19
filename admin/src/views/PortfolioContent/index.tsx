import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { createEntry as createCollectionEntry, deleteEntry as deleteCollectionEntry, fetchCollection, saveEntry as saveCollectionEntry } from '@/services/content'
import { ArrowUpRight, Check, FileCode2, Pencil, Plus, Trash2 } from 'lucide-react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { LocalNotice } from '@/components/admin/LocalNotice'
import { PageHeader } from '@/components/admin/PageHeader'
import { SearchField } from '@/components/admin/SearchField'
import { VisibilityPane } from '@/components/admin/VisibilityPane'
import { EntryEditorDialog } from '@/components/editor/EntryEditorDialog'
import { Button, SwitchField } from '@/components/form'
import { findPortfolioPage, portfolioAdminPath } from '@/config/portfolio'
import type { PortfolioPage, PortfolioSection } from '@/config/portfolio'
import { publishingTarget } from '@/config/publishing'
import { getPortfolioEntries } from '@/data/portfolioEntries'
import { ENTRY_ENABLED_KEY, isEntryEnabled } from '../../../../src/config/entryStatus.ts'
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
  const collection = `${page.id}/${section.id}`
  const [query, setQuery] = useState('')
  const [entries, setEntries] = useState(() => getPortfolioEntries(page.id, section.id))
  const [editor, setEditor] = useState<EditorState | null>(null)
  const [saving, setSaving] = useState(false)
  // The revision this editor is working against. A save carries it so a file
  // that moved on becomes a conflict instead of an overwrite.
  const [baseSha, setBaseSha] = useState('')

  const [reason, setReason] = useState('Checking whether this collection can be saved...')

  useEffect(() => {
    const controller = new AbortController()
    fetchCollection(collection, controller.signal)
      .then(state => { setBaseSha(state.baseSha); setReason('') })
      .catch((error: unknown) => {
        if (error instanceof Error && error.name === 'AbortError') return
        setBaseSha('')
        setReason(error instanceof Error ? error.message : 'This collection cannot be saved yet.')
      })
    return () => controller.abort()
  }, [collection])

  /** Re-read the revision a save must quote next time. */
  const refreshBase = async () => {
    const next = await fetchCollection(collection, new AbortController().signal).catch(() => null)
    if (next) setBaseSha(next.baseSha)
  }

  const visibleEntries = entries.filter(entry => `${entry.title} ${entry.subtitle}`.toLowerCase().includes(query.trim().toLowerCase()))

  // Switching an entry off writes `enabled: false`, which the site filters out,
  // in place of commenting the block out of the YAML.
  const toggleEntry = async (entry: PortfolioEntry, enabled: boolean) => {
    const raw = { ...entry.raw, [ENTRY_ENABLED_KEY]: enabled }
    const previous = entries
    setEntries(current => current.map(item => item.id === entry.id ? { ...item, enabled, raw } : item))
    if (!baseSha) {
      toast.info(`${entry.title} ${enabled ? 'shown' : 'hidden'} in this session only.`)
      return
    }
    try {
      await saveCollectionEntry(collection, entries.findIndex(item => item.id === entry.id), raw, baseSha)
      await refreshBase()
      toast.success(enabled ? `${entry.title} will show on the site.` : `${entry.title} is hidden from the site.`)
    } catch (error) {
      // The switch already moved, so put it back rather than leaving the UI
      // claiming something the file does not say.
      setEntries(previous)
      toast.error(error instanceof Error ? error.message : 'Could not change that entry.')
    }
  }

  const removeEntry = async (entry: PortfolioEntry) => {
    if (!baseSha) { toast.error('This collection cannot be saved yet.'); return }
    if (!window.confirm(`Delete "${entry.title}" from ${section.title}? This commits to V1.`)) return
    const previous = entries
    const index = entries.findIndex(item => item.id === entry.id)
    setEntries(current => current.filter(item => item.id !== entry.id))
    try {
      const commit = await deleteCollectionEntry(collection, index, baseSha)
      await refreshBase()
      toast.success(`Deleted${commit ? ` (${commit.slice(0, 7)})` : ''}.`)
    } catch (error) {
      setEntries(previous)
      toast.error(error instanceof Error ? error.message : 'Could not delete that entry.')
    }
  }

  const saveEntry = async (nextEntry: PortfolioEntry) => {
    const editing = editor?.mode === 'edit'
    if (!baseSha) {
      setEntries(current => editing ? current.map(entry => entry.id === nextEntry.id ? nextEntry : entry) : [nextEntry, ...current])
      setEditor(null)
      toast.info('Saved in this session only — GitHub is not connected.')
      return
    }
    setSaving(true)
    try {
      const index = entries.findIndex(entry => entry.id === nextEntry.id)
      const commit = editing
        ? await saveCollectionEntry(collection, index, nextEntry.raw, baseSha)
        : await createCollectionEntry(collection, nextEntry.raw, baseSha)
      setEntries(current => editing
        ? current.map(entry => entry.id === nextEntry.id ? nextEntry : entry)
        : [...current, nextEntry])
      setEditor(null)
      // The file has a new revision now, so the next save must quote that one.
      const refreshed = await fetchCollection(collection, new AbortController().signal).catch(() => null)
      if (refreshed) setBaseSha(refreshed.baseSha)
      toast.success(`Committed to V1${commit ? ` (${commit.slice(0, 7)})` : ''}.`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not save this entry.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <PageHeader
        title={page.title}
        description={page.description}
        actions={
          <Button variant="outline" asChild>
            <a href={`${page.site === 'blog' ? publishingTarget.blogOrigin : publishingTarget.portfolioOrigin}${page.publicPath}`} target="_blank" rel="noreferrer">View {page.site === 'blog' ? 'blog' : 'beta'} page <ArrowUpRight aria-hidden="true" /></a>
          </Button>
        }
      />

      {page.sections.length > 1 && (
        <nav className="section-tabs" aria-label={`${page.title} sections`}>
          {page.sections.map(item => (
            <Link className={item.id === section.id ? 'section-tab-active' : ''} key={item.id} to={portfolioAdminPath(page, item)}>{item.title}</Link>
          ))}
        </nav>
      )}

      <LocalNotice>
        {baseSha
          ? <>Edits commit straight to <code>{publishingTarget.branch}</code>. The beta site rebuilds from that branch.</>
          : reason}
      </LocalNotice>

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
              <article key={entry.id} className={isEntryEnabled(entry.raw) ? undefined : 'entry-disabled'}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <div><strong>{entry.title}</strong>{entry.subtitle && <small>{entry.subtitle}</small>}</div>
                <span className="mapped-state"><Check aria-hidden="true" /> Mapped</span>
                <SwitchField
                  aria-label={`Show ${entry.title} on the site`}
                  checked={isEntryEnabled(entry.raw)}
                  onChange={enabled => void toggleEntry(entry, enabled)}
                />
                <Button variant="outline" size="icon-sm" title="Edit entry" aria-label={`Edit ${entry.title}`} onClick={() => setEditor({ mode: 'edit', entry })}><Pencil aria-hidden="true" /></Button>
                <Button variant="outline" size="icon-sm" title={baseSha ? 'Delete entry' : 'This collection cannot be saved yet'} aria-label={`Delete ${entry.title}`} disabled={!baseSha} onClick={() => void removeEntry(entry)}><Trash2 aria-hidden="true" /></Button>
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
        </aside>
      </div>
      {editor && (
        <EntryEditorDialog
          key={editor.mode === 'edit' ? editor.entry.id : 'new'}
          entry={editor.mode === 'edit' ? editor.entry : undefined}
          fieldGroups={section.fields}
          requiredFields={section.requiredFields}
          typeOptions={section.typeOptions}
          entryFields={section.entryFields}
          isExperience={page.id === 'home' && section.id === 'experience'}
          isEducation={page.id === 'home' && section.id === 'education'}
          onClose={() => setEditor(null)}
          onSave={entry => void saveEntry(entry)}
          saving={saving}
        />
      )}
    </>
  )
}
