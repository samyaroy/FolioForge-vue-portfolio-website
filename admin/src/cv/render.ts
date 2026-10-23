import { sha256 } from './hash.ts'
import type { BuildInput } from './schema.ts'
import { renderResumeV1 } from './templates/resume-v1/render.ts'
import { skeleton as resumeV1Skeleton } from './templates/resume-v1/skeleton.ts'

/**
 * The drawing half of each template, kept apart from the manifests in
 * ./templates/index.ts so that validating content never loads LaTeX.
 */
type TemplateRenderer = { skeleton: string; render: (input: BuildInput) => string }

const renderers: Readonly<Record<string, TemplateRenderer>> = {
  'resume-v1': { skeleton: resumeV1Skeleton, render: renderResumeV1 },
}

/** The `.tex` for a resolved build input, drawn by the template it names. */
export function renderTex(input: BuildInput): string {
  const renderer = Object.hasOwn(renderers, input.template.id) ? renderers[input.template.id] : undefined
  if (!renderer) throw new Error(`No renderer for the template "${input.template.id}".`)
  return renderer.render(input)
}

/** Each template's skeleton hash, which a build input records so a template edit marks builds outdated. */
export async function templateHashes(): Promise<Record<string, string>> {
  const entries = await Promise.all(Object.entries(renderers).map(async ([id, renderer]) => [id, await sha256(renderer.skeleton)] as const))
  return Object.fromEntries(entries)
}
