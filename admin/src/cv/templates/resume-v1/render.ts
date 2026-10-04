import { escapeText, hrefTarget } from '../../latex/escape.ts'
import { markupToLatex, periodToLatex } from '../../latex/markup.ts'
import type { BuildInput, ResolvedItem, ResolvedLink, ResolvedSection, TemplateOptionValue } from '../../schema.ts'
import { skeleton } from './skeleton.ts'

/**
 * resume-v1's renderer: the resolved input drawn with the commands its skeleton
 * defines. Every authored string goes through `markupToLatex`, so nothing in the
 * content can become a command. The same input always gives the same text.
 */

const tex = markupToLatex

function period(item: ResolvedItem): string {
  return item.period ? periodToLatex(item.period) : ''
}

/** Option values are checked against the manifest's choices before they get here. */
function options(values: Readonly<Record<string, TemplateOptionValue>>): string {
  return [
    `\\newcommand{\\cvBulletSize}{\\${values.bullet_size}}`,
    `\\newcommand{\\cvBodySize}{\\${values.body_size}}`,
  ].join('\n')
}

function header(input: BuildInput): string {
  const fields = input.header.fields.map(field => {
    const target = field.href ? hrefTarget(field.href) : undefined
    return target ? `\\href{${target}}{\\underline{${escapeText(field.label)}}}` : escapeText(field.label)
  })
  return `\\cvHeader{${escapeText(input.header.name)}}{${fields.join(' $|$ ')}}`
}

/** `Repo: name` reads as the kind, then the linked name. */
function link({ url, label }: ResolvedLink): string {
  const colon = label.indexOf(': ')
  const [kind, name] = colon > 0 ? [label.slice(0, colon + 2), label.slice(colon + 2)] : ['', label]
  const target = hrefTarget(url)
  const linked = target ? `\\href{${target}}{\\underline{${escapeText(name)}}}` : escapeText(name)
  return `\\cvLink{${escapeText(kind)}${linked}}`
}

function bulletLines(item: ResolvedItem, start: string, bullet: string, end: string): string[] {
  const lines = item.lead ? [`  \\cvLead{${tex(item.lead)}}`] : []
  if (!item.bullets.length) return lines
  return [...lines, `  \\${start}`, ...item.bullets.map(text => `    \\${bullet}{${tex(text)}}`), `  \\${end}`]
}

/**
 * Headed entries. Consecutive entries at the same place share one heading, the
 * way the CVs list an internship under the employer it led to.
 */
function headed(items: ResolvedItem[], command: 'cvHeading' | 'cvPositionHeading'): string[] {
  const lines = ['\\cvEntriesStart']
  items.forEach((item, index) => {
    const previous = items[index - 1]
    if (previous && previous.title === item.title && previous.location === item.location) {
      lines.push(`  \\cvSubHeading{${tex(item.subtitle ?? '')}}{${period(item)}}`)
    } else {
      lines.push(`  \\${command}{${tex(item.title)}}{${tex(item.location ?? '')}}{${tex(item.subtitle ?? '')}}{${period(item)}}`)
    }
    if (item.coursework) lines.push(`  \\cvNote{\\textbf{Relevant Coursework:} ${tex(item.coursework)}}`)
    lines.push(...bulletLines(item, 'cvBulletsStart', 'cvBullet', 'cvBulletsEnd'))
  })
  return [...lines, '\\cvEntriesEnd']
}

function projects(items: ResolvedItem[]): string[] {
  const lines = ['\\cvEntriesStart']
  for (const item of items.filter(project => project.style === 'full')) {
    const rows = [`\\cvProjectTitle{${tex(item.title)}${item.subtitle ? ':' : ''}}`]
    if (item.subtitle) rows.push(`\\cvProjectSubtitle{${tex(item.subtitle)}}`)
    const meta = `${item.tech ? `\\cvStack{${tex(item.tech)}}` : ''}${item.link ? link(item.link) : ''}`
    if (meta || item.period) rows.push(`\\cvProjectMeta{${meta}}{${period(item)}}`)
    lines.push('  \\cvProject{%', ...rows.map(row => `    ${row}%`), '  }')
    if (item.context) lines.push(`  \\cvContext{${tex(item.context)}}`)
    lines.push(...bulletLines(item, 'cvProjectBulletsStart', 'cvProjectBullet', 'cvProjectBulletsEnd'))
  }

  const compact = items.filter(project => project.style === 'compact')
  if (compact.length) {
    lines.push('  \\cvCompactStart{Other Projects:}')
    for (const item of compact) {
      const parts = [tex(item.title)]
      if (item.tech) parts.push(`\\emph{\\footnotesize ${tex(item.tech)}}`)
      if (item.context) parts.push(`{\\scriptsize ${tex(item.context)}}`)
      lines.push(`    \\cvCompact{${parts.join(' $|$ ')}}{${period(item)}}`)
    }
    lines.push('  \\cvCompactEnd')
  }
  return [...lines, '\\cvEntriesEnd']
}

function section(section: ResolvedSection): string[] {
  const heading = `\\section{${escapeText(section.title)}}`
  switch (section.kind) {
    case 'summary':
      return [heading, `\\cvSummary{${tex(section.text)}}`]
    case 'skills':
      return [heading, '\\cvSkillsStart', section.rows.map(row => `  \\cvSkill{${tex(row.label)}}{${tex(row.text)}}`).join(' \\\\\n'), '\\cvSkillsEnd']
    case 'interests':
      return [heading, '\\cvInterestsStart', ...section.items.map(item => `  \\cvInterest{${tex(item)}}`), '\\cvInterestsEnd']
    case 'projects':
      return [heading, ...projects(section.items)]
    case 'positions':
      return [heading, ...headed(section.items, 'cvPositionHeading')]
    default:
      return [heading, ...headed(section.items, 'cvHeading')]
  }
}

export function renderResumeV1(input: BuildInput): string {
  const body = ['\\cvBodySize', ...input.sections.flatMap(entry => ['', ...section(entry)])].join('\n')
  // Replaced through functions: LaTeX is full of `$`, which a replacement
  // string would read as a pattern.
  return skeleton
    .replace('{{OPTIONS}}', () => options(input.template.options))
    .replace('{{HEADER}}', () => header(input))
    .replace('{{BODY}}', () => body)
}
