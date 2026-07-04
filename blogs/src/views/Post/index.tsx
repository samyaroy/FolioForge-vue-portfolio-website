import { useParams } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { getPost } from '../../lib/posts'
import { formatDate } from '../../lib/format'
import { POST_COPY } from '../../content/sections'
import { NotFoundPage } from '../NotFound'

// Markdown styling: react-markdown emits bare elements, so every rule targets
// descendants of the wrapper via arbitrary variants.
const PROSE_CLASS = [
  'text-justify text-base leading-[1.8] text-muted',
  '[&>*:first-child]:mt-0',
  '[&_h2]:mt-11 [&_h2]:text-[2rem] [&_h2]:leading-[1.2] [&_h2]:font-bold [&_h2]:tracking-[-0.02em] [&_h2]:text-ink',
  '[&_h3]:mt-8 [&_h3]:text-xl [&_h3]:leading-[1.3] [&_h3]:font-bold [&_h3]:text-ink',
  '[&_img]:max-w-full [&_img]:rounded-xl [&_img]:shadow-[0_12px_32px_-4px_rgba(14,20,27,0.08)]',
  '[&_pre]:overflow-x-auto [&_pre]:rounded-xl [&_pre]:border [&_pre]:border-[rgba(15,23,42,0.08)] [&_pre]:bg-[#0e141b] [&_pre]:p-4 [&_pre]:text-left [&_pre]:text-[#e2e8f0]',
  '[&_code]:font-[ui-monospace,SFMono-Regular,Menlo,Consolas,monospace] [&_code]:text-[0.9em]',
  '[&_:not(pre)>code]:rounded-[0.3rem] [&_:not(pre)>code]:border [&_:not(pre)>code]:border-[#e2e8f0] [&_:not(pre)>code]:bg-[#f1f5f9] [&_:not(pre)>code]:px-[0.35rem] [&_:not(pre)>code]:py-[0.1rem] [&_:not(pre)>code]:text-ink',
  '[&_blockquote]:my-6 [&_blockquote]:border-l-[3px] [&_blockquote]:border-l-primary [&_blockquote]:bg-[rgba(219,234,254,0.28)] [&_blockquote]:py-1 [&_blockquote]:pl-4 [&_blockquote]:text-muted',
  '[&_table]:my-6 [&_table]:w-full [&_table]:border-collapse',
  '[&_th]:border [&_th]:border-border [&_th]:bg-surface-soft [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:text-ink',
  '[&_td]:border [&_td]:border-border [&_td]:px-3 [&_td]:py-2 [&_td]:text-left',
].join(' ')

export function PostPage() {
  const { slug } = useParams<{ slug: string }>()
  const post = slug ? getPost(slug) : undefined

  if (!post) {
    return <NotFoundPage />
  }

  return (
    <article className="mx-auto max-w-4xl">
      <header className="mb-10 text-center">
        <a
          className="mb-5 inline-flex text-xs leading-normal font-bold tracking-[0.16em] text-primary uppercase"
          href="/"
        >
          {POST_COPY.backToBlogs}
        </a>
        <h1 className="mb-4 text-4xl leading-[1.1] font-black tracking-[-0.033em] text-ink">
          {post.title}
        </h1>
        {post.date && (
          <time
            className="text-xs leading-normal font-bold tracking-[0.16em] text-faint uppercase"
            dateTime={post.date}
          >
            {formatDate(post.date)}
          </time>
        )}
      </header>
      <div className={PROSE_CLASS}>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.body}</ReactMarkdown>
      </div>
    </article>
  )
}
