import { useMemo, useState } from 'react'
import { AlertTriangle, ArrowUpRight, CheckCircle2, Download, FileText, Plus, Save, X } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { LocalNotice } from '@/components/admin/LocalNotice'
import { MetricGrid } from '@/components/admin/MetricGrid'
import { PageHeader } from '@/components/admin/PageHeader'
import { CvIssues } from '@/components/cv/CvIssues'
import { Button, IconButton, SelectField, TextField } from '@/components/form'
import { downloadText } from '@/lib/download'
import { newPreset, presetFilenameFor, presetIdFor, presetRow } from '@/cv/editing'
import { renderTex } from '@/cv/render'
import { resolvePreset } from '@/cv/resolve'
import { FILENAME_PATTERN, type CvPreset } from '@/cv/schema'
import { templates } from '@/cv/templates'
import { useCvContent } from '@/hooks/useCvContent'
import { createEntry } from '@/services/content'

// Preset ids are lowercase words and hyphens, so this can never name one.
const BLANK = ':blank'

/**
 * A new CV: its name, what it starts from, and its download name, which
 * follows the name until it is edited. Opening it in the builder is where its
 * content is chosen.
 */
function NewPresetDialog({ presets, saving, onClose, onCreate }: { presets: readonly CvPreset[]; saving: boolean; onClose: () => void; onCreate: (preset: CvPreset) => void }) {
  const [name, setName] = useState('')
  const [from, setFrom] = useState(presets[0]?.id ?? BLANK)
  const [filename, setFilename] = useState<string>()
  const id = presetIdFor(name, new Set(presets.map(preset => preset.id)))
  const download = filename ?? presetFilenameFor(name, presets)

  const create = () => {
    if (!name.trim()) { toast.error('Enter a name for the CV.'); return }
    if (!FILENAME_PATTERN.test(download)) { toast.error('Use letters, digits, dots, hyphens and underscores in the download name.'); return }
    if (presets.some(preset => preset.filename === download)) { toast.error(`Another CV already downloads as "${download}".`); return }
    // A blank CV takes the template and contact header the first CV uses.
    const house = presets[0]
    onCreate(newPreset({ id, name: name.trim(), filename: download }, presets.find(preset => preset.id === from), {
      template: house?.template ?? Object.keys(templates)[0],
      header: house?.header ?? [],
    }))
  }

  return (
    <div className="entry-dialog-backdrop" role="presentation" onMouseDown={() => { if (!saving) onClose() }}>
      <section className="entry-dialog" role="dialog" aria-modal="true" aria-label="New CV" onMouseDown={event => event.stopPropagation()}>
        <header>
          <div><span>Presets</span><h2>New CV</h2></div>
          <IconButton variant="bare" size="none" label="Close" disabled={saving} onClick={onClose}><X aria-hidden="true" /></IconButton>
        </header>
        <div className="entry-dialog-body">
          <TextField label="Name" required value={name} placeholder="Academic CV (PhD)" onChange={setName} disabled={saving} />
          <SelectField label="Start from" value={from} onChange={setFrom} disabled={saving} options={[...presets.map(preset => ({ value: preset.id, label: `A copy of ${preset.name}` })), { value: BLANK, label: 'A blank CV' }]} />
          <TextField label="Download name" required fieldClassName="field-wide" value={download} onChange={setFilename} disabled={saving} />
          <p className="cv-hint field-wide">Saved as the preset <code>{id}</code>. It opens in the builder next, where you choose what it shows.</p>
        </div>
        <footer><Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button><Button onClick={create} disabled={saving}><Save aria-hidden="true" /> {saving ? 'Saving...' : 'Create'}</Button></footer>
      </section>
    </div>
  )
}

/** Every CV preset, whether it builds, and its .tex one click away. */
export function CvOverviewPage() {
  const { content } = useCvContent()
  const navigate = useNavigate()
  const [adding, setAdding] = useState(false)
  const [saving, setSaving] = useState(false)

  const builds = useMemo(() => {
    const context = content?.context
    if (!content || !context) return []
    return content.presets.map(preset => {
      const problems = content.issues.filter(issue => issue.path.startsWith(`presets.yml/presets/${preset.id}/`) || issue.path === `presets.yml/presets/${preset.id}`)
      if (problems.length) return { preset, problems, tex: undefined }
      try {
        return { preset, problems, tex: renderTex(resolvePreset(preset, context)) }
      } catch (error) {
        return { preset, problems: [{ path: `presets.yml/presets/${preset.id}`, message: error instanceof Error ? error.message : 'Could not be built.' }], tex: undefined }
      }
    })
  }, [content])

  const libraryIssues = content?.issues.filter(issue => issue.path.startsWith('library.yml')) ?? []
  const library = content?.context?.library
  const canCreate = content?.mode === 'live' && Boolean(content.presetsBaseSha)

  const create = async (preset: CvPreset) => {
    if (!content) return
    setSaving(true)
    try {
      const pending = await createEntry('cv/presets', presetRow(preset), content.presetsBaseSha)
      toast.success(`${preset.name} added. ${pending} ${pending === 1 ? 'file is' : 'files are'} waiting to publish.`)
      navigate(`/cv/builder/${preset.id}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'The CV could not be added.')
      setSaving(false)
    }
  }

  return (
    <>
      <PageHeader title="CV Overview" description="Every CV is built from the portfolio and the CV library. Open one in the builder to change what it shows." />
      {content?.mode === 'bundled' && (
        <LocalNotice>Showing the CV content bundled with this build of the admin ({content.notice}). Connect GitHub to read V1 and to save.</LocalNotice>
      )}
      <MetricGrid metrics={[
        { label: 'Presets', value: content ? content.presets.length : '…', detail: 'One per CV you send out', healthy: Boolean(content) && builds.every(build => build.tex) },
        { label: 'Library rows', value: library ? library.bullets.length + library.summaries.length + library.skills.length + library.interests.length : '…', detail: library ? `${library.bullets.length} bullets, ${library.entries.length} entries` : 'Reading the library' },
        { label: 'Problems', value: content ? content.issues.length : '…', detail: content?.issues.length ? 'Listed below' : 'None found', healthy: content ? !content.issues.length : false },
        { label: 'Source', value: content ? (content.mode === 'live' ? 'V1' : 'Bundled') : '…', detail: content?.mode === 'live' ? 'With pending edits' : 'Read-only copy' },
      ]} />
      <CvIssues issues={libraryIssues} title="The CV library has problems" />
      <section className="collection-section">
        <div className="section-heading">
          <div><span>Presets</span><h2>CVs</h2></div>
          {/* A span, not a div: `.section-heading > div > span` styles the eyebrow label. */}
          <span className="panel-heading-actions">
            <span>{builds.length} presets</span>
            <Button className="section-action-button" size="sm" disabled={!canCreate} onClick={() => setAdding(true)}><Plus aria-hidden="true" /> New CV</Button>
          </span>
        </div>
        <div className="page-registry-list">
          {builds.map(({ preset, problems, tex }) => (
            <article className="page-registry-row cv-preset-row" key={preset.id}>
              <Link className="page-registry-heading" to={`/cv/builder/${preset.id}`}>
                <span className="collection-icon"><FileText aria-hidden="true" /></span>
                <span>
                  <strong>{preset.name}</strong>
                  <small>{preset.filename} · {templates[preset.template]?.name ?? preset.template} · {preset.sections.length} sections{preset.pages ? ` · ${preset.pages}-page budget` : ''}{preset.prefer.length ? ` · prefers ${preset.prefer.join(', ')}` : ''}</small>
                </span>
                {tex
                  ? <span className="collection-meta"><CheckCircle2 aria-hidden="true" />Builds</span>
                  : <span className="collection-meta cv-meta-problem"><AlertTriangle aria-hidden="true" />{problems.length} {problems.length === 1 ? 'problem' : 'problems'}</span>}
                <ArrowUpRight aria-hidden="true" />
              </Link>
              <div className="page-section-links">
                <Link to={`/cv/builder/${preset.id}`}>Open in builder</Link>
                <Button variant="outline" size="sm" disabled={!tex} onClick={() => tex && downloadText(`${preset.filename}.tex`, tex)}><Download aria-hidden="true" />.tex</Button>
              </div>
              {problems.length > 0 && <CvIssues issues={problems} title={`${preset.name} cannot build`} />}
            </article>
          ))}
        </div>
      </section>
      <LocalNotice>PDFs build in the browser once compilation lands. Until then, <code>npm run cv:build -- --pdf</code> in <code>admin/</code> builds every preset.</LocalNotice>
      {adding && content && <NewPresetDialog presets={content.presets} saving={saving} onClose={() => setAdding(false)} onCreate={preset => void create(preset)} />}
    </>
  )
}
