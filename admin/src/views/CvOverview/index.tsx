import { useMemo } from 'react'
import { AlertTriangle, ArrowUpRight, CheckCircle2, Download, FileText } from 'lucide-react'
import { Link } from 'react-router-dom'
import { LocalNotice } from '@/components/admin/LocalNotice'
import { MetricGrid } from '@/components/admin/MetricGrid'
import { PageHeader } from '@/components/admin/PageHeader'
import { CvIssues } from '@/components/cv/CvIssues'
import { Button } from '@/components/form'
import { downloadText } from '@/lib/download'
import { renderTex } from '@/cv/render'
import { resolvePreset } from '@/cv/resolve'
import { templates } from '@/cv/templates'
import { useCvContent } from '@/hooks/useCvContent'

/** Every CV preset, whether it builds, and its .tex one click away. */
export function CvOverviewPage() {
  const { content } = useCvContent()

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
        <div className="section-heading"><div><span>Presets</span><h2>CVs</h2></div><span>{builds.length} presets</span></div>
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
    </>
  )
}
