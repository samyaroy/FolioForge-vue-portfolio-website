import { useEffect, useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import { createEntry as createCollectionEntry, deleteEntry as deleteCollectionEntry, fetchCollection, saveEntry as saveCollectionEntry } from '@/services/content'
import { ArrowUpRight, Check, FileCode2, Pencil, Plus, Trash2 } from 'lucide-react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { LocalNotice } from '@/components/admin/LocalNotice'
import { PageHeader } from '@/components/admin/PageHeader'
import { SearchField } from '@/components/admin/SearchField'
import { VisibilityPane } from '@/components/admin/VisibilityPane'
import { EntryEditorDialog } from '@/components/editor/EntryEditorDialog'
import { Button, SelectField, SwitchField } from '@/components/form'
import { findPortfolioPage, portfolioAdminPath } from '@/config/portfolio'
import type { PortfolioPage, PortfolioSection } from '@/config/portfolio'
import { publishingTarget } from '@/config/publishing'
import { getPortfolioEntries } from '@/data/portfolioEntries'
import { hasSitePreview, previewFacts, previewHeading } from '@/lib/entryPreview'
import { ENTRY_ENABLED_KEY, isEntryEnabled } from '../../../../src/config/entryStatus.ts'
import type { PortfolioEntry } from '@/data/portfolioEntries'

type EditorState = { mode: 'new' } | { mode: 'edit'; entry: PortfolioEntry }

export function PortfolioContentPage() {
  const { pageId, sectionId } = useParams()
  const page = findPortfolioPage(pageId)
  const section = page?.sections.find(item => item.id === sectionId)
  // Held here so the editor can be keyed on it: switching group is switching
  // collection, and everything below starts again from that group's entries.
  const [group, setGroup] = useState(section?.groups?.[0]?.id ?? section?.filterBy?.options?.[0]?.id ?? '')

  if (!page) return <Navigate to="/" replace />
  if (!section) return <Navigate to={portfolioAdminPath(page)} replace />

  // Switching group is switching collection, so the editor starts again; a
  // filter only changes what is shown, and must not throw away the revision
  // the editor has already read.
  const grouped = section.groups?.some(item => item.id === group) ? group : section.groups?.[0]?.id ?? ''
  return (
    <PortfolioSectionEditor
      key={section.groups ? `${page.id}:${section.id}:${grouped}` : `${page.id}:${section.id}`}
      page={page}
      section={section}
      group={section.groups ? grouped : group}
      onGroupChange={setGroup}
    />
  )
}

type EditorProps = { page: PortfolioPage; section: PortfolioSection; group: string; onGroupChange: (group: string) => void }

// A section whose file groups its entries is shown one group at a time, so a
// new entry joins the group on screen rather than whichever happens to be last
// in the file.
function PortfolioSectionEditor({ page, section, group, onGroupChange }: EditorProps) {
  // A filtered section is one collection; only a grouped one changes target.
  const collection = `${page.id}/${section.groups ? group || section.id : section.id}`
  // Writes address a group; the card shape belongs to the tab, which is the
  // same whichever group is on screen.
  const previewKey = `${page.id}/${section.id}`
  const [query, setQuery] = useState('')
  const [entries, setEntries] = useState(() => getPortfolioEntries(page.id, section.groups ? group || section.id : section.id))
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

  // Choices either come from configuration or from the values the content
  // happens to carry, in the order it carries them.
  const filterOptions = useMemo(() => {
    if (!section.filterBy) return []
    if (section.filterBy.options) return [...section.filterBy.options]
    const seen = new Set<string>()
    for (const entry of entries) {
      const value = String(entry.raw[section.filterBy.field] ?? '').trim()
      if (value) seen.add(value)
    }
    return [...seen].map(value => ({ id: value, label: value }))
  }, [entries, section.filterBy])

  // A derived list has no value until the content is read, so fall back to the
  // first choice rather than showing an empty list.
  const activeFilter = filterOptions.some(option => option.id === group) ? group : filterOptions[0]?.id ?? ''

  const matchesFilter = (entry: PortfolioEntry) => {
    if (!section.filterBy) return true
    const value = String(entry.raw[section.filterBy.field] ?? '')
    const known = filterOptions.some(option => option.id === value)
    // An unknown or missing value falls where the site puts it.
    return (known ? value : section.filterBy.fallback) === activeFilter
  }
  // Filtering is for display only: an index has to address the whole array, or
  // a write would land on whichever entry happens to sit at that position in
  // the filtered view.
  const visibleEntries = entries
    .filter(matchesFilter)
    .filter(entry => `${entry.title} ${entry.subtitle}`.toLowerCase().includes(query.trim().toLowerCase()))

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

  // Creating from a filtered list should produce something that shows up in it.
  const newEntrySeed = section.filterBy
    ? { id: 'new', title: '', subtitle: '', raw: { [section.filterBy.field]: activeFilter } }
    : undefined

  const removeEntry = async (entry: PortfolioEntry) => {
    if (!baseSha) { toast.error('This collection cannot be saved yet.'); return }
    if (!window.confirm(`Delete "${entry.title}" from ${section.title}? This commits to V1.`)) return
    const previous = entries
    const index = entries.findIndex(item => item.id === entry.id)
    setEntries(current => current.filter(item => item.id !== entry.id))
    try {
      const pending = await deleteCollectionEntry(collection, index, baseSha)
      await refreshBase()
      toast.success(`Deleted. ${pending} file${pending === 1 ? '' : 's'} waiting to publish.`)
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
      const pending = editing
        ? await saveCollectionEntry(collection, index, nextEntry.raw, baseSha)
        : await createCollectionEntry(collection, nextEntry.raw, baseSha)
      setEntries(current => editing
        ? current.map(entry => entry.id === nextEntry.id ? nextEntry : entry)
        : [...current, nextEntry])
      setEditor(null)
      // The file has a new revision now, so the next save must quote that one.
      const refreshed = await fetchCollection(collection, new AbortController().signal).catch(() => null)
      if (refreshed) setBaseSha(refreshed.baseSha)
      toast.success(`Saved. ${pending} file${pending === 1 ? '' : 's'} waiting to publish.`)
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
          ? <>Edits wait here until you publish. Publishing writes every change as one commit on <code>{publishingTarget.branch}</code>.</>
          : reason}
      </LocalNotice>

      <div className="mapped-editor-layout">
        <section className="form-panel">
          <div className="panel-heading">
            <div><span>Collection</span><h2>{section.title}</h2></div>
            <div className="panel-heading-actions">
              {(section.groups ?? (filterOptions.length ? filterOptions : undefined)) && (
                <SelectField
                  prefix={section.groups ? 'Group' : section.filterBy?.field === 'semester' ? 'Semester' : 'Type'}
                  className="group-select"
                  value={section.groups ? group : activeFilter}
                  options={(section.groups ?? filterOptions).map(item => ({ value: item.id, label: item.label }))}
                  onChange={onGroupChange}
                />
              )}
              <Button size="sm" onClick={() => setEditor({ mode: 'new' })}><Plus aria-hidden="true" /> New entry</Button>
            </div>
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
                <div>
                  <strong>{hasSitePreview(previewKey) ? previewHeading(entry.raw, previewKey) || entry.title : entry.title}</strong>
                  {!hasSitePreview(previewKey) && entry.subtitle && <small>{entry.subtitle}</small>}
                  {hasSitePreview(previewKey) && (
                    <span className="entry-facts">
                      {previewFacts(entry.raw, previewKey).map(item => {
                        const Icon = item.icon
                        return <span key={item.text}><Icon aria-hidden="true" />{item.text}</span>
                      })}
                    </span>
                  )}
                </div>
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
          entry={editor.mode === 'edit' ? editor.entry : newEntrySeed}
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
