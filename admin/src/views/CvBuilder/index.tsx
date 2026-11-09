import { useEffect, useMemo, useRef, useState } from 'react'
import { RotateCcw, Save } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { LocalNotice } from '@/components/admin/LocalNotice'
import { PageHeader } from '@/components/admin/PageHeader'
import { CompilePanel } from '@/components/cv/CompilePanel'
import { CvIssues } from '@/components/cv/CvIssues'
import { PresetEditor } from '@/components/cv/PresetEditor'
import type { TexEditorHandle } from '@/components/cv/TexEditor'
import { TexSource, type TexOverride } from '@/components/cv/TexSource'
import { Button, SelectField } from '@/components/form'
import { entryIds } from '@/cv/collections'
import { presetRow } from '@/cv/editing'
import { canonicalJson, inputHash } from '@/cv/hash'
import { renderTex } from '@/cv/render'
import { resolvePreset, type ResolveContext } from '@/cv/resolve'
import type { BuildInput, CvIssue, CvPreset } from '@/cv/schema'
import { templates } from '@/cv/templates'
import { validateCv } from '@/cv/validate'
import { useCvCompile, type CompileMode } from '@/hooks/useCvCompile'
import { useCvContent, type CvContent } from '@/hooks/useCvContent'
import { saveEntry } from '@/services/content'

type Build = { input: BuildInput; tex: string } | { issues: CvIssue[] }

/**
 * The CV builder: configuration, the LaTeX it generates, and the compiled PDF,
 * side by side, after Overleaf. The page reads the content; the workspace below holds the
 * draft, and is remounted whenever the preset it was opened on changes, so a
 * reload after saving starts it again from what was saved.
 */
export function CvBuilderPage() {
  const { presetId } = useParams()
  const { content, reload } = useCvContent()
  const original = content?.presets.find(preset => preset.id === presetId) ?? content?.presets[0]

  if (!content) return <PageHeader title="CV Builder" description="Reading the CV content…" />
  if (!content.context || !original) {
    return (
      <>
        <PageHeader title="CV Builder" description="The CV content could not be read." />
        <CvIssues issues={content.issues} title="Fix the CV library before building" />
      </>
    )
  }
  return <BuilderWorkspace key={`${original.id}:${canonicalJson(presetRow(original))}`} content={content} context={content.context} original={original} reload={reload} />
}

type WorkspaceProps = { content: CvContent; context: ResolveContext; original: CvPreset; reload: () => void }

function BuilderWorkspace({ content, context, original, reload }: WorkspaceProps) {
  const navigate = useNavigate()
  const [draft, setDraft] = useState<CvPreset>(() => structuredClone(original))
  const [hash, setHash] = useState('')
  const [saving, setSaving] = useState(false)
  const [override, setOverride] = useState<TexOverride | null>(null)
  const [mode, setMode] = useState<CompileMode>('manual')
  const editor = useRef<TexEditorHandle>(null)

  const build = useMemo((): Build => {
    const portfolio = new Map([...context.portfolio].map(([collection, entries]) => [collection, entryIds(entries)]))
    const presets = content.presets.map(preset => (preset.id === original.id ? draft : preset))
    const issues = validateCv({ library: context.library, presets, templates, portfolio })
      .filter(issue => issue.path.startsWith('library.yml') || issue.path.startsWith(`presets.yml/presets/${draft.id}`))
    if (issues.length) return { issues }
    try {
      const input = resolvePreset(draft, context)
      return { input, tex: renderTex(input) }
    } catch (error) {
      return { issues: [{ path: `presets.yml/presets/${draft.id}`, message: error instanceof Error ? error.message : 'Could not be built.' }] }
    }
  }, [content, context, draft, original])

  useEffect(() => {
    if ('input' in build) void inputHash(build.input).then(setHash)
  }, [build])

  const generated = 'tex' in build ? build.tex : null
  const source = override?.text ?? generated
  const compile = useCvCompile(source, mode)
  // Marked only while they still describe the source on screen.
  const errorLines = useMemo(
    () => (compile.result && compile.compiledTex === source ? compile.result.parsed.errors.flatMap(error => (error.line === null ? [] : [error.line])) : []),
    [compile.result, compile.compiledTex, source],
  )

  const dirty = canonicalJson(presetRow(draft)) !== canonicalJson(presetRow(original))
  const canSave = content.mode === 'live' && Boolean(content.presetsBaseSha)

  const save = async () => {
    if (!canSave) {
      toast.info('GitHub is not connected, so this preset cannot be saved.')
      return
    }
    setSaving(true)
    try {
      const pending = await saveEntry('cv/presets', content.presets.indexOf(original), presetRow(draft), content.presetsBaseSha)
      toast.success(`${draft.name} saved. ${pending} ${pending === 1 ? 'file is' : 'files are'} waiting to publish.`)
      reload()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'The preset could not be saved.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <PageHeader
        title="CV Builder"
        description="Choose what a CV shows. The LaTeX follows every change and compiles beside it; Save queues the preset to publish to V1."
        actions={(
          <>
            <SelectField prefix="Preset" value={original.id} onChange={id => navigate(`/cv/builder/${id}`)} options={content.presets.map(preset => ({ value: preset.id, label: preset.name }))} />
            <Button variant="outline" disabled={!dirty || saving} onClick={() => setDraft(structuredClone(original))}><RotateCcw aria-hidden="true" />Discard</Button>
            <Button disabled={!dirty || saving || 'issues' in build} onClick={() => void save()}><Save aria-hidden="true" />{saving ? 'Saving…' : 'Save'}</Button>
          </>
        )}
        status={(
          <span className="cv-status">
            <span className={dirty ? 'cv-chip cv-chip-warn' : 'cv-chip cv-chip-ok'}>{dirty ? 'Unsaved changes' : 'Saved'}</span>
            <span className={'tex' in build ? 'cv-chip cv-chip-ok' : 'cv-chip cv-chip-warn'}>{'tex' in build ? 'Generates' : 'Has problems'}</span>
            {compile.result && (
              <span className={compile.result.outcome === 'ok' && !compile.outdated ? 'cv-chip cv-chip-ok' : 'cv-chip cv-chip-warn'}>
                {compile.outdated ? 'Preview outdated' : compile.result.outcome === 'ok' ? 'Compiles' : compile.result.outcome === 'errors' ? 'Built with errors' : 'Build failed'}
              </span>
            )}
          </span>
        )}
      />
      {content.mode === 'bundled' && <LocalNotice>Showing the CV content bundled with this build ({content.notice}). Changes here are not saved; connect GitHub to save.</LocalNotice>}
      {'issues' in build && <CvIssues issues={build.issues} />}
      <div className="cv-builder">
        <PresetEditor preset={draft} onChange={setDraft} context={context} />
        <TexSource generated={generated} override={override} onOverride={setOverride} filename={draft.filename} errorLines={errorLines} onCompile={compile.compile} editorRef={editor} />
        <CompilePanel
          compile={compile}
          mode={mode}
          onModeChange={setMode}
          canCompile={source !== null}
          filename={draft.filename}
          budget={draft.pages}
          outline={'input' in build ? { input: build.input, hash } : null}
          onGoToLine={line => editor.current?.goToLine(line)}
        />
      </div>
    </>
  )
}
