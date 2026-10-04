import { SECTION_KINDS, type TemplateManifest, type TemplateOptionValue } from '../schema.ts'

/**
 * Every layout a preset may name. A template is a manifest here and, beside it,
 * its LaTeX skeleton and section renderers. Adding one is adding an entry: the
 * content model, and every preset that doesn't choose it, stay as they are. A
 * template that needs XeLaTeX says so in `engine`, and the builder loads that
 * engine instead.
 */

/** Jake's Resume as the Consolidated CV sets it. */
export const resumeV1 = {
  id: 'resume-v1',
  name: 'Resume',
  description: "Jake's Resume as the Consolidated CV sets it: letter paper, small-caps section rules, two-column item headings.",
  version: 1,
  engine: 'pdftex',
  paper: 'letter',
  sections: {
    kinds: SECTION_KINDS,
    styles: { projects: ['full', 'compact'] },
  },
  options: {
    // The Consolidated CV sets bullets in \footnotesize and everything after the
    // header in \small; the six older files used \small and the normal size.
    bullet_size: { type: 'choice', label: 'Bullet text size', choices: ['footnotesize', 'small'], default: 'footnotesize' },
    body_size: { type: 'choice', label: 'Body text size', choices: ['small', 'normalsize'], default: 'small' },
  },
} as const satisfies TemplateManifest

export const templates: Readonly<Record<string, TemplateManifest>> = {
  [resumeV1.id]: resumeV1,
}

/** A preset's options laid over the template's defaults: what the template renders with. */
export function resolveTemplateOptions(
  template: TemplateManifest,
  chosen: Readonly<Record<string, TemplateOptionValue>>,
): Record<string, TemplateOptionValue> {
  return Object.fromEntries(
    Object.entries(template.options).map(([name, option]) => [name, Object.hasOwn(chosen, name) ? chosen[name] : option.default]),
  )
}
