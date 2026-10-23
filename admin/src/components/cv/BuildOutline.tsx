import { FileText } from 'lucide-react'
import { InlineMarkup } from '@/components/InlineMarkup'
import type { BuildInput, ResolvedItem } from '@/cv/schema'

/** Authored markup as a reader sees it here: emphasis drawn, links and names as their words. */
function Text({ value }: { value: string }) {
  const plain = value.replace(/`([^`]+)`/g, '$1').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/\s*@see\[[^\]]+\]\([^)]*\)\s*$/, '')
  return <InlineMarkup text={plain} />
}

function Item({ item, project }: { item: ResolvedItem; project: boolean }) {
  return (
    <li className="cv-outline-item">
      <div className="cv-outline-heading">
        <strong><Text value={item.title} />{project && item.subtitle ? ':' : ''}</strong>
        {item.period && <span>{item.period}</span>}
      </div>
      {item.subtitle && <p className="cv-outline-sub"><Text value={item.subtitle} /></p>}
      {(item.tech || item.context) && <p className="cv-outline-meta">{[item.tech, item.context].filter(Boolean).map((part, index) => <span key={index}><Text value={part ?? ''} /></span>)}</p>}
      {item.coursework && <p className="cv-outline-meta">Relevant coursework: <Text value={item.coursework} /></p>}
      {item.lead && <p className="cv-outline-lead">– <Text value={item.lead} /></p>}
      {item.bullets.length > 0 && <ul>{item.bullets.map((bullet, index) => <li key={index}><Text value={bullet} /></li>)}</ul>}
    </li>
  )
}

/**
 * What the preset will print, section by section, with every variant chosen.
 * It is a content check, not a preview: the layout is the template's, and the
 * PDF arrives with browser compilation.
 */
export function BuildOutline({ input, hash }: { input: BuildInput; hash: string }) {
  return (
    <section className="cv-panel cv-outline" aria-label="What this CV prints">
      <div className="cv-panel-heading">
        <div><span>Content check</span><h2>What this CV prints</h2></div>
        <span className="cv-hash" title={hash}>{hash.slice(7, 19)}</span>
      </div>
      <div className="cv-outline-body">
        <header>
          <h3>{input.header.name}</h3>
          <p>{input.header.fields.map(field => field.label).join(' | ')}</p>
        </header>
        {input.sections.map((section, index) => (
          <section key={index}>
            <h4>{section.title}</h4>
            {section.kind === 'summary' && <p><Text value={section.text} /></p>}
            {section.kind === 'skills' && <ul className="cv-outline-plain">{section.rows.map(row => <li key={row.label}><strong>{row.label}:</strong> <Text value={row.text} /></li>)}</ul>}
            {section.kind === 'interests' && <p>{section.items.join(' · ')}</p>}
            {'items' in section && section.kind !== 'interests' && (
              <ul className="cv-outline-items">{section.items.map(item => <Item key={item.key} item={item} project={section.kind === 'projects'} />)}</ul>
            )}
          </section>
        ))}
      </div>
      <p className="cv-panel-foot"><FileText aria-hidden="true" />The PDF preview comes with browser compilation. Until then, <code>npm run cv:build -- --pdf</code> builds it.</p>
    </section>
  )
}
