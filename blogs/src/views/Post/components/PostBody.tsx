import type { ComponentProps } from 'react'
import type { Element } from 'hast'
import ReactMarkdown, { type Components, type ExtraProps } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { sectionNumbersByLine } from '../../../lib/markdown'

// react-markdown emits bare elements, so every rule here targets a descendant
// of the wrapper via an arbitrary variant. `h2` and `pre` are missing on
// purpose: both are rendered by the components below, which carry their own
// classes.
const PROSE_CLASS = [
  // Justified from the small breakpoint up, matching the rest of the site.
  // Below it the measure is too narrow to justify without opening rivers, so
  // the text is ragged-right there instead. The type steps up once the body
  // spans the full pane, so the longer line does not also get smaller.
  'text-left hyphens-auto text-base leading-[1.8] text-muted sm:text-justify lg:text-[1.0625rem] lg:leading-[1.85]',
  '[&>*:first-child]:mt-0',
  // Tailwind's preflight zeroes every margin, so block spacing is set here.
  '[&_p]:mt-6 [&_ul]:mt-6 [&_ol]:mt-6 [&_figure]:mt-7',
  '[&_h3]:mt-9 [&_h3]:mb-3 [&_h3]:text-xl [&_h3]:leading-[1.3] [&_h3]:font-bold [&_h3]:text-ink',
  '[&_a]:underline [&_a]:decoration-primary/35 [&_a]:underline-offset-[3px] [&_a:hover]:decoration-primary',
  '[&_strong]:font-semibold [&_strong]:text-ink',
  '[&_img]:max-w-full [&_img]:rounded-xl [&_img]:shadow-[0_12px_32px_-4px_rgba(14,20,27,0.08)]',
  '[&_code]:font-mono [&_code]:text-[0.9em]',
  '[&_:not(pre)>code]:rounded-[0.3rem] [&_:not(pre)>code]:border [&_:not(pre)>code]:border-border [&_:not(pre)>code]:bg-[#f1f5f9] [&_:not(pre)>code]:px-[0.35rem] [&_:not(pre)>code]:py-[0.1rem] [&_:not(pre)>code]:text-ink',
  // Bullets and numbers are also a preflight casualty; task lists opt back out.
  '[&_ul]:list-disc [&_ol]:list-decimal [&_ul]:pl-6 [&_ol]:pl-6 [&_li]:mt-2 [&_li]:text-left',
  '[&_.contains-task-list]:list-none [&_.contains-task-list]:pl-0 [&_.task-list-item]:flex [&_.task-list-item]:items-baseline [&_.task-list-item]:gap-2',
  '[&_blockquote]:my-7 [&_blockquote]:border-l-2 [&_blockquote]:border-l-primary [&_blockquote]:pl-5 [&_blockquote]:text-left [&_blockquote]:italic [&_blockquote]:text-[#4b5563]',
  '[&_table]:my-7 [&_table]:w-full [&_table]:border-collapse [&_table]:text-sm',
  '[&_th]:border [&_th]:border-border [&_th]:bg-surface-soft [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:text-ink',
  '[&_td]:border [&_td]:border-border [&_td]:px-3 [&_td]:py-2 [&_td]:text-left',
  '[&_hr]:my-10 [&_hr]:border-t [&_hr]:border-border',
].join(' ')

const LABEL_CLASS =
  'text-[10px] leading-none font-bold tracking-[0.16em] uppercase'

function isElement(node: unknown): node is Element {
  return (node as Element | undefined)?.type === 'element'
}

/**
 * Language and file name for a fenced block. The file name is the fence's info
 * string past the language — ```` ```ts src/lib/posts.ts ```` — which
 * remark-rehype parks on the `<code>` node as `data.meta`.
 */
function fenceInfo(pre: Element | undefined) {
  const code = pre?.children.find(
    (child) => isElement(child) && child.tagName === 'code',
  )
  const names = isElement(code) ? code.properties.className : undefined
  const language = (Array.isArray(names) ? names.map(String) : [])
    .find((name) => name.startsWith('language-'))
    ?.slice('language-'.length)
  const meta = isElement(code) ? code.data?.meta : undefined

  return { language, fileName: typeof meta === 'string' ? meta.trim() : '' }
}

/**
 * Fenced code, in a titled window. The header names the file when the fence
 * gives one and falls back to the language, so a plain ```ts fence still gets
 * a label instead of an unmarked slab.
 */
function CodeWindow({ node, children, className, ...rest }: ComponentProps<'pre'> & ExtraProps) {
  const { language, fileName } = fenceInfo(node)
  const title = fileName || language

  return (
    <figure className="mt-7 overflow-hidden rounded-xl border border-[rgba(15,23,42,0.08)] bg-[#0e141b] shadow-[0_12px_32px_-4px_rgba(14,20,27,0.14)]">
      {title && (
        <figcaption
          className={`flex items-center justify-between gap-4 border-b border-white/10 px-4 py-2.5 text-[#94a3b8] ${LABEL_CLASS}`}
        >
          <span className="truncate">{title}</span>
          {fileName && language && (
            <span className="shrink-0 text-[#64748b]">{language}</span>
          )}
        </figcaption>
      )}
      <pre
        className={`overflow-x-auto px-4 py-4 text-left text-[0.8125rem] leading-[1.8] text-[#e2e8f0] ${className ?? ''}`}
        {...rest}
      >
        {children}
      </pre>
    </figure>
  )
}

/**
 * `##` headings, numbered down the post. The counter comes from the markdown
 * source rather than a render-time tally, so React is free to re-render a
 * heading on its own without the numbers drifting.
 */
function sectionHeading(numbers: Map<number, number>) {
  return function SectionHeading({
    node,
    children,
    ...rest
  }: ComponentProps<'h2'> & ExtraProps) {
    const number = numbers.get(node?.position?.start.line ?? 0)

    return (
      <h2
        className="mt-14 mb-4 flex items-baseline gap-3 text-2xl leading-tight font-bold tracking-[-0.02em] text-balance text-ink lg:text-[2rem]"
        {...rest}
      >
        {number !== undefined && (
          <span className={`shrink-0 text-primary ${LABEL_CLASS}`} aria-hidden="true">
            {String(number).padStart(2, '0')}
          </span>
        )}
        <span>{children}</span>
      </h2>
    )
  }
}

type PostBodyProps = {
  markdown: string
}

export function PostBody({ markdown }: PostBodyProps) {
  const components: Components = {
    h2: sectionHeading(sectionNumbersByLine(markdown)),
    pre: CodeWindow,
  }

  return (
    <div className={PROSE_CLASS}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {markdown}
      </ReactMarkdown>
    </div>
  )
}
